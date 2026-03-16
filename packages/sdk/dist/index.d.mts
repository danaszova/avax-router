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
interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
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
interface SwapStatus {
    status: 'pending' | 'confirmed' | 'failed';
    txHash?: string;
    blockNumber?: number;
    gasUsed?: bigint;
    amountIn?: string;
    amountOut?: string;
    error?: string;
}
declare const AVALANCHE_TOKENS: {
    readonly AVAX: "0x0000000000000000000000000000000000000000";
    readonly WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
    readonly USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
    readonly USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7";
    readonly JOE: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd";
    readonly PNG: "0x60781C2586D68229fde47564546784ab3fACA982";
};
declare const DEX_ROUTER_ADDRESS: `0x${string}`;
declare const API_ENDPOINTS: {
    readonly mainnet: "https://avax-router-api.avaxrouter.workers.dev";
    readonly testnet: "https://api-testnet.avaxrouter.com";
    readonly local: "http://localhost:3000";
};

/**
 * AVAX Router SDK Client
 *
 * Main entry point for interacting with AVAX Router
 */

declare class AvaxRouter {
    private apiUrl;
    private partnerId?;
    private partnerFeeBps?;
    private partnerAddress?;
    constructor(config?: AvaxRouterConfig);
    /**
     * Get the best quote across all DEXes
     */
    getBestQuote(params: QuoteParams): Promise<QuoteResult>;
    /**
     * Get quotes from all DEXes
     */
    getAllQuotes(params: QuoteParams): Promise<QuoteResult[]>;
    /**
     * Prepare a swap transaction (returns unsigned transaction data)
     */
    prepareSwap(params: SwapParams): Promise<{
        to: string;
        data: string;
        value: string;
        gasLimit?: string;
    }>;
    /**
     * Execute a swap (requires signer - use with ethers.js or viem)
     *
     * @example
     * // With ethers.js
     * const router = new AvaxRouter();
     * const signer = await ethers.getSigner();
     * const result = await router.swap({ tokenIn: 'AVAX', tokenOut: 'USDC', amountIn: '1.0' }, signer);
     */
    swap(params: SwapParams, signer: any): Promise<SwapResult>;
    /**
     * Get the status of a swap transaction
     */
    getSwapStatus(txHash: string): Promise<SwapStatus>;
    /**
     * Get list of supported tokens
     */
    getSupportedTokens(): Promise<Array<{
        address: string;
        symbol: string;
        name: string;
        decimals: number;
        logoURI?: string;
    }>>;
    /**
     * Get list of supported DEXes
     */
    getSupportedDexes(): Promise<Array<{
        name: string;
        adapter: string;
        version: string;
    }>>;
}
declare function getClient(config?: AvaxRouterConfig): AvaxRouter;

export { API_ENDPOINTS, AVALANCHE_TOKENS, AvaxRouter, type AvaxRouterConfig, DEX_ROUTER_ADDRESS, type DexQuote, type QuoteParams, type QuoteResult, type SwapParams, type SwapResult, type SwapStatus, type TokenInfo, getClient };
