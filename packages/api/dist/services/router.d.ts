export interface Quote {
    dex: string;
    amountOut: bigint;
    priceImpact: number;
    route: string[];
    estimatedGas: bigint;
}
export interface BestRoute extends Quote {
    savings: number;
    allQuotes: {
        dex: string;
        amountOut: string;
    }[];
}
export declare class RouterService {
    private provider;
    private dexRouter;
    private adapters;
    constructor();
    /**
     * Get a quote from a specific DEX using our adapters
     */
    getQuote(dex: string, tokenIn: string, tokenOut: string, amountIn: bigint): Promise<Quote>;
    /**
     * Find the best route across all DEXes
     */
    findBestRoute(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<BestRoute>;
    /**
     * Compare quotes across all DEXes
     */
    compareAllDexes(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<{
        quotes: {
            dex: string;
            amountOut: string;
            priceImpact: number;
        }[];
        best: {
            dex: string;
            amountOut: string;
        };
        worst: {
            dex: string;
            amountOut: string;
        };
        spread: number;
    }>;
    /**
     * Get supported tokens list
     */
    getSupportedTokens(): {
        symbol: string;
        address: string;
    }[];
}
//# sourceMappingURL=router.d.ts.map