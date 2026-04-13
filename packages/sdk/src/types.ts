/**
 * AVAX Router SDK Types
 */

export interface AvaxRouterConfig {
  /** API base URL (default: https://api.avaxrouter.com) */
  apiUrl?: string;
  /** Partner ID for fee sharing */
  partnerId?: string;
  /** Partner fee in basis points (max 50 = 0.50%) */
  partnerFeeBps?: number;
  /** Partner address to receive fees */
  partnerAddress?: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface QuoteParams {
  /** Input token address or symbol */
  tokenIn: string;
  /** Output token address or symbol */
  tokenOut: string;
  /** Amount of input tokens (in human-readable format) */
  amountIn: string;
}

export interface QuoteResult {
  /** Input token address */
  tokenIn: string;
  /** Output token address */
  tokenOut: string;
  /** Amount in (raw) */
  amountIn: bigint;
  /** Expected amount out (raw) */
  amountOut: bigint;
  /** Amount out formatted for display */
  amountOutFormatted: string;
  /** Best DEX for this route */
  bestDex: string;
  /** All quotes from different DEXes */
  allQuotes: DexQuote[];
  /** Price impact */
  priceImpact?: number;
  /** Route path (for multi-hop) */
  route?: string[];
  /** Protocol fee in basis points */
  protocolFeeBps: number;
  /** Partner fee in basis points (if applicable) */
  partnerFeeBps?: number;
  /** Estimated gas cost */
  estimatedGas?: bigint;
}

export interface DexQuote {
  /** DEX name */
  dex: string;
  /** Output amount (raw) */
  amountOut: bigint;
  /** Output amount formatted */
  amountOutFormatted: string;
  /** Whether this quote is the best */
  isBest: boolean;
}

export interface SwapParams extends QuoteParams {
  /** Minimum output amount (slippage protection) */
  minAmountOut?: string;
  /** Slippage tolerance in percent (default: 0.5) */
  slippagePercent?: number;
  /** Recipient address (defaults to connected wallet) */
  recipient?: string;
  /** Deadline in seconds (default: 1200 = 20 min) */
  deadline?: number;
}

export interface SwapResult {
  /** Transaction hash */
  txHash: string;
  /** Amount of tokens swapped */
  amountIn: string;
  /** Amount of tokens received */
  amountOut: string;
  /** DEX used for the swap */
  dexUsed: string;
  /** Protocol fee paid */
  protocolFee: string;
  /** Partner fee paid (if applicable) */
  partnerFee?: string;
}

export interface SwapStatus {
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  blockNumber?: number;
  gasUsed?: bigint;
  amountIn?: string;
  amountOut?: string;
  error?: string;
}

// Avalanche token addresses (18 tokens with verified liquidity)
// Tested April 2026: 259/380 pairs have liquidity across Pangolin V2 + TraderJoe V1
export const AVALANCHE_TOKENS = {
  // Tier 1: Highest liquidity
  AVAX: '0x0000000000000000000000000000000000000000',
  WAVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
  USDT: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
  DAI: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
  USDC_E: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
  WBTC: '0x50b7545627a5162f82a992c33b87adc75187b218',
  WETH: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
  BTC_B: '0x152b9d0fdc40c096757f570a51e494bd4b943e50',
  SAVAX: '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be',
  LINK: '0x5947bb275c521040051d82396192181b413227a3',
  GMX: '0x62edc0692bd897d2295872a9ffcac5425011c661',
  FRAX: '0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64',
  // Tier 2: Good liquidity
  JOE: '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd',
  PNG: '0x60781c2586d68229fde47564546784ab3faca982',
  QI: '0x8729438eb15e2c8b576fcc6aecda6a148776c0f5',
  CRV: '0x47536f17f4ff30e64a96a7555826b8f9e66ec468',
  // Tier 3: Moderate liquidity
  COQ: '0x420fca0121dc28039145009570975747295f2329',
} as const;

// DexRouter contract address on Avalanche
export const DEX_ROUTER_ADDRESS = '0x81308B8e4C72E5aA042ADA30f9b29729c5a43098' as `0x${string}`;

// API endpoints
export const API_ENDPOINTS = {
  mainnet: 'https://avax-router-api.avaxrouter.workers.dev',
  testnet: 'https://api-testnet.avaxrouter.com',
  local: 'http://localhost:3000',
} as const;
