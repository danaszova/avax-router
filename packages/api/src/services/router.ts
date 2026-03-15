import { ethers, JsonRpcProvider, Contract } from 'ethers';
import { logger } from '../utils/logger';
import { getBestQuote } from './dex-apis';
import { getMultiHopBestQuote } from './multiHop';
import { getPangolinDirectQuote } from './pangolin';

// ABI for our deployed adapters
const ADAPTER_ABI = [
  'function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut)',
  'function dexName() external pure returns (string memory)',
  'function hasPool(address tokenIn, address tokenOut) external view returns (bool)',
];

const DEX_ROUTER_ABI = [
  'function getQuote(string memory dexName, address tokenIn, address tokenOut, uint256 amountIn) external view returns (tuple(uint256 amountOut, uint256 priceImpact, address[] path) memory)',
  'function getRegisteredDexes() external view returns (string[] memory)',
];

// Token addresses - REAL WORKING ADDRESSES (matching dex-apis.ts)
// Note: The commonly cited WAVAX (0xB31f66Aa3C1ee3B4...) has NO CODE!
const TOKENS = {
  WAVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // Working WAVAX
  USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',  // USDC
  USDT: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',  // USDT
  DAI: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',   // DAI
  WBTC: '0x50b7545627a5162f82a992c33b87adc75187b218',  // WBTC
  WETH: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',  // WETH
};

export interface Quote {
  dex: string;
  amountOut: bigint;
  priceImpact: number;
  route: string[];
  estimatedGas: bigint;
}

export interface BestRoute extends Quote {
  savings: number;
  allQuotes: { dex: string; amountOut: string }[];
}

export class RouterService {
  private provider: JsonRpcProvider;
  private dexRouter: Contract;
  private adapters: Map<string, Contract> = new Map();

  constructor() {
    const rpcUrl = process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc';
    this.provider = new JsonRpcProvider(rpcUrl);

    // Use our deployed DexRouter (NEW DEPLOYMENT - March 2026)
    const dexRouterAddress = process.env.DEX_ROUTER_ADDRESS || '0xf081117ccd2f0079f1d08B27cB9AcB2D946fDe35';
    this.dexRouter = new Contract(dexRouterAddress, DEX_ROUTER_ABI, this.provider);

    // Initialize adapters (using TraderJoe V1 which has real liquidity)
    const tjV1AdapterAddress = process.env.TRADER_JOE_V1_ADAPTER_ADDRESS || '0xCAe369BE4c20DcA243710fB84Cd3C99Ce895f11c';

    this.adapters.set('TraderJoeV1', new Contract(tjV1AdapterAddress, ADAPTER_ABI, this.provider));
    this.adapters.set('TraderJoeV2', new Contract(tjV1AdapterAddress, ADAPTER_ABI, this.provider)); // Alias for compatibility
  }

  /**
   * Get a quote from a specific DEX using our adapters
   */
  async getQuote(
    dex: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
  ): Promise<Quote> {
    const adapter = this.adapters.get(dex);
    if (!adapter) {
      throw new Error(`Unknown DEX: ${dex}`);
    }

    try {
      const amountOut = await adapter.getAmountOut(tokenIn, tokenOut, amountIn);

      // Calculate price impact (simplified - would need more data in real implementation)
      const priceImpact = 0.5; // 0.5% default

      return {
        dex,
        amountOut: amountOut,  // Keep as bigint, will be stringified in route
        priceImpact,
        route: [tokenIn, tokenOut],
        estimatedGas: dex === 'TraderJoeV2' ? BigInt(150000) : BigInt(120000),
      };
    } catch (error: any) {
      const errorMsg = error?.message || error?.reason || String(error);
      logger.error(`${dex} quote error: ${errorMsg}`);
      throw new Error(`Failed to get ${dex} quote: ${errorMsg}`);
    }
  }

  /**
   * Find the best route across all DEXes.
   * First tries the on-chain DexRouter contract. If that fails (e.g. pair not
   * supported by the deployed adapter), falls back to direct TJ V1 Router
   * queries that support multi-hop through WAVAX/USDC/USDT.
   */
  async findBestRoute(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
  ): Promise<BestRoute> {
    // --- Primary: try the on-chain DexRouter contract ---
    try {
      const bestQuote = await getBestQuote(tokenIn, tokenOut, amountIn);

      return {
        dex: bestQuote.bestDex,
        amountOut: BigInt(bestQuote.amountOut),
        priceImpact: bestQuote.priceImpact,
        route: bestQuote.route,
        estimatedGas: bestQuote.bestDex === 'TraderJoeV2' ? BigInt(150000) : BigInt(120000),
        savings: 0,
        allQuotes: bestQuote.allQuotes.map(q => ({
          dex: q.dex,
          amountOut: q.amountOut,
        })),
      };
    } catch (contractError) {
      logger.warn('On-chain DexRouter failed, falling back to direct multi-hop routing:', contractError);
    }

    // --- Fallback: query TraderJoe V1 Router directly (supports multi-hop) ---
    try {
      const hopQuote = await getMultiHopBestQuote(tokenIn, tokenOut, amountIn);
      logger.info(`Multi-hop fallback succeeded: ${hopQuote.hops}-hop via ${hopQuote.route.join(' → ')}`);

      // ALSO fetch a direct Pangolin quote for comparison to prove Aggregator works
      const pangolinQuote = await getPangolinDirectQuote(tokenIn, tokenOut, amountIn);
      const allQuotes = [{
        dex: `${hopQuote.dex} (${hopQuote.hops}-hop)`,
        amountOut: hopQuote.amountOut.toString(),
      }];

      if (pangolinQuote) {
        allQuotes.push({
          dex: pangolinQuote.dex,
          amountOut: pangolinQuote.amountOut.toString(),
        });
      }

      // Find the actual best between the two
      let finalDex = hopQuote.dex;
      let finalAmount = hopQuote.amountOut;
      let finalRoute = hopQuote.route;

      if (pangolinQuote && pangolinQuote.amountOut > hopQuote.amountOut) {
        finalDex = pangolinQuote.dex;
        finalAmount = pangolinQuote.amountOut;
        finalRoute = [tokenIn, tokenOut];
        logger.info(`Pangolin actually had a better price! Redirecting...`);
      }

      return {
        dex: finalDex,
        amountOut: finalAmount,
        priceImpact: hopQuote.priceImpact,
        route: finalRoute,
        estimatedGas: hopQuote.estimatedGas,
        savings: 0,
        allQuotes,
      };
    } catch (hopError) {
      logger.error('Multi-hop fallback also failed:', hopError);
      throw new Error('No valid quotes found from any DEX or route');
    }
  }

  /**
   * Compare quotes across all DEXes
   */
  async compareAllDexes(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
  ): Promise<{
    quotes: { dex: string; amountOut: string; priceImpact: number }[];
    best: { dex: string; amountOut: string };
    worst: { dex: string; amountOut: string };
    spread: number;
  }> {
    const route = await this.findBestRoute(tokenIn, tokenOut, amountIn);

    const sortedQuotes = [...route.allQuotes].sort((a, b) =>
      BigInt(b.amountOut) > BigInt(a.amountOut) ? 1 : -1
    );

    const best = sortedQuotes[0];
    const worst = sortedQuotes[sortedQuotes.length - 1];

    const bestAmount = BigInt(best.amountOut);
    const worstAmount = BigInt(worst.amountOut);
    const spread = Number(bestAmount - worstAmount) / Number(bestAmount) * 100;

    return {
      quotes: sortedQuotes.map(q => ({
        dex: q.dex,
        amountOut: q.amountOut,
        priceImpact: 0, // Would need to fetch from individual quotes
      })),
      best: { dex: best.dex, amountOut: best.amountOut },
      worst: { dex: worst.dex, amountOut: worst.amountOut },
      spread,
    };
  }

  /**
   * Get supported tokens list
   */
  getSupportedTokens() {
    return Object.entries(TOKENS).map(([symbol, address]) => ({
      symbol,
      address,
    }));
  }
}