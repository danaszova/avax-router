export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  /** If true, this represents the native chain token (e.g. AVAX) and will auto-unwrap from WAVAX */
  isNative?: boolean;
}

export interface Quote {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  amountOutFormatted?: number;
  bestDex: string;
  priceImpact: number;
  route: string[];
  estimatedGas: number;
  savings: number;
  allQuotes: SingleQuote[];
  timestamp?: number;
}

export interface SingleQuote {
  dex: string;
  amountOut: string;
  priceImpact: number;
}

export interface WidgetConfig {
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  borderRadius?: 'sm' | 'md' | 'lg' | 'full';
  width?: 'compact' | 'default' | 'wide';
  defaultTokenIn?: string;
  defaultTokenOut?: string;
  tokenList?: 'default' | 'extended' | Token[];
  slippage?: number;
  hideRouteInfo?: boolean;
  hideSettings?: boolean;
  /** @deprecated Use partnerAddress instead */
  partnerId?: string;
  /** Partner wallet address to receive fees (0.25% of swaps) */
  partnerAddress?: string;
  /** Partner fee in basis points (default: 25 = 0.25%, max: 50 = 0.50%) */
  partnerFeeBps?: number;
  apiUrl?: string;
  onSwapStart?: (quote: Quote) => void;
  onSwapSuccess?: (receipt: any) => void;
  onSwapError?: (error: Error) => void;
}

export interface SwapState {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  amountOut: string;
  quote: Quote | null;
  loading: boolean;
  error: string | null;
}