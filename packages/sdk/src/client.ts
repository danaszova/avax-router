/**
 * AVAX Router SDK Client
 * 
 * Main entry point for interacting with AVAX Router
 */

import {
  AvaxRouterConfig,
  QuoteParams,
  QuoteResult,
  SwapParams,
  SwapResult,
  SwapStatus,
  API_ENDPOINTS,
} from './types';

export class AvaxRouter {
  private apiUrl: string;
  private partnerId?: string;
  private partnerFeeBps?: number;
  private partnerAddress?: string;

  constructor(config: AvaxRouterConfig = {}) {
    this.apiUrl = config.apiUrl || API_ENDPOINTS.mainnet;
    this.partnerId = config.partnerId;
    this.partnerFeeBps = config.partnerFeeBps;
    this.partnerAddress = config.partnerAddress;

    // Validate partner config
    if (this.partnerFeeBps && this.partnerFeeBps > 50) {
      throw new Error('Partner fee cannot exceed 50 basis points (0.50%)');
    }
    if (this.partnerFeeBps && !this.partnerAddress) {
      throw new Error('Partner address required when partner fee is set');
    }
  }

  /**
   * Get the best quote across all DEXes
   */
  async getBestQuote(params: QuoteParams): Promise<QuoteResult> {
    const queryParams = new URLSearchParams({
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
    });

    if (this.partnerId) {
      queryParams.append('partnerId', this.partnerId);
    }

    const response = await fetch(`${this.apiUrl}/quote?${queryParams}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      ...data,
      amountIn: BigInt(data.amountIn),
      amountOut: BigInt(data.amountOut),
      allQuotes: data.allQuotes.map((q: any) => ({
        ...q,
        amountOut: BigInt(q.amountOut),
      })),
      estimatedGas: data.estimatedGas ? BigInt(data.estimatedGas) : undefined,
    };
  }

  /**
   * Get quotes from all DEXes
   */
  async getAllQuotes(params: QuoteParams): Promise<QuoteResult[]> {
    const queryParams = new URLSearchParams({
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      allDexes: 'true',
    });

    const response = await fetch(`${this.apiUrl}/quote?${queryParams}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Prepare a swap transaction (returns unsigned transaction data)
   */
  async prepareSwap(params: SwapParams): Promise<{
    to: string;
    data: string;
    value: string;
    gasLimit?: string;
  }> {
    const body: any = {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      slippagePercent: params.slippagePercent ?? 0.5,
      recipient: params.recipient,
    };

    if (this.partnerAddress && this.partnerFeeBps) {
      body.partner = this.partnerAddress;
      body.partnerFeeBps = this.partnerFeeBps;
    }

    const response = await fetch(`${this.apiUrl}/swap/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
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
  async swap(params: SwapParams, signer: any): Promise<SwapResult> {
    // Prepare the transaction
    const txData = await this.prepareSwap(params);
    
    // Execute via signer
    const tx = await signer.sendTransaction({
      to: txData.to,
      data: txData.data,
      value: txData.value,
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      amountIn: params.amountIn,
      amountOut: '0', // Would need to parse from logs
      dexUsed: 'unknown', // Would need to parse from logs
      protocolFee: '0',
    };
  }

  /**
   * Get the status of a swap transaction
   */
  async getSwapStatus(txHash: string): Promise<SwapStatus> {
    const response = await fetch(`${this.apiUrl}/swap/status/${txHash}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      ...data,
      gasUsed: data.gasUsed ? BigInt(data.gasUsed) : undefined,
    };
  }

  /**
   * Get list of supported tokens
   */
  async getSupportedTokens(): Promise<Array<{
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  }>> {
    const response = await fetch(`${this.apiUrl}/tokens`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get list of supported DEXes
   */
  async getSupportedDexes(): Promise<Array<{
    name: string;
    adapter: string;
    version: string;
  }>> {
    const response = await fetch(`${this.apiUrl}/dexes`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton for convenience
let defaultClient: AvaxRouter | null = null;

export function getClient(config?: AvaxRouterConfig): AvaxRouter {
  if (!defaultClient || config) {
    defaultClient = new AvaxRouter(config);
  }
  return defaultClient;
}