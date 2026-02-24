"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteRouter = void 0;
const express_1 = require("express");
const ethers_1 = require("ethers");
const router_1 = require("../services/router");
const dex_apis_1 = require("../services/dex-apis");
const logger_1 = require("../utils/logger");
// Convert token symbol or address to checksummed address
function resolveToken(token) {
    // If it's already an address, return it checksummed
    if (token.startsWith('0x')) {
        try {
            return ethers_1.ethers.getAddress(token);
        }
        catch {
            // If checksum fails, try with lowercase
            return ethers_1.ethers.getAddress(token.toLowerCase());
        }
    }
    // Look up by symbol
    return (0, dex_apis_1.getTokenAddress)(token);
}
exports.QuoteRouter = (0, express_1.Router)();
const routerService = new router_1.RouterService();
/**
 * @route GET /api/v1/quote
 * @description Get a quote from a specific DEX
 * @query dex - DEX name (TraderJoeV2 or Pangolin)
 * @query tokenIn - Input token address
 * @query tokenOut - Output token address
 * @query amountIn - Input amount (in wei)
 */
exports.QuoteRouter.get('/quote', async (req, res) => {
    try {
        const { dex, tokenIn, tokenOut, amountIn } = req.query;
        // Validate inputs
        if (!dex || !tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['dex', 'tokenIn', 'tokenOut', 'amountIn']
            });
        }
        // Resolve tokens (convert symbols to addresses)
        const tokenInAddress = resolveToken(tokenIn);
        const tokenOutAddress = resolveToken(tokenOut);
        // Convert decimal amount to wei
        const amountInWei = ethers_1.ethers.parseEther(amountIn);
        const quote = await routerService.getQuote(dex, tokenInAddress, tokenOutAddress, amountInWei);
        res.json({
            dex: dex,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            amountOut: quote.amountOut.toString(),
            amountOutFormatted: Number(quote.amountOut) / 1e6, // USDC has 6 decimals
            priceImpact: quote.priceImpact,
            route: quote.route,
            estimatedGas: quote.estimatedGas.toString(),
            timestamp: Date.now()
        });
    }
    catch (error) {
        logger_1.logger.error('Quote error:', error.message || 'Unknown error');
        res.status(500).json({
            error: 'Failed to get quote',
            message: error.message
        });
    }
});
/**
 * @route GET /api/v1/quote/best
 * @description Find the best route across all DEXes
 * @query tokenIn - Input token address
 * @query tokenOut - Output token address
 * @query amountIn - Input amount (in wei)
 */
exports.QuoteRouter.get('/quote/best', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn } = req.query;
        // Validate inputs
        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['tokenIn', 'tokenOut', 'amountIn']
            });
        }
        // Resolve tokens (convert symbols to addresses)
        const tokenInAddress = resolveToken(tokenIn);
        const tokenOutAddress = resolveToken(tokenOut);
        // Convert decimal amount to wei (handle both wei and decimal inputs)
        let amountInWei;
        if (amountIn.length > 18) {
            // Already in wei
            amountInWei = BigInt(amountIn);
        }
        else {
            // Decimal format, convert to wei
            amountInWei = ethers_1.ethers.parseEther(amountIn);
        }
        const bestRoute = await routerService.findBestRoute(tokenInAddress, tokenOutAddress, amountInWei);
        // Format output based on token decimals (USDC = 6, others = 18)
        const isUsdcOut = tokenOutAddress.toLowerCase().includes('b97ef9ef'); // USDC
        const decimals = isUsdcOut ? 6 : 18;
        const amountOutFormatted = Number(bestRoute.amountOut) / Math.pow(10, decimals);
        res.json({
            bestDex: bestRoute.dex,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            amountOut: bestRoute.amountOut.toString(),
            amountOutFormatted: amountOutFormatted,
            priceImpact: bestRoute.priceImpact,
            route: bestRoute.route,
            estimatedGas: bestRoute.estimatedGas.toString(),
            savings: bestRoute.savings, // vs next best
            allQuotes: bestRoute.allQuotes,
            timestamp: Date.now()
        });
    }
    catch (error) {
        logger_1.logger.error('Best route error:', error);
        res.status(500).json({
            error: 'Failed to find best route',
            message: error.message
        });
    }
});
/**
 * @route GET /api/v1/quote/compare
 * @description Compare quotes across all DEXes
 * @query tokenIn - Input token address
 * @query tokenOut - Output token address
 * @query amountIn - Input amount (in wei)
 */
exports.QuoteRouter.get('/quote/compare', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn } = req.query;
        // Validate inputs
        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['tokenIn', 'tokenOut', 'amountIn']
            });
        }
        // Resolve tokens (convert symbols to addresses)
        const tokenInAddress = resolveToken(tokenIn);
        const tokenOutAddress = resolveToken(tokenOut);
        const comparison = await routerService.compareAllDexes(tokenInAddress, tokenOutAddress, BigInt(amountIn));
        res.json({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            quotes: comparison.quotes,
            best: comparison.best,
            worst: comparison.worst,
            spread: comparison.spread,
            timestamp: Date.now()
        });
    }
    catch (error) {
        logger_1.logger.error('Compare quotes error:', error);
        res.status(500).json({
            error: 'Failed to compare quotes',
            message: error.message
        });
    }
});
/**
 * @route GET /api/v1/dexes
 * @description Get all supported DEXes
 */
exports.QuoteRouter.get('/dexes', (req, res) => {
    res.json({
        dexes: [
            {
                name: 'TraderJoeV2',
                type: 'LB (Liquidity Book)',
                description: 'Trader Joe V2 Liquidity Book - Concentrated liquidity',
                website: 'https://traderjoexyz.com',
                feeRange: '0.01% - 1%'
            },
            {
                name: 'Pangolin',
                type: 'Uniswap V2',
                description: 'Pangolin - Uniswap V2 style AMM',
                website: 'https://pangolin.exchange',
                feeRange: '0.3%'
            }
        ]
    });
});
//# sourceMappingURL=quote.js.map