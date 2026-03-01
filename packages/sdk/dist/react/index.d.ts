/**
 * AVAX Router SDK Types
 */
interface AvaxRouterConfig {
    /** API base URL (default: https://api.avaxrouter.com) */
    apiUrl?: string;
    /** Partner ID for fee sharing */
    partnerId?: string;
    /** Partner fee in basis points (max 50 = 0.50%) */
    partnerFeeBps?: number;
    /** Partner address to receive fees */
    partnerAddress?: string;
}
interface QuoteParams {
    /** Input token address or symbol */
    tokenIn: string;
    /** Output token address or symbol */
    tokenOut: string;
    /** Amount of input tokens (in human-readable format) */
    amountIn: string;
}
interface QuoteResult {
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
interface DexQuote {
    /** DEX name */
    dex: string;
    /** Output amount (raw) */
    amountOut: bigint;
    /** Output amount formatted */
    amountOutFormatted: string;
    /** Whether this quote is the best */
    isBest: boolean;
}
interface SwapParams extends QuoteParams {
    /** Minimum output amount (slippage protection) */
    minAmountOut?: string;
    /** Slippage tolerance in percent (default: 0.5) */
    slippagePercent?: number;
    /** Recipient address (defaults to connected wallet) */
    recipient?: string;
    /** Deadline in seconds (default: 1200 = 20 min) */
    deadline?: number;
}
interface SwapResult {
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

/**
 * useQuote Hook
 *
 * Fetch the best quote for a token swap
 */

interface UseQuoteOptions extends QuoteParams {
    /** SDK configuration */
    config?: AvaxRouterConfig;
    /** Auto-fetch on mount (default: true) */
    autoFetch?: boolean;
    /** Refresh interval in ms (default: 10000) */
    refreshInterval?: number;
}
interface UseQuoteResult {
    /** Quote result */
    quote: QuoteResult | null;
    /** Loading state */
    loading: boolean;
    /** Error if any */
    error: Error | null;
    /** Manually refetch */
    refetch: () => Promise<void>;
}
declare function useQuote(options: UseQuoteOptions): UseQuoteResult;

/**
 * useSwap Hook
 *
 * Execute a token swap
 */

interface UseSwapOptions {
    /** SDK configuration */
    config?: AvaxRouterConfig;
}
interface UseSwapResult {
    /** Execute the swap */
    swap: (params: SwapParams, signer: any) => Promise<SwapResult>;
    /** Transaction hash after swap */
    txHash: string | null;
    /** Loading state */
    loading: boolean;
    /** Error if any */
    error: Error | null;
    /** Reset state */
    reset: () => void;
}
declare function useSwap(options?: UseSwapOptions): UseSwapResult;

export { type AvaxRouterConfig, type QuoteParams, type QuoteResult, type SwapParams, type SwapResult, type UseQuoteOptions, type UseQuoteResult, type UseSwapOptions, type UseSwapResult, useQuote, useSwap };
