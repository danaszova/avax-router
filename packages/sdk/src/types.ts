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

// Avalanche token addresses
export const AVALANCHE_TOKENS = {
  AVAX: '0x0000000000000000000000000000000000000000',
  WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
  JOE: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
  PNG: '0x60781C2586D68229fde47564546784ab3fACA982',
} as const;

// DexRouter contract address on Avalanche
export const DEX_ROUTER_ADDRESS = '0xYourDeployedContractAddress' as `0x${string}`;

// API endpoints
export const API_ENDPOINTS = {
  mainnet: 'https://api.avaxrouter.com',
  testnet: 'https://api-testnet.avaxrouter.com',
  local: 'http://localhost:3000',
} as const;