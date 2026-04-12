// src/types.ts
var AVALANCHE_TOKENS = {
  // Tier 1: Highest liquidity
  AVAX: "0x0000000000000000000000000000000000000000",
  WAVAX: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  USDC: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
  USDT: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
  DAI: "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
  USDC_E: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
  WBTC: "0x50b7545627a5162f82a992c33b87adc75187b218",
  WETH: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
  BTC_B: "0x152b9d0fdc40c096757f570a51e494bd4b943e50",
  SAVAX: "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be",
  LINK: "0x5947bb275c521040051d82396192181b413227a3",
  GMX: "0x62edc0692bd897d2295872a9ffcac5425011c661",
  FRAX: "0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64",
  // Tier 2: Good liquidity
  JOE: "0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd",
  PNG: "0x60781c2586d68229fde47564546784ab3faca982",
  QI: "0x8729438eb15e2c8b576fcc6aecda6a148776c0f5",
  CRV: "0x47536f17f4ff30e64a96a7555826b8f9e66ec468",
  // Tier 3: Moderate liquidity
  COQ: "0x420fca0121dc28039145009570975747295f2329"
};
var DEX_ROUTER_ADDRESS = "0x81308B8e4C72E5aA042ADA30f9b29729c5a43098";
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
var defaultClient = null;
function getClient(config) {
  if (!defaultClient || config) {
    defaultClient = new AvaxRouter(config);
  }
  return defaultClient;
}
export {
  API_ENDPOINTS,
  AVALANCHE_TOKENS,
  AvaxRouter,
  DEX_ROUTER_ADDRESS,
  getClient
};
//# sourceMappingURL=index.mjs.map