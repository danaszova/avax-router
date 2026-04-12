# AVAX Router Widget

Embeddable swap widget for Avalanche DEX Router. Add DeFi swaps to your React app in minutes — and **earn 0.25% on every swap** through partner fee sharing.

## 💰 Partner Fee Sharing

When you integrate the widget with your `partnerId`, you earn **0.25% of every swap** automatically:

```
$1,000 swap through your app → You earn $2.50
$10,000 swap through your app → You earn $25.00
$100,000 swap through your app → You earn $250.00
```

Fees are split on-chain by our `PartnerRegistry` contract — transparent and trustless.

## Installation

```bash
npm install @snowmonster_defi/widget
# or
yarn add @snowmonster_defi/widget
```

## Quick Start

### 1. Wrap your app with Web3Provider

```tsx
import { Web3Provider } from '@snowmonster_defi/widget';

function App() {
  return (
    <Web3Provider theme="dark">
      <YourApp />
    </Web3Provider>
  );
}
```

### 2. Add the Widget

```tsx
import { DexRouterWidget } from '@snowmonster_defi/widget';

function SwapPage() {
  return (
    <DexRouterWidget
      theme="dark"
      primaryColor="#E84142"
      defaultTokenIn="AVAX"
      defaultTokenOut="USDC"
      partnerId="your-partner-id"
      onSwapSuccess={(receipt) => console.log('Swap done!', receipt)}
    />
  );
}
```

## Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'light' \| 'dark'` | `'dark'` | Color theme |
| `primaryColor` | `string` | `'#E84142'` | Brand color (hex) |
| `borderRadius` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'lg'` | Corner radius |
| `width` | `'compact' \| 'default' \| 'wide'` | `'default'` | Widget width |
| `defaultTokenIn` | `string` | - | Default input token (address or symbol) |
| `defaultTokenOut` | `string` | - | Default output token (address or symbol) |
| `slippage` | `number` | `0.5` | Slippage tolerance (%) |
| `partnerId` | `string` | - | **Your partner ID for fee sharing** |
| `apiUrl` | `string` | Cloudflare Worker | Custom API endpoint |
| `hideRouteInfo` | `boolean` | `false` | Hide route details |
| `hideSettings` | `boolean` | `false` | Hide settings button |
| `onSwapStart` | `(quote) => void` | - | Swap initiated callback |
| `onSwapSuccess` | `(receipt) => void` | - | Swap success callback |
| `onSwapError` | `(error) => void` | - | Swap error callback |

## Features

- ✅ Real-time price quotes from top DEXs
- ✅ Partner fee sharing (earn 0.25%)
- ✅ Auto AVAX wrapping for native swaps
- ✅ Customizable themes and colors
- ✅ Mobile responsive
- ✅ Wallet connection (RainbowKit)
- ✅ 18+ Avalanche tokens supported
- ✅ TypeScript native

## Supported DEXs

| DEX | Status |
|-----|--------|
| Trader Joe V1 | ✅ Live |

More DEX integrations coming soon.

## Deployed Contracts (Avalanche Mainnet)

| Contract | Address |
|----------|---------|
| DexRouter | `0x81308B8e4C72E5aA042ADA30f9b29729c5a43098` |
| PartnerRegistry | `0xBF1f8E2872E82555e1Ce85b31077e2903368d943` |
| TraderJoe V1 Adapter | `0x108831f20954211336704eaE0483e887a7bfd3A1` |

## Build

```bash
cd packages/widget
npm install
npm run build
```

## License

MIT