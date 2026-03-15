/**
 * Real DEX API integrations for quotes
 * Queries the on-chain DexRouter contract for live quotes
 */

import { ethers } from 'ethers';

// Token addresses - VERIFIED OFFICIAL ADDRESSES on Avalanche C-Chain
// WAVAX: 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7 (official Wrapped AVAX)
export const TOKENS: Record<string, string> = {
  // === Native/Stablecoins ===
  AVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase(),
  WAVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase(),
  USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'.toLowerCase(),  // Circle USDC
  USDT: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'.toLowerCase(), // Tether USDT
  DAI: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70'.toLowerCase(),   // Maker DAI
  USDC_E: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664'.toLowerCase(), // Bridged USDC.e

  // === Major Cryptos ===
  WBTC: '0x50b7545627a5162f82a992c33b87adc75187b218'.toLowerCase(),  // Wrapped BTC
  WETH: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab'.toLowerCase(),  // Wrapped ETH
  BTC_B: '0x152b9d0FdC40C096757F570A51E494bd4b943E50'.toLowerCase(),  // Bitcoin.b
  COQ: '0x420FcA0121DC28039145009570975747295f2329'.toLowerCase(),   // Coq Inu

  // === Avalanche DeFi ===
  JOE: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd'.toLowerCase(),   // TraderJoe
  PNG: '0x60781C2586D68229fde47564546784ab3fACA982'.toLowerCase(),   // Pangolin
  QI: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5'.toLowerCase(),    // Benqi
  sAVAX: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE'.toLowerCase(), // Benqi sAVAX
  yyAVAX: '0x5c49b268c9841a1c4964403996b92d7145938e3a'.toLowerCase(), // Yield Yak AVAX

  // === Blue Chips ===
  LINK: '0x5947bb275c521040051d82396192181b413227a3'.toLowerCase(),  // Chainlink
  GMX: '0x62edc0692BD897D2295872a9FFCac5425011c661'.toLowerCase(),   // GMX
  AAVE: '0x63a72806098Bd3D9520cC43356dD78afe5D386D1'.toLowerCase(),  // Aave
  FRAX: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64'.toLowerCase(),  // Frax
  CRV: '0x47536F17F4fF30e64A96a7555826b8f9e66ec468'.toLowerCase(),   // Curve

  // === Meme/Viral ===
  KIMBO: '0x8e9226eDcA6B7Fdf5b52D8F2937A632F36B0a1F9'.toLowerCase(), // Kimbo
};

export const TOKEN_METADATA: Record<string, { decimals: number }> = {
  // Native/Stablecoins
  [TOKENS.AVAX]: { decimals: 18 },
  [TOKENS.WAVAX]: { decimals: 18 },
  [TOKENS.USDC]: { decimals: 6 },
  [TOKENS.USDT]: { decimals: 6 },
  [TOKENS.DAI]: { decimals: 18 },
  [TOKENS.USDC_E]: { decimals: 6 },
  // Major Cryptos
  [TOKENS.WBTC]: { decimals: 8 },
  [TOKENS.WETH]: { decimals: 18 },
  [TOKENS.BTC_B]: { decimals: 8 },
  [TOKENS.COQ]: { decimals: 18 },
  // Avalanche DeFi
  [TOKENS.JOE]: { decimals: 18 },
  [TOKENS.PNG]: { decimals: 18 },
  [TOKENS.QI]: { decimals: 18 },
  [TOKENS.sAVAX]: { decimals: 18 },
  [TOKENS.yyAVAX]: { decimals: 18 },
  // Blue Chips
  [TOKENS.LINK]: { decimals: 18 },
  [TOKENS.GMX]: { decimals: 18 },
  [TOKENS.AAVE]: { decimals: 18 },
  [TOKENS.FRAX]: { decimals: 18 },
  [TOKENS.CRV]: { decimals: 18 },
  // Meme
  [TOKENS.KIMBO]: { decimals: 18 },
};

// Helper to get checksummed address
export function getTokenAddress(symbol: string): string {
  const addr = TOKENS[symbol.toUpperCase()];
  if (!addr) throw new Error(`Unknown token: ${symbol}`);
  return ethers.getAddress(addr);
}

// Helper to get token decimals
export function getTokenDecimals(address: string): number {
  const metadata = TOKEN_METADATA[address.toLowerCase()];
  return metadata ? metadata.decimals : 18;
}

// DexRouter contract (NEW DEPLOYMENT - March 2026)
const DEX_ROUTER_ADDRESS = '0xf081117ccd2f0079f1d08B27cB9AcB2D946fDe35';

const DEX_ROUTER_ABI = [
  "function getRegisteredDexes() view returns (string[] memory)",
  "function getQuote(string calldata dexName, address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)",
  "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) view returns (string memory bestDex, uint256 bestAmountOut)"
];

// Provider for Avalanche mainnet
const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const dexRouter = new ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);

/**
 * Get all registered DEXes
 */
export async function getRegisteredDexes(): Promise<string[]> {
  return await dexRouter.getRegisteredDexes();
}

/**
 * Get quote from a specific DEX
 */
export async function getDexQuote(
  dexName: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: string
): Promise<{ amountOut: string; priceImpact: number } | null> {
  try {
    const amountInBN = ethers.parseEther(amountIn.toString());
    const amountOut = await dexRouter.getQuote(dexName, tokenIn, tokenOut, amountInBN);

    return {
      amountOut: ethers.formatUnits(amountOut, 6), // USDC has 6 decimals
      priceImpact: 0.05, // Estimated
    };
  } catch (error) {
    console.error(`Quote failed for ${dexName}:`, error);
    return null;
  }
}

/**
 * Get best quote across all DEXes from the contract
 * @param tokenIn - Token address
 * @param tokenOut - Token address  
 * @param amountIn - Amount in wei (as string or bigint)
 */
export async function getBestQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: string | bigint
): Promise<{
  bestDex: string;
  amountOut: string;
  priceImpact: number;
  route: string[];
  allQuotes: { dex: string; amountOut: string; priceImpact: number }[];
}> {
  try {
    // amountIn is already in wei from the route
    const amountInBN = typeof amountIn === 'string' ? BigInt(amountIn) : amountIn;

    // Get best route from contract
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(tokenIn, tokenOut, amountInBN);

    // Get all registered DEXes for comparison
    const registeredDexes = await dexRouter.getRegisteredDexes();
    const allQuotes: { dex: string; amountOut: string; priceImpact: number }[] = [];

    // Get decimals for tokenOut for correctly formatting all quotes
    const outDecimals = getTokenDecimals(tokenOut);

    for (const dexName of registeredDexes) {
      try {
        const quote = await dexRouter.getQuote(dexName, tokenIn, tokenOut, amountInBN);
        if (quote > 0n) {
          allQuotes.push({
            dex: dexName,
            amountOut: ethers.formatUnits(quote, outDecimals),
            priceImpact: 0.05,
          });
        }
      } catch (e) {
        // Skip failed quotes
      }
    }

    return {
      bestDex,
      amountOut: bestAmountOut.toString(), // Return raw units (not formatted)
      priceImpact: 0.05,
      route: [tokenIn, tokenOut],
      allQuotes,
    };
  } catch (error) {
    console.error('getBestQuote error:', error);
    throw new Error('No quotes available from any DEX');
  }
}

// Legacy function names for compatibility
export const getTraderJoeQuote = (tokenIn: string, tokenOut: string, amountIn: string) =>
  getDexQuote('TraderJoeV1', tokenIn, tokenOut, amountIn);

export const getPangolinQuote = (tokenIn: string, tokenOut: string, amountIn: string) =>
  getDexQuote('Pangolin', tokenIn, tokenOut, amountIn);

export const getSushiSwapQuote = () => Promise.resolve(null);
export const getCurveQuote = () => Promise.resolve(null);
export const getPlatypusQuote = () => Promise.resolve(null);