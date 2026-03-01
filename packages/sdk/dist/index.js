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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API_ENDPOINTS: () => API_ENDPOINTS,
  AVALANCHE_TOKENS: () => AVALANCHE_TOKENS,
  AvaxRouter: () => AvaxRouter,
  DEX_ROUTER_ADDRESS: () => DEX_ROUTER_ADDRESS,
  getClient: () => getClient
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var AVALANCHE_TOKENS = {
  AVAX: "0x0000000000000000000000000000000000000000",
  WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  JOE: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
  PNG: "0x60781C2586D68229fde47564546784ab3fACA982"
};
var DEX_ROUTER_ADDRESS = "0xYourDeployedContractAddress";
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
var defaultClient = null;
function getClient(config) {
  if (!defaultClient || config) {
    defaultClient = new AvaxRouter(config);
  }
  return defaultClient;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_ENDPOINTS,
  AVALANCHE_TOKENS,
  AvaxRouter,
  DEX_ROUTER_ADDRESS,
  getClient
});
//# sourceMappingURL=index.js.map