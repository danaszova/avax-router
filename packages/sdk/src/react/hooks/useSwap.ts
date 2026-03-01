/**
 * useSwap Hook
 * 
 * Execute a token swap
 */

import { useState, useCallback } from 'react';
import { AvaxRouter, SwapParams, SwapResult, AvaxRouterConfig } from '../..';

export interface UseSwapOptions {
  /** SDK configuration */
  config?: AvaxRouterConfig;
}

export interface UseSwapResult {
  /** Execute the swap */
  swap: (params: SwapParams, signer: any) => Promise<SwapResult>;
  /** Transaction hash after swap */
  txHash: string | null;
  /** Loading state */
  loading: boolean;
  /** Error if any */
  error: Error | null;
  /** Reset state */
  reset: () => void;
}

export function useSwap(options: UseSwapOptions = {}): UseSwapResult {
  const { config } = options;
  
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = new AvaxRouter(config);

  const swap = useCallback(async (params: SwapParams, signer: any): Promise<SwapResult> => {
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const result = await client.swap(params, signer);
      setTxHash(result.txHash);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [config]);

  const reset = useCallback(() => {
    setTxHash(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    swap,
    txHash,
    loading,
    error,
    reset,
  };
}