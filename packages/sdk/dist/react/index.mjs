// src/react/hooks/useQuote.ts
import { useState, useEffect, useCallback } from "react";

// src/types.ts
var API_ENDPOINTS = {
  mainnet: "https://api.avaxrouter.com",
  testnet: "https://api-testnet.avaxrouter.com",
  local: "http://localhost:3000"
};

// src/client.ts
var AvaxRouter = class {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || API_ENDPOINTS.mainnet;
    this.partnerId = config.partnerId;
    this.partnerFeeBps = config.partnerFeeBps;
    this.partnerAddress = config.partnerAddress;
    if (this.partnerFeeBps && this.partnerFeeBps > 50) {
      throw new Error("Partner fee cannot exceed 50 basis points (0.50%)");
    }
    if (this.partnerFeeBps && !this.partnerAddress) {
      throw new Error("Partner address required when partner fee is set");
    }
  }
  /**
   * Get the best quote across all DEXes
   */
  async getBestQuote(params) {
    const queryParams = new URLSearchParams({
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn
    });
    if (this.partnerId) {
      queryParams.append("partnerId", this.partnerId);
    }
    const response = await fetch(`${this.apiUrl}/quote?${queryParams}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      ...data,
      amountIn: BigInt(data.amountIn),
      amountOut: BigInt(data.amountOut),
      allQuotes: data.allQuotes.map((q) => ({
        ...q,
        amountOut: BigInt(q.amountOut)
      })),
      estimatedGas: data.estimatedGas ? BigInt(data.estimatedGas) : void 0
    };
  }
  /**
   * Get quotes from all DEXes
   */
  async getAllQuotes(params) {
    const queryParams = new URLSearchParams({
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      allDexes: "true"
    });
    const response = await fetch(`${this.apiUrl}/quote?${queryParams}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `API error: ${response.status}`);
    }
    return response.json();
  }
  /**
   * Prepare a swap transaction (returns unsigned transaction data)
   */
  async prepareSwap(params) {
    const body = {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      slippagePercent: params.slippagePercent ?? 0.5,
      recipient: params.recipient
    };
    if (this.partnerAddress && this.partnerFeeBps) {
      body.partner = this.partnerAddress;
      body.partnerFeeBps = this.partnerFeeBps;
    }
    const response = await fetch(`${this.apiUrl}/swap/prepare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `API error: ${response.status}`);
    }
    return response.json();
  }
  /**
   * Execute a swap (requires signer - use with ethers.js or viem)
   * 
   * @example
   * // With ethers.js
   * const router = new AvaxRouter();
   * const signer = await ethers.getSigner();
   * const result = await router.swap({ tokenIn: 'AVAX', tokenOut: 'USDC', amountIn: '1.0' }, signer);
   */
  async swap(params, signer) {
    const txData = await this.prepareSwap(params);
    const tx = await signer.sendTransaction({
      to: txData.to,
      data: txData.data,
      value: txData.value
    });
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      amountIn: params.amountIn,
      amountOut: "0",
      // Would need to parse from logs
      dexUsed: "unknown",
      // Would need to parse from logs
      protocolFee: "0"
    };
  }
  /**
   * Get the status of a swap transaction
   */
  async getSwapStatus(txHash) {
    const response = await fetch(`${this.apiUrl}/swap/status/${txHash}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      ...data,
      gasUsed: data.gasUsed ? BigInt(data.gasUsed) : void 0
    };
  }
  /**
   * Get list of supported tokens
   */
  async getSupportedTokens() {
    const response = await fetch(`${this.apiUrl}/tokens`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }
  /**
   * Get list of supported DEXes
   */
  async getSupportedDexes() {
    const response = await fetch(`${this.apiUrl}/dexes`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }
};

// src/react/hooks/useQuote.ts
function useQuote(options) {
  const { config, autoFetch = true, refreshInterval = 1e4, ...quoteParams } = options;
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
  useEffect(() => {
    if (!autoFetch || !refreshInterval) return;
    const interval = setInterval(fetchQuote, refreshInterval);
    return () => clearInterval(interval);
  }, [autoFetch, refreshInterval, fetchQuote]);
  return {
    quote,
    loading,
    error,
    refetch: fetchQuote
  };
}

// src/react/hooks/useSwap.ts
import { useState as useState2, useCallback as useCallback2 } from "react";
function useSwap(options = {}) {
  const { config } = options;
  const [txHash, setTxHash] = useState2(null);
  const [loading, setLoading] = useState2(false);
  const [error, setError] = useState2(null);
  const client = new AvaxRouter(config);
  const swap = useCallback2(async (params, signer) => {
    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const result = await client.swap(params, signer);
      setTxHash(result.txHash);
      return result;
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error(String(err));
      setError(error2);
      throw error2;
    } finally {
      setLoading(false);
    }
  }, [config]);
  const reset = useCallback2(() => {
    setTxHash(null);
    setLoading(false);
    setError(null);
  }, []);
  return {
    swap,
    txHash,
    loading,
    error,
    reset
  };
}
export {
  useQuote,
  useSwap
};
//# sourceMappingURL=index.mjs.map