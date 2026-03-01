/**
 * AVAX Router React SDK
 * 
 * React hooks and components for AVAX Router
 * 
 * @example
 * import { useQuote, useSwap } from '@avax-router/sdk/react';
 * 
 * function MySwapComponent() {
 *   const { quote, loading } = useQuote({
 *     tokenIn: 'AVAX',
 *     tokenOut: 'USDC',
 *     amountIn: '1.0',
 *   });
 *   
 *   const { swap, loading: swapping } = useSwap();
 *   
 *   return (
 *     // ... your UI
 *   );
 * }
 */

// Hooks
export { useQuote } from './hooks/useQuote';
export type { UseQuoteOptions, UseQuoteResult } from './hooks/useQuote';

export { useSwap } from './hooks/useSwap';
export type { UseSwapOptions, UseSwapResult } from './hooks/useSwap';

// Re-export types from core
export type {
  AvaxRouterConfig,
  QuoteParams,
  QuoteResult,
  SwapParams,
  SwapResult,
} from '..';