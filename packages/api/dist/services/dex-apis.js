"use strict";
/**
 * Real DEX API integrations for quotes
 * Queries the on-chain DexRouter contract for live quotes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatypusQuote = exports.getCurveQuote = exports.getSushiSwapQuote = exports.getPangolinQuote = exports.getTraderJoeQuote = exports.TOKENS = void 0;
exports.getTokenAddress = getTokenAddress;
exports.getRegisteredDexes = getRegisteredDexes;
exports.getDexQuote = getDexQuote;
exports.getBestQuote = getBestQuote;
const ethers_1 = require("ethers");
// Token addresses - REAL WORKING ADDRESSES on TraderJoe V1
// Note: The commonly cited WAVAX (0xB31f66Aa3C1ee3B4...) has NO CODE and doesn't work!
exports.TOKENS = {
    // Working WAVAX (this is the actual contract with pools on TJ V1)
    AVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase(),
    WAVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase(),
    // USDC - confirmed working with WAVAX pool
    USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'.toLowerCase(),
    USDT: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'.toLowerCase(),
    DAI: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70'.toLowerCase(),
    WBTC: '0x50b7545627a5162f82a992c33b87adc75187b218'.toLowerCase(),
    WETH: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab'.toLowerCase(),
};
// Helper to get checksummed address
function getTokenAddress(symbol) {
    const addr = exports.TOKENS[symbol.toUpperCase()];
    if (!addr)
        throw new Error(`Unknown token: ${symbol}`);
    return ethers_1.ethers.getAddress(addr);
}
// DexRouter contract
const DEX_ROUTER_ADDRESS = '0x3ff7faad7417130c60b7422de712ead9a7c2e3b5';
const DEX_ROUTER_ABI = [
    "function getRegisteredDexes() view returns (string[] memory)",
    "function getQuote(string calldata dexName, address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)",
    "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) view returns (string memory bestDex, uint256 bestAmountOut)"
];
// Provider for Avalanche mainnet
const provider = new ethers_1.ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const dexRouter = new ethers_1.ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);
/**
 * Get all registered DEXes
 */
async function getRegisteredDexes() {
    return await dexRouter.getRegisteredDexes();
}
/**
 * Get quote from a specific DEX
 */
async function getDexQuote(dexName, tokenIn, tokenOut, amountIn) {
    try {
        const amountInBN = ethers_1.ethers.parseEther(amountIn.toString());
        const amountOut = await dexRouter.getQuote(dexName, tokenIn, tokenOut, amountInBN);
        return {
            amountOut: ethers_1.ethers.formatUnits(amountOut, 6), // USDC has 6 decimals
            priceImpact: 0.05, // Estimated
        };
    }
    catch (error) {
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
async function getBestQuote(tokenIn, tokenOut, amountIn) {
    try {
        // amountIn is already in wei from the route
        const amountInBN = typeof amountIn === 'string' ? BigInt(amountIn) : amountIn;
        // Get best route from contract
        const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(tokenIn, tokenOut, amountInBN);
        // Get all registered DEXes for comparison
        const registeredDexes = await dexRouter.getRegisteredDexes();
        const allQuotes = [];
        for (const dexName of registeredDexes) {
            try {
                const quote = await dexRouter.getQuote(dexName, tokenIn, tokenOut, amountInBN);
                if (quote > 0n) {
                    allQuotes.push({
                        dex: dexName,
                        amountOut: ethers_1.ethers.formatUnits(quote, 6),
                        priceImpact: 0.05,
                    });
                }
            }
            catch (e) {
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
    }
    catch (error) {
        console.error('getBestQuote error:', error);
        throw new Error('No quotes available from any DEX');
    }
}
// Legacy function names for compatibility
const getTraderJoeQuote = (tokenIn, tokenOut, amountIn) => getDexQuote('TraderJoeV1', tokenIn, tokenOut, amountIn);
exports.getTraderJoeQuote = getTraderJoeQuote;
const getPangolinQuote = (tokenIn, tokenOut, amountIn) => getDexQuote('Pangolin', tokenIn, tokenOut, amountIn);
exports.getPangolinQuote = getPangolinQuote;
const getSushiSwapQuote = () => Promise.resolve(null);
exports.getSushiSwapQuote = getSushiSwapQuote;
const getCurveQuote = () => Promise.resolve(null);
exports.getCurveQuote = getCurveQuote;
const getPlatypusQuote = () => Promise.resolve(null);
exports.getPlatypusQuote = getPlatypusQuote;
//# sourceMappingURL=dex-apis.js.map