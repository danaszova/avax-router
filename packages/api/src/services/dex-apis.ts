/**
 * Real DEX API integrations for quotes
 * Queries the on-chain DexRouter contract for live quotes
 */

import { ethers } from 'ethers';

// Token addresses - REAL WORKING ADDRESSES on TraderJoe V1
// Note: The commonly cited WAVAX (0xB31f66Aa3C1ee3B4...) has NO CODE and doesn't work!
export const TOKENS: Record<string, string> = {
  // Working WAVAX (this is the actual contract with pools on TJ V1)
  AVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase(),
  WAVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase(),
  // USDC - confirmed working with WAVAX pool
  USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'.toLowerCase(),
  USDT: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'.toLowerCase(),
  DAI: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70'.toLowerCase(),
  WBTC: '0x50b7545627a5162f82a992c33b87adc75187b218'.toLowerCase(),
  WETH: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab'.toLowerCase(),
  // New Top Tokens (Verified Official Addresses)
  JOE: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd'.toLowerCase(),
  QI: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5'.toLowerCase(),
  LINK: '0x5947bb275c521040051d82396192181b413227a3'.toLowerCase(),
  GMX: '0x62edc0692BD897D2295872a9FFCac5425011c661'.toLowerCase(),
  PNG: '0x60781C2586D68229fde47564546784ab3fACA982'.toLowerCase(),
};

export const TOKEN_METADATA: Record<string, { decimals: number }> = {
  [TOKENS.AVAX]: { decimals: 18 },
  [TOKENS.WAVAX]: { decimals: 18 },
  [TOKENS.USDC]: { decimals: 6 },
  [TOKENS.USDT]: { decimals: 6 },
  [TOKENS.DAI]: { decimals: 18 },
  [TOKENS.WBTC]: { decimals: 8 },
  [TOKENS.WETH]: { decimals: 18 },
  [TOKENS.JOE]: { decimals: 18 },
  [TOKENS.QI]: { decimals: 18 },
  [TOKENS.LINK]: { decimals: 18 },
  [TOKENS.GMX]: { decimals: 18 },
  [TOKENS.PNG]: { decimals: 18 },
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

// DexRouter contract
const DEX_ROUTER_ADDRESS = '0x3ff7faad7417130c60b7422de712ead9a7c2e3b5';

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