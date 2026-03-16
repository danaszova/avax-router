"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react/index.ts
var react_exports = {};
__export(react_exports, {
  useQuote: () => useQuote,
  useSwap: () => useSwap
});
module.exports = __toCommonJS(react_exports);

// src/react/hooks/useQuote.ts
var import_react = require("react");

// src/types.ts
var API_ENDPOINTS = {
  mainnet: "https://avax-router-api.avaxrouter.workers.dev",
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
  const [quote, setQuote] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const client = new AvaxRouter(config);
  const fetchQuote = (0, import_react.useCallback)(async () => {
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
  (0, import_react.useEffect)(() => {
    if (autoFetch) {
      fetchQuote();
    }
  }, [fetchQuote, autoFetch]);
  (0, import_react.useEffect)(() => {
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
var import_react2 = require("react");
function useSwap(options = {}) {
  const { config } = options;
  const [txHash, setTxHash] = (0, import_react2.useState)(null);
  const [loading, setLoading] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(null);
  const client = new AvaxRouter(config);
  const swap = (0, import_react2.useCallback)(async (params, signer) => {
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
  const reset = (0, import_react2.useCallback)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useQuote,
  useSwap
});
//# sourceMappingURL=index.js.map