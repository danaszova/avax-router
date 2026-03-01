/**
 * AVAX Router SDK
 * 
 * No favorites. No games. Just the best price.
 * 
 * @example
 * import { AvaxRouter } from '@avax-router/sdk';
 * 
 * const router = new AvaxRouter();
 * const quote = await router.getBestQuote({
 *   tokenIn: 'AVAX',
 *   tokenOut: 'USDC',
 *   amountIn: '1.0',
 * });
 */

// Core client
export { AvaxRouter, getClient } from './client';

// Types
export type {
  AvaxRouterConfig,
  TokenInfo,
  QuoteParams,
  QuoteResult,
  DexQuote,
  SwapParams,
  SwapResult,
  SwapStatus,
} from './types';

// Constants
export {
  AVALANCHE_TOKENS,
  DEX_ROUTER_ADDRESS,
  API_ENDPOINTS,
} from './types';
