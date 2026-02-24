"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedQuoteRouter = void 0;
const express_1 = require("express");
const advancedRouter_1 = require("../services/advancedRouter");
const logger_1 = require("../utils/logger");
exports.AdvancedQuoteRouter = (0, express_1.Router)();
/**
 * @route GET /api/v1/quote/advanced
 * @description Get optimized route with multi-hop and split routing
 * @query tokenIn - Input token address
 * @query tokenOut - Output token address
 * @query amountIn - Input amount (in wei)
 * @query maxHops - Maximum number of hops (default: 3)
 * @query allowSplit - Allow split routing (default: true)
 */
exports.AdvancedQuoteRouter.get('/quote/advanced', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn, maxHops, allowSplit } = req.query;
        // Validate inputs
        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['tokenIn', 'tokenOut', 'amountIn'],
                optional: ['maxHops', 'allowSplit'],
            });
        }
        const hops = maxHops ? parseInt(maxHops) : 3;
        const split = allowSplit !== 'false';
        const optimizedRoute = await advancedRouter_1.advancedRouter.findOptimalRoute(tokenIn, tokenOut, BigInt(amountIn), hops, split);
        res.json({
            strategy: optimizedRoute.executionStrategy,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            totalAmountOut: optimizedRoute.totalAmountOut.toString(),
            totalGasEstimate: optimizedRoute.totalGasEstimate,
            savingsVsBestSingle: optimizedRoute.savingsVsBestSingle.toFixed(4) + '%',
            routes: optimizedRoute.routes.map(route => ({
                path: route.path,
                dexes: route.dexes,
                amountOut: route.amountOut.toString(),
                gasEstimate: route.gasEstimate,
                splitPercentage: route.splitPercentage,
            })),
            timestamp: Date.now(),
        });
    }
    catch (error) {
        logger_1.logger.error('Advanced quote error:', error);
        res.status(500).json({
            error: 'Failed to find optimal route',
            message: error.message,
        });
    }
});
/**
 * @route GET /api/v1/quote/compare-advanced
 * @description Compare all possible routes (direct, multi-hop, split)
 * @query tokenIn - Input token address
 * @query tokenOut - Output token address
 * @query amountIn - Input amount (in wei)
 */
exports.AdvancedQuoteRouter.get('/quote/compare-advanced', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn } = req.query;
        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['tokenIn', 'tokenOut', 'amountIn'],
            });
        }
        // Get single route (no split)
        const singleRoute = await advancedRouter_1.advancedRouter.findOptimalRoute(tokenIn, tokenOut, BigInt(amountIn), 3, false);
        // Get split route
        const splitRoute = await advancedRouter_1.advancedRouter.findOptimalRoute(tokenIn, tokenOut, BigInt(amountIn), 3, true);
        res.json({
            comparison: {
                single: {
                    strategy: 'single',
                    amountOut: singleRoute.totalAmountOut.toString(),
                    gasEstimate: singleRoute.totalGasEstimate,
                },
                split: {
                    strategy: 'split',
                    amountOut: splitRoute.totalAmountOut.toString(),
                    gasEstimate: splitRoute.totalGasEstimate,
                    savings: splitRoute.savingsVsBestSingle.toFixed(4) + '%',
                },
                winner: splitRoute.savingsVsBestSingle > 0.1 ? 'split' : 'single',
            },
            timestamp: Date.now(),
        });
    }
    catch (error) {
        logger_1.logger.error('Compare advanced error:', error);
        res.status(500).json({
            error: 'Failed to compare routes',
            message: error.message,
        });
    }
});
//# sourceMappingURL=advancedQuote.js.map