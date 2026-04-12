# AVAX Router — Avalanche DEX Aggregator

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg?style=flat-square)](https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/)
[![npm](https://img.shields.io/npm/v/@snowmonster_defi/widget.svg?style=flat-square)](https://www.npmjs.com/package/@snowmonster_defi/widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A DEX aggregator for Avalanche that routes trades across top DEXs to find the best prices. Features a **partner fee sharing system** — integrate our widget and earn **0.25% of every swap**.

## 🎬 Live Demo

Try it live: https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/

- Real-time price quotes across top DEXs
- Best route finding with live comparison
- Interactive swap with wallet connection
- Powered by Cloudflare Workers API

## 💰 Partner Fee Sharing (Monetize Your Integration)

**Integrate the widget → Earn 0.25% on every swap through your app.**

Our smart contract system (`PartnerRegistry`) tracks referrals and automatically splits fees:

| Role | Fee | Description |
|------|-----|-------------|
| **Partner** | 0.25% | You earn this on every swap from your integration |
| **Protocol** | 0.05% | Goes to protocol treasury for maintenance |
| **Total** | 0.30% | Still 2-3x cheaper than most aggregators |

### How It Works

```
User swaps $1,000 AVAX → USDC through your integration:
  → Partner earns: $2.50 (0.25%)
  → Protocol earns: $0.50 (0.05%)
  → User pays: $3.00 total (vs $6-10 on competitors)
```

### Quick Integration

```tsx
import { DexRouterWidget, Web3Provider } from '@snowmonster_defi/widget';

function App() {
  return (
    <Web3Provider>
      <DexRouterWidget
        theme="dark"
        primaryColor="#E84142"
        partnerId="your-partner-id"     // Register at partner.avaxrouter.com
        onSwapSuccess={(tx) => console.log('Swap done!', tx)}
      />
    </Web3Provider>
  );
}
```

## 📦 Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`@snowmonster_defi/widget`](./packages/widget) | Embeddable React swap widget | [![npm](https://img.shields.io/npm/v/@snowmonster_defi/widget.svg)](https://www.npmjs.com/package/@snowmonster_defi/widget) |
| [`api-worker`](./packages/api-worker) | Cloudflare Worker API | Deployed |
| [`contracts`](./packages/contracts) | Solidity smart contracts | Verified on C-Chain |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Your App (React / Next.js)           │
│    ┌──────────────────────────────────┐      │
│    │     @snowmonster_defi/widget      │      │
│    └──────────────────────────────────┘      │
└──────────────────────┬───────────────────────┘
                       │ API calls
                       ▼
┌─────────────────────────────────────────────┐
│        Cloudflare Worker API                  │
│  ┌──────────────┐  ┌───────────────┐         │
│  │ Quote Service │  │ Route Finder  │         │
│  └──────────────┘  └───────────────┘         │
└──────────────────────┬───────────────────────┘
                       │ on-chain calls
                       ▼
┌─────────────────────────────────────────────┐
│        Smart Contracts (Solidity)             │
│  ┌──────────────┐  ┌───────────────┐         │
│  │  DexRouter    │  │PartnerRegistry│         │
│  └──────┬───────┘  └───────────────┘         │
│         │                                     │
│  ┌──────┴───────┐                             │
│  │TJ V1 Adapter │                             │
│  └──────────────┘                             │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│       Trader Joe (top Avalanche DEX)          │
└─────────────────────────────────────────────┘
```

## 🎯 Value Proposition

- **0.05% protocol fee** — among the lowest in DeFi
- **Real-time routing** across top Avalanche DEXs
- **Partner fee sharing** — earn 0.25% on every swap
- **Sub-second** finality on Avalanche
- **Open source** — fully auditable code

## 📡 API Endpoints

Base URL: `https://avax-router-api.avaxrouter.workers.dev`

### Get Best Quote

```bash
GET /quote/best?tokenIn=AVAX&tokenOut=USDC&amountIn=1.0
```

Response:
```json
{
  "bestDex": "TraderJoeV1",
  "amountIn": "1.0",
  "amountOut": "905794",
  "amountOutFormatted": 0.905794,
  "priceImpact": 0.05,
  "route": ["0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"],
  "estimatedGas": "120000",
  "allQuotes": [
    { "dex": "TraderJoeV1", "amountOut": "905794" }
  ]
}
```

### Get Quote from Specific DEX

```bash
GET /quote?tokenIn=AVAX&tokenOut=USDC&amountIn=1.0
```

### Health Check

```bash
GET /health
```

## 💵 Supported DEXs

| DEX | Type | Status |
|-----|------|--------|
| Trader Joe V1 | AMM | ✅ Live |
| More coming soon | — | 📋 Planned |

> **Note:** We currently aggregate quotes from Trader Joe V1. More DEX integrations (Pangolin, Curve, Platypus) are planned.

## 🔧 Deployed Contract Addresses

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

## 🚀 Quick Start

### Use the Widget in Your App

```bash
npm install @snowmonster_defi/widget
```

```tsx
import { DexRouterWidget, Web3Provider } from '@snowmonster_defi/widget';

function App() {
  return (
    <Web3Provider>
      <DexRouterWidget
        theme="dark"
        primaryColor="#E84142"
        defaultTokenIn="AVAX"
        defaultTokenOut="USDC"
      />
    </Web3Provider>
  );
}
```

### Local Development

```bash
# Clone and install
git clone https://github.com/danaszova/avax-router.git
cd avax-router
yarn install

# Build widget
cd packages/widget && npm run build

# Run demo app
cd packages/demo-app && npm run dev
```

## 🔒 Security

- Contracts use OpenZeppelin security primitives
- ReentrancyGuard on all swap functions
- Owner-only administrative functions
- Partner fee system is on-chain and transparent

⚠️ **Contracts are unaudited. Use at your own risk.**

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Trader Joe V1 adapter
- [x] Cloudflare Worker API
- [x] React widget (npm package)
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Live Demo**: [avax-router-demo](https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/)
- **npm Package**: [@snowmonster_defi/widget](https://www.npmjs.com/package/@snowmonster_defi/widget)
- **GitHub**: [danaszova/avax-router](https://github.com/danaszova/avax-router)

---

Built with ❤️ for the Avalanche ecosystem by [SnowMonster DeFi](https://github.com/danaszova)