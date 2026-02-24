# Test Suite for Avalanche DEX Router

This directory contains comprehensive tests for the DEX Router system.

## 📁 Test Files

| File | Type | Description |
|------|------|-------------|
| `api-test.sh` | Integration | Tests all API endpoints |
| `e2e-swap-test.sh` | E2E | Tests actual swaps on Fuji testnet |
| `load-test.sh` | Performance | Load and stress testing |

## 🚀 Quick Start

### 1. API Integration Tests

Tests the quote API without blockchain transactions.

```bash
# 1. Start the API server
cd packages/api
yarn dev

# 2. In another terminal, run tests
cd /Users/dana/DANASZOVA/WORKING/dex-router
chmod +x test/api-test.sh
./test/api-test.sh
```

**What it tests:**
- ✅ Health and readiness endpoints
- ✅ Basic quote functionality
- ✅ Best route selection
- ✅ Multi-hop routing
- ✅ Split routing optimization
- ✅ Error handling
- ✅ Performance (< 5s response time)

### 2. E2E Swap Tests

Tests actual token swaps on Fuji testnet (uses real testnet tokens).

```bash
# Set your private key
export PRIVATE_KEY=0x...

# Run E2E tests
chmod +x test/e2e-swap-test.sh
./test/e2e-swap-test.sh
```

**Requirements:**
- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
- Testnet AVAX in wallet
- Private key set as environment variable

**What it tests:**
- ✅ Wallet connection
- ✅ Token wrapping (AVAX → WAVAX)
- ✅ Token approvals
- ✅ Fee calculation (0.05%)
- ✅ Transaction submission

### 3. Contract Unit Tests

Tests the Solidity contracts directly.

```bash
cd packages/contracts

# Run all tests
yarn test

# Run specific test file
yarn test test/DexRouter.test.ts
```

## 📊 Test Coverage

### API Tests (11 test cases)

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Health Check | Verify API is running | `status: "ok"` |
| Readiness | Check RPC connection | `ready: true/false` |
| List DEXes | Get supported DEXes | Array with TraderJoeV2, Pangolin |
| Basic Quote | Quote from specific DEX | `amountOut`, `priceImpact`, `route` |
| Best Route | Find optimal DEX | `bestDex`, `savings` |
| Compare Routes | Compare all DEXes | `quotes`, `spread` |
| Advanced Routing | Multi-hop + split | `strategy`, `savingsVsBestSingle` |
| Multi-hop | Route through intermediates | Multiple hop paths |
| Error Handling | Missing params | `400` with error message |
| Performance | Response time | `< 5000ms` |
| Single Route | No split routing | `strategy: "single"` |

### E2E Tests (3 test cases)

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Wrap AVAX | AVAX → WAVAX | Balance increases |
| Fee Calc | 0.05% on 1 AVAX | 0.0005 AVAX fee |
| Approve | Allow router to spend | Approval transaction succeeds |

## 🔧 Configuration

### API Test Configuration

Edit `test/api-test.sh` to change:
```bash
API_URL="http://localhost:3000/api/v1"  # Your API URL
WAVAX="0x..."  # Token addresses
USDC="0x..."
USDT="0x..."
```

### E2E Test Configuration

Set environment variables:
```bash
export PRIVATE_KEY=0x...  # Your wallet private key
export RPC_URL=https://api.avax-test.network/ext/bc/C/rpc  # Or mainnet
export DEX_ROUTER=0x...  # Your deployed router address
```

## 🐛 Troubleshooting

### API Tests Fail

**Problem:** `❌ API is not running`
**Solution:** Start the API first:
```bash
cd packages/api && yarn dev
```

**Problem:** Empty quotes or timeouts
**Solution:** Check RPC URL in `.env`:
```bash
# Should be:
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc  # Fuji
# or
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc  # Mainnet
```

### E2E Tests Fail

**Problem:** `cast: command not found`
**Solution:** Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Problem:** `Error: PRIVATE_KEY environment variable not set`
**Solution:** Export your key:
```bash
export PRIVATE_KEY=0xabc123...
```

**Problem:** Insufficient balance
**Solution:** Get testnet AVAX from faucet:
https://faucet.avax.network/

## 📈 Performance Benchmarks

### Target Performance

| Endpoint | Target | Acceptable |
|----------|--------|------------|
| `/health` | < 100ms | < 500ms |
| `/quote` | < 2s | < 5s |
| `/quote/best` | < 3s | < 5s |
| `/quote/advanced` | < 5s | < 10s |

### Load Testing

Coming soon: `test/load-test.sh`

Will test:
- 100 concurrent requests
- Sustained load over 60 seconds
- Memory usage under load
- Error rate < 0.1%

## 🔄 CI/CD Integration

Add to your GitHub Actions:

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Start API
        run: |
          cd packages/api
          yarn install
          yarn dev &
          sleep 5
          
      - name: Run API Tests
        run: ./test/api-test.sh
```

## 📝 Manual Testing Checklist

Before mainnet deployment, verify:

- [ ] All API endpoints return 200
- [ ] Quotes are accurate (compare to 1inch)
- [ ] Split routing shows savings > 0.1%
- [ ] Multi-hop works for exotic pairs
- [ ] Fees are calculated correctly (0.05%)
- [ ] Error handling works for invalid inputs
- [ ] Response times under 5 seconds
- [ ] E2E swap completes successfully on Fuji
- [ ] Fees are collected in router contract
- [ ] Owner can withdraw fees

## 🆘 Getting Help

If tests fail:
1. Check API is running: `curl http://localhost:3000/api/v1/health`
2. Verify RPC connection: Check `AVALANCHE_RPC_URL` in `.env`
3. Check logs: `tail -f packages/api/logs/combined.log`
4. Run individual test: `curl "http://localhost:3000/api/v1/quote/best?tokenIn=0x...&tokenOut=0x...&amountIn=1000000000000000000"`

## 🎯 Next Steps

1. Run API tests to verify endpoints
2. Run E2E tests to verify swaps work
3. Check performance benchmarks
4. Deploy to mainnet with confidence!