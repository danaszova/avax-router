import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';
import { RouterService } from '../services/router';
import { getTokenAddress, getTokenDecimals } from '../services/dex-apis';
import { logger } from '../utils/logger';

// Convert token symbol or address to checksummed address
function resolveToken(token: string): string {
  // If it's already an address, return it checksummed
  if (token.startsWith('0x')) {
    try {
      return ethers.getAddress(token);
    } catch {
      // If checksum fails, try with lowercase
      return ethers.getAddress(token.toLowerCase());
    }
  }
  // Look up by symbol
  return getTokenAddress(token);
}

export const QuoteRouter = Router();
const routerService = new RouterService();

/**
 * @route GET /api/v1/quote
 * @description Get a quote from a specific DEX
 * @query dex - DEX name (TraderJoeV2 or Pangolin)
 * @query tokenIn - Input token address
 * @query tokenOut - Output token address
 * @query amountIn - Input amount (in wei)
 */
QuoteRouter.get('/quote', async (req: Request, res: Response) => {
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
    const tokenInAddress = resolveToken(tokenIn as string);
    const tokenOutAddress = resolveToken(tokenOut as string);

    // Parse amountIn: if tokenIn is an address, assume wei. If symbol, assume decimal.
    // Also handle decimal points explicitly.
    const inDecimals = getTokenDecimals(tokenInAddress);
    let amountInWei: bigint;
    const amountStr = amountIn as string;
    if (amountStr.includes('.') || !(tokenIn as string).startsWith('0x')) {
      amountInWei = ethers.parseUnits(amountStr, inDecimals);
    } else {
      amountInWei = BigInt(amountStr);
    }

    const quote = await routerService.getQuote(
      dex as string,
      tokenInAddress,
      tokenOutAddress,
      amountInWei
    );

    const outDecimals = getTokenDecimals(tokenOutAddress);

    res.json({
      dex: dex,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      amountOut: quote.amountOut.toString(),
      amountOutFormatted: Number(quote.amountOut) / Math.pow(10, outDecimals),
      priceImpact: quote.priceImpact,
      route: quote.route,
      estimatedGas: quote.estimatedGas.toString(),
      timestamp: Date.now()
    });
  } catch (error: any) {
    logger.error('Quote error:', error.message || 'Unknown error');
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
QuoteRouter.get('/quote/best', async (req: Request, res: Response) => {
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
    const tokenInAddress = resolveToken(tokenIn as string);
    const tokenOutAddress = resolveToken(tokenOut as string);

    const inDecimals = getTokenDecimals(tokenInAddress);
    const outDecimals = getTokenDecimals(tokenOutAddress);

    // Parse amountIn: if tokenIn is an address, assume wei. If symbol, assume decimal.
    // Also handle decimal points explicitly.
    let amountInWei: bigint;
    const amountStr = amountIn as string;
    if (amountStr.includes('.') || !(tokenIn as string).startsWith('0x')) {
      amountInWei = ethers.parseUnits(amountStr, inDecimals);
    } else {
      amountInWei = BigInt(amountStr);
    }

    const bestRoute = await routerService.findBestRoute(
      tokenInAddress,
      tokenOutAddress,
      amountInWei
    );

    // Format output based on token decimals
    const amountOutFormatted = Number(bestRoute.amountOut) / Math.pow(10, outDecimals);

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
  } catch (error: any) {
    logger.error('Best route error:', error);
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
QuoteRouter.get('/quote/compare', async (req: Request, res: Response) => {
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
    const tokenInAddress = resolveToken(tokenIn as string);
    const tokenOutAddress = resolveToken(tokenOut as string);

    const comparison = await routerService.compareAllDexes(
      tokenInAddress,
      tokenOutAddress,
      BigInt(amountIn as string)
    );

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
  } catch (error: any) {
    logger.error('Compare quotes error:', error);
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
QuoteRouter.get('/dexes', (req: Request, res: Response) => {
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