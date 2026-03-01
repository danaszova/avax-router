# @danaszova/avax-router-sdk

<div align="center">

[![npm version](https://img.shields.io/npm/v/@danaszova/avax-router-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@danaszova/avax-router-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@danaszova/avax-router-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@danaszova/avax-router-sdk)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@danaszova/avax-router-sdk?style=flat-square)](https://bundlephobia.com/package/@danaszova/avax-router-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg?style=flat-square)](https://codesandbox.io/s/github/avax-router/sdk/tree/main/demo/codesandbox)

**🚀 The Most Powerful DEX Aggregator SDK on Avalanche**

*Stop manually checking multiple DEXes. Get the best swap rate with a single API call.*

[**Try Live Demo →**](https://codesandbox.io/s/avax-router-sdk-demo)

</div>

---

## What Problem Does This Solve?

Every DEX on Avalanche has different prices and liquidity. Finding the best swap rate means checking Trader Joe, Pangolin, and others manually. **This SDK does it for you automatically** - querying all DEXes in parallel and returning the best execution.

**Result:** Users get more tokens for their swaps. You earn partner fees. Everyone wins.

---

## Installation

```bash
npm install @danaszova/avax-router-sdk
```

---

## Quick Start

### 30-Second Example (Copy & Paste)

```typescript
import { AvaxRouter } from '@danaszova/avax-router-sdk';

const router = new AvaxRouter();

// Get the best quote across all DEXes
const quote = await router.getBestQuote({
  tokenIn: 'AVAX',
  tokenOut: 'USDC', 
  amountIn: '1.0',
});

console.log(`You get: ${quote.amountOutFormatted} USDC`);
console.log(`Best DEX: ${quote.bestDex}`);
console.log(`Savings: ${quote.savingsVsWorst}% vs worst route`);
```

### React Example

```tsx
import { useQuote, useSwap } from '@danaszova/avax-router-sdk/react';

function SwapWidget() {
  const { quote, loading } = useQuote({
    tokenIn: 'AVAX',
    tokenOut: 'USDC',
    amountIn: '1.0',
  });

  const { swap } = useSwap();

  if (loading) return <div>Finding best price...</div>;

  return (
    <div>
      <h2>Best Price: {quote?.amountOutFormatted} USDC</h2>
      <p>via {quote?.bestDex}</p>
      <button onClick={() => swap(quote, signer)}>Swap</button>
    </div>
  );
}
```

---

## API Reference

### Core SDK

#### `new AvaxRouter(config?)`

Create a new router instance.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | `string` | Production API | Custom API endpoint |
| `partnerId` | `string` | - | Your partner ID for fee sharing |
| `partnerAddress` | `string` | - | Address to receive partner fees |
| `partnerFeeBps` | `number` | 0 | Partner fee in basis points (max: 50 = 0.50%) |

#### `router.getBestQuote(params)`

Get the best quote across all supported DEXes.

```typescript
const quote = await router.getBestQuote({
  tokenIn: 'AVAX',      // Token symbol or address
  tokenOut: 'USDC',     // Token symbol or address
  amountIn: '1.0',      // Amount as string
  slippagePercent: 0.5, // Optional, default 0.5%
});
```

**Returns:**
```typescript
{
  amountOut: string;          // Raw output amount
  amountOutFormatted: string; // Human-readable amount
  bestDex: string;            // DEX with best price
  route: string[];            // Swap route path
  priceImpact: number;        // Price impact %
  savingsVsWorst: number;     // Savings vs worst DEX
}
```

#### `router.getAllQuotes(params)`

Get quotes from all DEXes for comparison.

```typescript
const quotes = await router.getAllQuotes({
  tokenIn: 'AVAX',
  tokenOut: 'USDC',
  amountIn: '1.0',
});

quotes.forEach(q => {
  console.log(`${q.dex}: ${q.amountOutFormatted}`);
});
```

#### `router.swap(params, signer)`

Execute a swap with the best route.

```typescript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const result = await router.swap({
  tokenIn: 'AVAX',
  tokenOut: 'USDC',
  amountIn: '1.0',
  slippagePercent: 0.5,
}, signer);

console.log(`TX: ${result.txHash}`);
```

#### `router.getSupportedTokens()`

Get list of all supported tokens.

#### `router.getSupportedDexes()`

Get list of all supported DEXes.

---

### React Hooks

#### `useQuote(params)`

React hook for fetching quotes with auto-refresh.

```typescript
const { 
  quote,           // Best quote
  quotes,          // All DEX quotes
  loading,         // Loading state
  error,           // Error object
  refetch          // Manual refetch function
} = useQuote({
  tokenIn: 'AVAX',
  tokenOut: 'USDC',
  amountIn: '1.0',
  autoFetch: true,          // Auto-fetch on mount
  refreshInterval: 10000,   // Refresh every 10s
});
```

#### `useSwap(config?)`

React hook for executing swaps.

```typescript
const { 
  swap,      // Execute swap function
  txHash,    // Transaction hash after swap
  loading,   // Loading state
  error,     // Error object
  reset      // Reset state
} = useSwap({
  partnerId: 'your-id',
  partnerFeeBps: 25,
});

// Execute
await swap({
  tokenIn: 'AVAX',
  tokenOut: 'USDC',
  amountIn: '1.0',
}, signer);
```

#### `useTokenPrice(token)`

Get real-time token price.

```typescript
const { price, loading, error } = useTokenPrice('AVAX');
```

#### `useWallet()`

Get wallet connection state.

```typescript
const { address, isConnected, chainId } = useWallet();
```

---

## 💰 Partner Fees (Monetize Your App!)

Earn up to **0.50%** on every swap through your integration:

```typescript
const router = new AvaxRouter({
  partnerId: 'my-dapp',
  partnerAddress: '0xYourAddress',
  partnerFeeBps: 25, // 0.25% fee
});
```

| Daily Volume | Your Fee (0.25%) | Monthly Earnings |
|--------------|------------------|------------------|
| $10,000 | $25/day | $750 |
| $100,000 | $250/day | $7,500 |
| $1,000,000 | $2,500/day | $75,000 |

---

## Supported DEXes

| DEX | Type | Status |
|-----|------|--------|
| Trader Joe V1 | AMM | ✅ Live |
| Trader Joe V2 | Liquidity Book | ✅ Live |
| Pangolin | AMM | ✅ Live |

---

## Token Addresses

```typescript
import { AVALANCHE_TOKENS } from '@danaszova/avax-router-sdk';

AVALANCHE_TOKENS.AVAX;   // Native
AVALANCHE_TOKENS.WAVAX;  // 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7
AVALANCHE_TOKENS.USDC;   // 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
AVALANCHE_TOKENS.USDT;   // 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7
AVALANCHE_TOKENS.JOE;    // 0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd
AVALANCHE_TOKENS.PNG;    // 0x60781C2586D68229fde47564546784ab3fACA982
```

---

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { 
  Quote,
  SwapParams,
  SwapResult,
  AvaxRouterConfig,
  Token,
  Dex,
  UseQuoteOptions,
  UseSwapOptions,
} from '@danaszova/avax-router-sdk';
```

---

## Bundle Size

| Format | Size | Gzipped |
|--------|------|---------|
| ESM | ~7KB | ~2.5KB |
| CJS | ~8KB | ~2.8KB |

Tree-shakeable! Import only what you need.

---

## Requirements

- Node.js >= 16
- React >= 18 (for React hooks)
- ethers >= 6 (for swap execution)

---

## Framework Examples

### Next.js App Router

```typescript
// app/api/quote/route.ts
import { AvaxRouter } from '@danaszova/avax-router-sdk';

const router = new AvaxRouter();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const quote = await router.getBestQuote({
    tokenIn: searchParams.get('from')!,
    tokenOut: searchParams.get('to')!,
    amountIn: searchParams.get('amount')!,
  });
  return Response.json(quote);
}
```

### wagmi/viem

```tsx
import { useAccount, useWalletClient } from 'wagmi';
import { useQuote } from '@danaszova/avax-router-sdk/react';

function SwapComponent() {
  const { data: walletClient } = useWalletClient();
  const { quote } = useQuote({ tokenIn: 'AVAX', tokenOut: 'USDC', amountIn: '1' });
  // Use walletClient to sign transactions
}
```

---

## License

MIT © AVAX Router Team

---

<div align="center">

**Built with ❤️ on Avalanche**

[Website](https://avax-router.com) · [Docs](https://docs.avax-router.com) · [Twitter](https://twitter.com/avaxrouter) · [Discord](https://discord.gg/avaxrouter)

</div>