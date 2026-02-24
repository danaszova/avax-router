export interface Route {
    path: string[];
    dexes: string[];
    amountOut: bigint;
    gasEstimate: number;
    splitPercentage?: number;
}
export interface OptimizedRoute {
    routes: Route[];
    totalAmountOut: bigint;
    totalGasEstimate: number;
    savingsVsBestSingle: number;
    executionStrategy: 'single' | 'split';
}
export declare class AdvancedRouterService {
    private provider;
    private tjRouter;
    private pangolinRouter;
    constructor();
    /**
     * Find the optimal route considering multi-hop and split routing
     */
    findOptimalRoute(tokenIn: string, tokenOut: string, amountIn: bigint, maxHops?: number, allowSplit?: boolean): Promise<OptimizedRoute>;
    /**
     * Find all possible routes (direct and multi-hop)
     */
    private findAllRoutes;
    /**
     * Find direct routes (no intermediate token)
     */
    private findDirectRoutes;
    /**
     * Calculate optimal split between multiple routes
     */
    private calculateSplitRoute;
    /**
     * Get best quote for any path (used for multi-hop)
     */
    private getBestQuote;
    /**
     * Get quote for a specific route with specific amount
     */
    private getQuoteForRoute;
    /**
     * Get TraderJoe quote
     */
    private getTraderJoeQuote;
    /**
     * Get Pangolin quote
     */
    private getPangolinQuote;
    /**
     * Calculate gas cost in terms of output token
     */
    calculateGasCost(gasUnits: number): Promise<bigint>;
}
export declare const advancedRouter: AdvancedRouterService;
//# sourceMappingURL=advancedRouter.d.ts.map