"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedRouter = exports.AdvancedRouterService = void 0;
const ethers_1 = require("ethers");
const logger_1 = require("../utils/logger");
// Token addresses on Avalanche
const TOKENS = {
    WAVAX: '0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C',
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    WBTC: '0x50b7545627a5162F82A992c33b87aDc75187B218',
    WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    MIM: '0x130966628846BFd36ff31a822705796e8cb8C18D',
    FRAX: '0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98',
};
// Intermediate tokens for multi-hop routing (in order of preference)
const INTERMEDIATE_TOKENS = [
    TOKENS.WAVAX,
    TOKENS.USDC,
    TOKENS.USDT,
    TOKENS.DAI,
];
// DEX configurations
const DEX_CONFIG = {
    traderJoe: {
        router: '0xb4315e873dBcf96Ffd0acd6EA047C66507581979',
        name: 'TraderJoeV2',
        gasEstimate: 150000,
    },
    pangolin: {
        router: '0xE54Ca86531e17Ef3616d11Ca5b4d259Fa0d24756',
        name: 'Pangolin',
        gasEstimate: 120000,
    },
};
// ABIs
const TRADER_JOE_ABI = [
    'function getSwapOut(address lbPair, uint256 amountIn, bool swapForY) external view returns (uint256 amountOut, uint256 feesIn, uint256 feesOutOfBin)',
    'function getLBPair(address tokenA, address tokenB, uint16 binStep) external view returns (address pair)',
];
const PANGOLIN_ABI = [
    'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)',
];
class AdvancedRouterService {
    constructor() {
        const rpcUrl = process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc';
        this.provider = new ethers_1.JsonRpcProvider(rpcUrl);
        this.tjRouter = new ethers_1.Contract(DEX_CONFIG.traderJoe.router, TRADER_JOE_ABI, this.provider);
        this.pangolinRouter = new ethers_1.Contract(DEX_CONFIG.pangolin.router, PANGOLIN_ABI, this.provider);
    }
    /**
     * Find the optimal route considering multi-hop and split routing
     */
    async findOptimalRoute(tokenIn, tokenOut, amountIn, maxHops = 3, allowSplit = true) {
        logger_1.logger.info(`Finding optimal route: ${tokenIn} -> ${tokenOut}, amount: ${amountIn}`);
        // 1. Find all possible routes (direct + multi-hop)
        const allRoutes = await this.findAllRoutes(tokenIn, tokenOut, amountIn, maxHops);
        if (allRoutes.length === 0) {
            throw new Error('No valid routes found');
        }
        // 2. Sort by output amount
        allRoutes.sort((a, b) => Number(b.amountOut - a.amountOut));
        // 3. Check if split routing is beneficial
        if (allowSplit && allRoutes.length >= 2) {
            const splitRoute = await this.calculateSplitRoute(allRoutes, amountIn);
            const bestSingle = allRoutes[0];
            // Split is better if it gives >0.1% more output
            const splitAdvantage = Number(splitRoute.totalAmountOut - bestSingle.amountOut) / Number(bestSingle.amountOut);
            if (splitAdvantage > 0.001) {
                logger_1.logger.info(`Split routing is better: +${(splitAdvantage * 100).toFixed(2)}%`);
                return {
                    routes: splitRoute.routes,
                    totalAmountOut: splitRoute.totalAmountOut,
                    totalGasEstimate: splitRoute.totalGasEstimate,
                    savingsVsBestSingle: splitAdvantage * 100,
                    executionStrategy: 'split',
                };
            }
        }
        // 4. Return best single route
        const bestRoute = allRoutes[0];
        return {
            routes: [bestRoute],
            totalAmountOut: bestRoute.amountOut,
            totalGasEstimate: bestRoute.gasEstimate,
            savingsVsBestSingle: 0,
            executionStrategy: 'single',
        };
    }
    /**
     * Find all possible routes (direct and multi-hop)
     */
    async findAllRoutes(tokenIn, tokenOut, amountIn, maxHops) {
        const routes = [];
        // Direct routes (1 hop)
        const directRoutes = await this.findDirectRoutes(tokenIn, tokenOut, amountIn);
        routes.push(...directRoutes);
        if (maxHops >= 2) {
            // Multi-hop routes through intermediates
            for (const intermediate of INTERMEDIATE_TOKENS) {
                if (intermediate === tokenIn || intermediate === tokenOut)
                    continue;
                try {
                    const hop1 = await this.getBestQuote(tokenIn, intermediate, amountIn);
                    if (hop1.amountOut === BigInt(0))
                        continue;
                    const hop2 = await this.getBestQuote(intermediate, tokenOut, hop1.amountOut);
                    if (hop2.amountOut === BigInt(0))
                        continue;
                    routes.push({
                        path: [tokenIn, intermediate, tokenOut],
                        dexes: [hop1.dex, hop2.dex],
                        amountOut: hop2.amountOut,
                        gasEstimate: DEX_CONFIG.traderJoe.gasEstimate * 2,
                    });
                }
                catch (error) {
                    continue;
                }
            }
        }
        return routes;
    }
    /**
     * Find direct routes (no intermediate token)
     */
    async findDirectRoutes(tokenIn, tokenOut, amountIn) {
        const routes = [];
        // Try TraderJoe
        try {
            const tjQuote = await this.getTraderJoeQuote(tokenIn, tokenOut, amountIn);
            if (tjQuote > BigInt(0)) {
                routes.push({
                    path: [tokenIn, tokenOut],
                    dexes: ['TraderJoeV2'],
                    amountOut: tjQuote,
                    gasEstimate: DEX_CONFIG.traderJoe.gasEstimate,
                });
            }
        }
        catch (error) {
            logger_1.logger.debug('TraderJoe direct route failed', error);
        }
        // Try Pangolin
        try {
            const pangolinQuote = await this.getPangolinQuote(tokenIn, tokenOut, amountIn);
            if (pangolinQuote > BigInt(0)) {
                routes.push({
                    path: [tokenIn, tokenOut],
                    dexes: ['Pangolin'],
                    amountOut: pangolinQuote,
                    gasEstimate: DEX_CONFIG.pangolin.gasEstimate,
                });
            }
        }
        catch (error) {
            logger_1.logger.debug('Pangolin direct route failed', error);
        }
        return routes;
    }
    /**
     * Calculate optimal split between multiple routes
     */
    async calculateSplitRoute(routes, totalAmountIn) {
        // Take top 2 routes
        const route1 = routes[0];
        const route2 = routes[1];
        // Try different splits: 50/50, 60/40, 70/30, 80/20, 90/10
        const splits = [50, 60, 70, 80, 90];
        let bestSplit = { percentage: 100, amountOut: route1.amountOut };
        for (const split of splits) {
            const amount1 = (totalAmountIn * BigInt(split)) / BigInt(100);
            const amount2 = totalAmountIn - amount1;
            try {
                // Recalculate quotes with split amounts
                const quote1 = await this.getQuoteForRoute(route1, amount1);
                const quote2 = await this.getQuoteForRoute(route2, amount2);
                const totalOut = quote1 + quote2;
                if (totalOut > bestSplit.amountOut) {
                    bestSplit = { percentage: split, amountOut: totalOut };
                }
            }
            catch (error) {
                continue;
            }
        }
        if (bestSplit.percentage === 100) {
            // No split is better
            return {
                routes: [route1],
                totalAmountOut: route1.amountOut,
                totalGasEstimate: route1.gasEstimate,
            };
        }
        // Return split route
        const amount1 = (totalAmountIn * BigInt(bestSplit.percentage)) / BigInt(100);
        const amount2 = totalAmountIn - amount1;
        return {
            routes: [
                { ...route1, splitPercentage: bestSplit.percentage },
                { ...route2, splitPercentage: 100 - bestSplit.percentage },
            ],
            totalAmountOut: bestSplit.amountOut,
            totalGasEstimate: route1.gasEstimate + route2.gasEstimate,
        };
    }
    /**
     * Get best quote for any path (used for multi-hop)
     */
    async getBestQuote(tokenIn, tokenOut, amountIn) {
        const quotes = [];
        try {
            const tj = await this.getTraderJoeQuote(tokenIn, tokenOut, amountIn);
            if (tj > BigInt(0))
                quotes.push({ dex: 'TraderJoeV2', amountOut: tj });
        }
        catch (e) { }
        try {
            const pg = await this.getPangolinQuote(tokenIn, tokenOut, amountIn);
            if (pg > BigInt(0))
                quotes.push({ dex: 'Pangolin', amountOut: pg });
        }
        catch (e) { }
        if (quotes.length === 0) {
            throw new Error('No quotes available');
        }
        quotes.sort((a, b) => Number(b.amountOut - a.amountOut));
        return quotes[0];
    }
    /**
     * Get quote for a specific route with specific amount
     */
    async getQuoteForRoute(route, amountIn) {
        if (route.path.length === 2) {
            // Direct route
            if (route.dexes[0] === 'TraderJoeV2') {
                return this.getTraderJoeQuote(route.path[0], route.path[1], amountIn);
            }
            else {
                return this.getPangolinQuote(route.path[0], route.path[1], amountIn);
            }
        }
        else {
            // Multi-hop
            const hop1 = await this.getBestQuote(route.path[0], route.path[1], amountIn);
            return this.getBestQuote(route.path[1], route.path[2], hop1.amountOut).then(q => q.amountOut);
        }
    }
    /**
     * Get TraderJoe quote
     */
    async getTraderJoeQuote(tokenIn, tokenOut, amountIn) {
        const binSteps = [1, 5, 10, 20, 50];
        let bestAmountOut = BigInt(0);
        for (const binStep of binSteps) {
            try {
                const pair = await this.tjRouter.getLBPair(tokenIn, tokenOut, binStep);
                if (pair && pair !== '0x0000000000000000000000000000000000000000') {
                    const { amountOut } = await this.tjRouter.getSwapOut(pair, amountIn, true);
                    if (amountOut > bestAmountOut) {
                        bestAmountOut = amountOut;
                    }
                }
            }
            catch {
                continue;
            }
        }
        return bestAmountOut;
    }
    /**
     * Get Pangolin quote
     */
    async getPangolinQuote(tokenIn, tokenOut, amountIn) {
        try {
            const amounts = await this.pangolinRouter.getAmountsOut(amountIn, [tokenIn, tokenOut]);
            return amounts[1];
        }
        catch {
            return BigInt(0);
        }
    }
    /**
     * Calculate gas cost in terms of output token
     */
    async calculateGasCost(gasUnits) {
        try {
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice || BigInt(25000000000); // Default 25 gwei
            const gasCostWei = BigInt(gasUnits) * gasPrice;
            // Convert to USD value (rough estimate: 1 AVAX = $40)
            // This is simplified - in production use price oracle
            return gasCostWei;
        }
        catch (error) {
            logger_1.logger.error('Failed to calculate gas cost', error);
            return BigInt(0);
        }
    }
}
exports.AdvancedRouterService = AdvancedRouterService;
// Singleton instance
exports.advancedRouter = new AdvancedRouterService();
//# sourceMappingURL=advancedRouter.js.map