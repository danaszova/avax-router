"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterService = void 0;
const ethers_1 = require("ethers");
const logger_1 = require("../utils/logger");
const dex_apis_1 = require("./dex-apis");
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
    USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
    USDT: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // USDT
    DAI: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', // DAI
    WBTC: '0x50b7545627a5162f82a992c33b87adc75187b218', // WBTC
    WETH: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
};
class RouterService {
    constructor() {
        this.adapters = new Map();
        const rpcUrl = process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc';
        this.provider = new ethers_1.JsonRpcProvider(rpcUrl);
        // Use our deployed DexRouter
        const dexRouterAddress = process.env.DEX_ROUTER_ADDRESS || '0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5';
        this.dexRouter = new ethers_1.Contract(dexRouterAddress, DEX_ROUTER_ABI, this.provider);
        // Initialize adapters (using TraderJoe V1 which has real liquidity)
        const tjV1AdapterAddress = process.env.TRADER_JOE_V1_ADAPTER_ADDRESS || '0x01A2D4498e36fc29b4B93DA4004BeD15093b2A03';
        this.adapters.set('TraderJoeV1', new ethers_1.Contract(tjV1AdapterAddress, ADAPTER_ABI, this.provider));
        this.adapters.set('TraderJoeV2', new ethers_1.Contract(tjV1AdapterAddress, ADAPTER_ABI, this.provider)); // Alias for compatibility
    }
    /**
     * Get a quote from a specific DEX using our adapters
     */
    async getQuote(dex, tokenIn, tokenOut, amountIn) {
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
                amountOut: amountOut, // Keep as bigint, will be stringified in route
                priceImpact,
                route: [tokenIn, tokenOut],
                estimatedGas: dex === 'TraderJoeV2' ? BigInt(150000) : BigInt(120000),
            };
        }
        catch (error) {
            const errorMsg = error?.message || error?.reason || String(error);
            logger_1.logger.error(`${dex} quote error: ${errorMsg}`);
            throw new Error(`Failed to get ${dex} quote: ${errorMsg}`);
        }
    }
    /**
     * Find the best route across all DEXes
     */
    async findBestRoute(tokenIn, tokenOut, amountIn) {
        const quotes = [];
        const errors = [];
        try {
            const bestQuote = await (0, dex_apis_1.getBestQuote)(tokenIn, tokenOut, amountIn);
            // Convert to our Quote format - amountOut is already in raw units
            return {
                dex: bestQuote.bestDex,
                amountOut: BigInt(bestQuote.amountOut), // Raw units from contract
                priceImpact: bestQuote.priceImpact,
                route: bestQuote.route,
                estimatedGas: bestQuote.bestDex === 'TraderJoeV2' ? BigInt(150000) : BigInt(120000),
                savings: 0,
                allQuotes: bestQuote.allQuotes.map(q => ({
                    dex: q.dex,
                    amountOut: q.amountOut,
                })),
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get best route:', error);
            throw new Error('No valid quotes found from any DEX');
        }
        // This code is now handled above
        throw new Error('Should not reach here');
    }
    /**
     * Compare quotes across all DEXes
     */
    async compareAllDexes(tokenIn, tokenOut, amountIn) {
        const route = await this.findBestRoute(tokenIn, tokenOut, amountIn);
        const sortedQuotes = [...route.allQuotes].sort((a, b) => BigInt(b.amountOut) > BigInt(a.amountOut) ? 1 : -1);
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
exports.RouterService = RouterService;
//# sourceMappingURL=router.js.map