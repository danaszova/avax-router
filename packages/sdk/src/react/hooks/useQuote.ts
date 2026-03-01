/**
 * useQuote Hook
 * 
 * Fetch the best quote for a token swap
 */

import { useState, useEffect, useCallback } from 'react';
import { AvaxRouter, QuoteParams, QuoteResult, AvaxRouterConfig } from '../..';

export interface UseQuoteOptions extends QuoteParams {
  /** SDK configuration */
  config?: AvaxRouterConfig;
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Refresh interval in ms (default: 10000) */
  refreshInterval?: number;
}

export interface UseQuoteResult {
  /** Quote result */
  quote: QuoteResult | null;
  /** Loading state */
  loading: boolean;
  /** Error if any */
  error: Error | null;
  /** Manually refetch */
  refetch: () => Promise<void>;
}

export function useQuote(options: UseQuoteOptions): UseQuoteResult {
  const { config, autoFetch = true, refreshInterval = 10000, ...quoteParams } = options;
  
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = new AvaxRouter(config);

  const fetchQuote = useCallback(async () => {
    if (!quoteParams.tokenIn || !quoteParams.tokenOut || !quoteParams.amountIn) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await client.getBestQuote(quoteParams);
      setQuote(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [quoteParams.tokenIn, quoteParams.tokenOut, quoteParams.amountIn, config]);

  useEffect(() => {
    if (autoFetch) {
      fetchQuote();
    }
  }, [fetchQuote, autoFetch]);

  // Auto-refresh
  useEffect(() => {
    if (!autoFetch || !refreshInterval) return;

    const interval = setInterval(fetchQuote, refreshInterval);
    return () => clearInterval(interval);
  }, [autoFetch, refreshInterval, fetchQuote]);

  return {
    quote,
    loading,
    error,
    refetch: fetchQuote,
  };
}