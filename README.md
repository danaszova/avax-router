# Avalanche DEX Router

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg?style=flat-square)](https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/)

A DEX aggregator for the Avalanche network that routes trades across multiple DEXes to find the best prices. Charges a flat **0.05% fee** - 5x cheaper than competitors.

## 🎬 Live Demo

Try the live demo app at: https://avax-router-demo-qjh7of78d-dana-szovas-projects.vercel.app/

The demo showcases:
- Real-time price quotes across multiple DEXes
- Best route finding with savings calculation
- Interactive swap simulation
- Deployed using Cloudflare API for optimal performance

## 🎯 Value Proposition

- **0.05% fees** vs 0.3% industry standard (6x cheaper)
- **Multi-DEX routing** across Trader Joe V2 & Pangolin
- **Best price guarantee** - finds optimal route automatically
- **Real-time quotes** - sub-100ms response times

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Optional)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Server (Node.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Quote Service│  │ Route Finder │  │  Simulator   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Smart Contracts (Solidity)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  DexRouter   │  │TJ V2 Adapter │  │Pangolin Adapt│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Underlying DEXs (Trader Joe, Pangolin)          │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
dex-router/
├── packages/
│   ├── contracts/           # Solidity contracts
│   │   ├── contracts/
│   │   │   ├── DexRouter.sol       # Main router contract
│   │   │   ├── adapters/
│   │   │   │   ├── TraderJoeV2Adapter.sol
│   │   │   │   └── PangolinAdapter.sol
│   │   │   ├── interfaces/
│   │   │   └── libraries/
│   │   ├── scripts/
│   │   │   └── deploy.ts
│   │   └── hardhat.config.ts
│   │
│   └── api/                 # Node.js API
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── quote.ts
│       │   │   └── health.ts
│       │   ├── services/
│       │   │   └── router.ts
│       │   └── utils/
│       │       └── logger.ts
│       └── package.json
│
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn or npm
- A private key with AVAX for gas (testnet or mainnet)

### Installation

```bash
# Clone and install dependencies
cd dex-router
yarn install
```

### Local Development

```bash
# Terminal 1: Start API server
cd packages/api
cp .env.example .env
yarn dev

# Terminal 2: Compile contracts
cd packages/contracts
cp .env.example .env
yarn build
```

### Deploy to Testnet (Fuji)

1. Get testnet AVAX from [Fuji Faucet](https://faucet.avax.network/)
2. Update `packages/contracts/.env`:
```env
PRIVATE_KEY=your_private_key_here
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

3. Deploy:
```bash
cd packages/contracts
yarn deploy:fuji
```

4. Copy deployed addresses to `packages/api/.env`

### Deploy to Mainnet

⚠️ **Make sure you understand the risks before deploying to mainnet**

```bash
cd packages/contracts
# Update .env with mainnet private key
yarn deploy:avalanche
```

## 📡 API Endpoints

### Get Quote from Specific DEX

```bash
GET /api/v1/quote?dex=TraderJoeV2&tokenIn=0x...&tokenOut=0x...&amountIn=1000000000000000000
```

Response:
```json
{
  "dex": "TraderJoeV2",
  "tokenIn": "0xB31f66AA3C0e6c59128B16A7e6757b4A7d5b2D6c",
  "tokenOut": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  "amountIn": "1000000000000000000",
  "amountOut": "35421567890123456",
  "priceImpact": 0.02,
  "route": ["WAVAX", "USDC"],
  "estimatedGas": "150000"
}
```

### Find Best Route

```bash
GET /api/v1/quote/best?tokenIn=0x...&tokenOut=0x...&amountIn=1000000000000000000
```

Response:
```json
{
  "bestDex": "TraderJoeV2",
  "amountIn": "1000000000000000000",
  "amountOut": "35421567890123456",
  "savings": 0.15,
  "allQuotes": [
    { "dex": "TraderJoeV2", "amountOut": "35421567890123456" },
    { "dex": "Pangolin", "amountOut": "35245678901234567" }
  ]
}
```

### Compare All DEXes

```bash
GET /api/v1/quote/compare?tokenIn=0x...&tokenOut=0x...&amountIn=1000000000000000000
```

### Health Check

```bash
GET /api/v1/health
GET /api/v1/ready
```

## 💰 Supported DEXes

| DEX | Type | Volume % | Status |
|-----|------|----------|--------|
| Trader Joe V2 | Liquidity Book | ~60% | ✅ MVP |
| Pangolin | Uniswap V2 | ~20% | ✅ MVP |
| Platypus | Stableswap | ~10% | 🔄 Phase 2 |
| Curve | Stableswap | ~5% | 📋 Planned |

## 🔧 Configuration

### Environment Variables

**API (.env)**
```env
PORT=3000
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
DEX_ROUTER_ADDRESS=0x...
LOG_LEVEL=info
```

**Contracts (.env)**
```env
PRIVATE_KEY=0x...
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=your_key
```

## 📊 Fee Structure

| Trade Size | Fee | Competitor Fee | Savings |
|------------|-----|----------------|---------|
| $100 | $0.05 | $0.30 | 83% |
| $1,000 | $0.50 | $3.00 | 83% |
| $10,000 | $5.00 | $30.00 | 83% |
| $100,000 | $50.00 | $300.00 | 83% |

## 🔒 Security

- Contracts use OpenZeppelin for security primitives
- ReentrancyGuard on all swap functions
- Owner-only administrative functions
- Emergency withdrawal function

### Audit Status

⚠️ **Contracts are unaudited. Use at your own risk.**

For production use, we recommend:
1. Professional audit
2. Bug bounty program
3. Gradual TVL increase

## 🗺️ Roadmap

### Phase 1: MVP (Week 1-2) ✅
- [x] Trader Joe V2 adapter
- [x] Pangolin adapter
- [x] Quote API
- [x] Testnet deployment

### Phase 2: Enhancement (Month 2)
- [ ] Platypus adapter (stablecoins)
- [ ] Multi-hop routing
- [ ] Split routing across DEXes
- [ ] Gas optimization

### Phase 3: Scale (Month 3+)
- [ ] Curve integration
- [ ] WebSocket real-time quotes
- [ ] MEV protection
- [ ] Token launch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `yarn test`
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- Discord: [Join our community](https://discord.gg/...)
- Twitter: [@AvalancheDex](https://twitter.com/...)
- Email: support@yourdomain.com

---

Built with ❤️ for the Avalanche ecosystem