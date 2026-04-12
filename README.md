# 🚀 AVAX Router — Avalanche DEX Aggregator

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg?style=flat-square)](https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/)
[![npm widget](https://img.shields.io/npm/v/@snowmonster_defi/widget.svg?style=flat-square&label=%40snowmonster_defi%2Fwidget)](https://www.npmjs.com/package/@snowmonster_defi/widget)
[![npm sdk](https://img.shields.io/npm/v/@danaszova/avax-router-sdk.svg?style=flat-square&label=%40danaszova%2Favax-router-sdk)](https://www.npmjs.com/package/@danaszova/avax-router-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**The easiest way to add DEX swaps to your app — and earn money doing it.**

Embed our swap widget in 3 lines of code. Earn **0.25% on every swap** through your integration.

[**🎯 Try Live Demo →**](https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/)

</div>

---

## 💰 Earn Money as a Partner

Integrate AVAX Router into your app and earn **0.25% of every swap** — automatically, transparently, and on-chain.

### How Much Can You Earn?

| Daily Swap Volume | Your Earnings (0.25%) | Monthly Revenue |
|:-----------------:|:---------------------:|:---------------:|
| $10,000 | $25/day | **$750/month** |
| $50,000 | $125/day | **$3,750/month** |
| $100,000 | $250/day | **$7,500/month** |
| $500,000 | $1,250/day | **$37,500/month** |

### How It Works

```
User swaps $1,000 AVAX → USDC through your app:
  💰 You earn:    $2.50  (0.25% partner fee)
  🏛️ Protocol:    $0.50  (0.05% protocol fee)
  👤 User pays:   $3.00 total — still 2-3x cheaper than competitors
```

Fees are split on-chain by our `PartnerRegistry` smart contract — **fully transparent and trustless**. No middleman, no delays, no accounting.

### Start Earning in 3 Steps

1. **Install the widget**
2. **Add your partner ID**
3. **Start earning on every swap**

👇

---

## 🚀 Quick Start: Embed the Widget

The fastest way to add Avalanche DEX swaps to your React app.

### Install

```bash
npm install @snowmonster_defi/widget
```

### Use

```tsx
import { DexRouterWidget, Web3Provider } from '@snowmonster_defi/widget';

function App() {
  return (
    <Web3Provider>
      <DexRouterWidget
        theme="dark"
        primaryColor="#E84142"
        partnerId="your-partner-id"
        onSwapSuccess={(tx) => console.log('💰 You earned a fee!', tx)}
      />
    </Web3Provider>
  );
}
```

That's it. You now have a fully functional swap widget with wallet connection, 18+ tokens, and automatic partner fee tracking.

### Widget Screenshots

> 📸 **Screenshots coming soon!** Run the [live demo](https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/) to see the widget in action.

<!-- Uncomment when screenshots are ready:
<div align="center">
  <img src="docs/screenshots/widget-dark.png" width="400" alt="Dark theme" />
  <img src="docs/screenshots/widget-light.png" width="400" alt="Light theme" />
</div>
-->

### Widget Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'light' \| 'dark'` | `'dark'` | Color theme |
| `primaryColor` | `string` | `'#E84142'` | Brand color (hex) |
| `borderRadius` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'lg'` | Corner radius |
| `width` | `'compact' \| 'default' \| 'wide'` | `'default'` | Widget width |
| `defaultTokenIn` | `string` | `'AVAX'` | Default input token |
| `defaultTokenOut` | `string` | `'USDC'` | Default output token |
| `slippage` | `number` | `0.5` | Slippage tolerance (%) |
| `partnerId` | `string` | — | **Your partner ID for fee sharing** |
| `apiUrl` | `string` | Cloudflare Worker | Custom API endpoint |
| `hideRouteInfo` | `boolean` | `false` | Hide route details |
| `hideSettings` | `boolean` | `false` | Hide settings button |
| `onSwapStart` | `(quote) => void` | — | Swap initiated callback |
| `onSwapSuccess` | `(receipt) => void` | — | Swap success callback |
| `onSwapError` | `(error) => void` | — | Swap error callback |

### Widget Features

- ✅ Real-time price quotes from top DEXes
- ✅ **Partner fee sharing** — earn 0.25% on every swap
- ✅ Auto AVAX wrapping for native swaps
- ✅ Customizable themes and brand colors
- ✅ Mobile responsive design
- ✅ Built-in wallet connection (RainbowKit)
- ✅ 18+ Avalanche tokens supported
- ✅ Full TypeScript support

---

## ⚡ SDK: For Custom Integrations

Need more control? Use our lightweight SDK to build your own swap UI or integrate into existing apps.

```bash
npm install @danaszova/avax-router-sdk
```

### Quick Example

```typescript
import { AvaxRouter } from '@danaszova/avax-router-sdk';

const router = new AvaxRouter({
  partnerId: 'your-partner-id',
  partnerFeeBps: 25,  // 0.25% fee
});

// Get the best quote across all DEXes
const quote = await router.getBestQuote({
  tokenIn: 'AVAX',
  tokenOut: 'USDC',
  amountIn: '1.0',
});

console.log(`Best price: ${quote.amountOutFormatted} USDC via ${quote.bestDex}`);
```

### React Hooks

```tsx
import { useQuote, useSwap } from '@danaszova/avax-router-sdk/react';

function SwapComponent() {
  const { quote, loading } = useQuote({
    tokenIn: 'AVAX',
    tokenOut: 'USDC',
    amountIn: '1.0',
    refreshInterval: 10000,  // Auto-refresh every 10s
  });

  const { swap } = useSwap();

  if (loading) return <div>Finding best price...</div>;

  return (
    <div>
      <h2>{quote?.amountOutFormatted} USDC</h2>
      <p>via {quote?.bestDex}</p>
      <button onClick={() => swap(quote, signer)}>Swap</button>
    </div>
  );
}
```

### Widget vs SDK: Which Should You Use?

| | **Widget** | **SDK** |
|---|:---:|:---:|
| **UI Included** | ✅ Complete swap UI | ❌ Build your own |
| **Wallet Connection** | ✅ Built-in (RainbowKit) | ❌ Bring your own |
| **Bundle Size** | ~2 MB | ~7 KB |
| **React Hooks** | — | ✅ `useQuote`, `useSwap` |
| **Customization** | Themes & colors | Full control |
| **Partner Fees** | ✅ 0.25% | ✅ 0-0.50% |
| **Best For** | Quick integration, no UI work | Custom apps, existing UIs |

**Use the Widget** if you want a ready-to-use swap interface with minimal code.

**Use the SDK** if you need full control over the UI, want smaller bundle size, or are integrating into an existing app.

---

## 📡 Supported DEXes & Tokens

### DEXes

| DEX | Type | Status |
|-----|------|--------|
| Trader Joe V1 | AMM | ✅ Live |
| More coming soon | — | 📋 Planned |

### Tokens (18+)

AVAX, WAVAX, USDC, USDT, DAI, USDC.e, WBTC, WETH, BTC.b, sAVAX, LINK, GMX, FRAX, JOE, PNG, QI, CRV, COQ, and more.

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────┐
│          Your App (React / Next.js)        │
│                                            │
│   Widget Package      or      SDK Package  │
│   (full UI + swap)           (hooks only)  │
└──────────────────┬────────────────────────┘
                   │ API calls
                   ▼
┌───────────────────────────────────────────┐
│       Cloudflare Worker API (edge)         │
│  ┌──────────────┐  ┌───────────────┐      │
│  │ Quote Engine  │  │ Route Finder  │      │
│  └──────────────┘  └───────────────┘      │
└──────────────────┬────────────────────────┘
                   │ on-chain calls
                   ▼
┌───────────────────────────────────────────┐
│       Smart Contracts (Avalanche C-Chain)  │
│  ┌──────────────┐  ┌───────────────┐      │
│  │  DexRouter    │  │PartnerRegistry│      │
│  └──────┬───────┘  └───────────────┘      │
│         │                                  │
│  ┌──────┴───────┐                          │
│  │ DEX Adapters  │                          │
│  └──────────────┘                          │
└──────────────────┬────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────┐
│        Trader Joe (Avalanche DEX)          │
└───────────────────────────────────────────┘
```

---

## 📦 npm Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@snowmonster_defi/widget`](https://www.npmjs.com/package/@snowmonster_defi/widget) | [![npm](https://img.shields.io/npm/v/@snowmonster_defi/widget.svg)](https://www.npmjs.com/package/@snowmonster_defi/widget) | Embeddable React swap widget |
| [`@danaszova/avax-router-sdk`](https://www.npmjs.com/package/@danaszova/avax-router-sdk) | [![npm](https://img.shields.io/npm/v/@danaszova/avax-router-sdk.svg)](https://www.npmjs.com/package/@danaszova/avax-router-sdk) | Lightweight TypeScript SDK |
| [`@snowmonster_defi/sdk`](https://www.npmjs.com/package/@snowmonster_defi/sdk) | [![npm](https://img.shields.io/npm/v/@snowmonster_defi/sdk.svg)](https://www.npmjs.com/package/@snowmonster_defi/sdk) | SDK (alternative package name) |

---

## 📡 API Endpoints

Base URL: `https://avax-router-api.avaxrouter.workers.dev`

### Get Best Quote

```bash
GET /quote/best?tokenIn=AVAX&tokenOut=USDC&amountIn=1.0
```

```json
{
  "bestDex": "TraderJoeV1",
  "amountIn": "1.0",
  "amountOut": "905794",
  "amountOutFormatted": 0.905794,
  "priceImpact": 0.05,
  "route": ["0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"],
  "estimatedGas": "120000",
  "allQuotes": [{ "dex": "TraderJoeV1", "amountOut": "905794" }]
}
```

### Health Check

```bash
GET /health
```

---

## 🔧 Deployed Contracts

### Avalanche Mainnet (C-Chain, Chain ID: 43114)

| Contract | Address |
|----------|---------|
| DexRouter | `0x81308B8e4C72E5aA042ADA30f9b29729c5a43098` |
| PartnerRegistry | `0xBF1f8E2872E82555e1Ce85b31077e2903368d943` |
| TraderJoe V1 Adapter | `0x108831f20954211336704eaE0483e887a7bfd3A1` |

### Fuji Testnet (Chain ID: 43113)

| Contract | Address |
|----------|---------|
| DexRouter | `0xc4396498B42DE35D38CE47c38e75240a49B5452a` |
| PartnerRegistry | `0xEC19b44BAfB8572dfEaec8Fd38A1E15aCA82E01a` |
| TraderJoe V1 Adapter | `0x62d133b127786c4D2D9e7D64dDdD4Cac7685eA8c` |

> 📖 **Want to deploy your own contracts?** See [docs/CONTRACT_DEPLOYMENT.md](docs/CONTRACT_DEPLOYMENT.md) for the full guide.

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Trader Joe V1 adapter
- [x] Cloudflare Worker API
- [x] React widget (npm package)
- [x] SDK with React hooks
- [x] Partner fee sharing system
- [x] Mainnet deployment

### Phase 2: Growth
- [ ] More DEX integrations (Pangolin, Curve)
- [ ] Multi-hop routing optimization
- [ ] Split routing across DEXs
- [ ] Partner dashboard

### Phase 3: Scale
- [ ] Limit orders
- [ ] MEV protection
- [ ] Cross-chain support

---

## 🔒 Security

- Contracts use OpenZeppelin security primitives
- ReentrancyGuard on all swap functions
- Owner-only administrative functions
- Partner fee system is on-chain and transparent

⚠️ **Contracts are unaudited. Use at your own risk.**

---

## 🚀 Local Development

```bash
# Clone and install
git clone https://github.com/danaszova/avax-router.git
cd avax-router
yarn install

# Build widget
cd packages/widget && npm run build

# Build SDK
cd packages/sdk && npm run build

# Run demo app
cd packages/demo-app && npm run dev
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for the Avalanche ecosystem by [SnowMonster DeFi](https://github.com/danaszova)**

[🌐 Live Demo](https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/) · [📦 npm Widget](https://www.npmjs.com/package/@snowmonster_defi/widget) · [📦 npm SDK](https://www.npmjs.com/package/@danaszova/avax-router-sdk) · [🐙 GitHub](https://github.com/danaszova/avax-router)

</div>