import { Router, Request, Response } from 'express';
import { advancedRouter } from '../services/advancedRouter';
import { logger } from '../utils/logger';

export const AdvancedQuoteRouter = Router();

/**
 * @route GET /api/v1/quote/advanced
 * @description Get optimized route with multi-hop and split routing
 * @query tokenIn - Input token address
 * @query tokenOut - Output token address
 * @query amountIn - Input amount (in wei)
 * @query maxHops - Maximum number of hops (default: 3)
 * @query allowSplit - Allow split routing (default: true)
 */
AdvancedQuoteRouter.get('/quote/advanced', async (req: Request, res: Response) => {
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

    const hops = maxHops ? parseInt(maxHops as string) : 3;
    const split = allowSplit !== 'false';

    const optimizedRoute = await advancedRouter.findOptimalRoute(
      tokenIn as string,
      tokenOut as string,
      BigInt(amountIn as string),
      hops,
      split
    );

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
  } catch (error: any) {
    logger.error('Advanced quote error:', error);
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
AdvancedQuoteRouter.get('/quote/compare-advanced', async (req: Request, res: Response) => {
  try {
    const { tokenIn, tokenOut, amountIn } = req.query;

    if (!tokenIn || !tokenOut || !amountIn) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['tokenIn', 'tokenOut', 'amountIn'],
      });
    }

    // Get single route (no split)
    const singleRoute = await advancedRouter.findOptimalRoute(
      tokenIn as string,
      tokenOut as string,
      BigInt(amountIn as string),
      3,
      false
    );

    // Get split route
    const splitRoute = await advancedRouter.findOptimalRoute(
      tokenIn as string,
      tokenOut as string,
      BigInt(amountIn as string),
      3,
      true
    );

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
  } catch (error: any) {
    logger.error('Compare advanced error:', error);
    res.status(500).json({
      error: 'Failed to compare routes',
      message: error.message,
    });
  }
});