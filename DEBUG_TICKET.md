# DEX Router Debug Ticket: Widget Not Getting Quotes

## Summary
The Avalanche DEX Router API is working correctly via curl, but the React widget/frontend is returning "No valid quotes found from any DEX" error.

---

## Project Overview

We're building a **DEX aggregator/router for Avalanche** that:
- Routes trades across multiple DEXes (currently TraderJoe V1)
- Finds the best price for token swaps
- Eventually will support more DEXes (TraderJoe V2, Pangolin, etc.)

### Architecture
```
packages/
├── api/              # Express/Node.js API (port 3000)
├── contracts/        # Solidity smart contracts (DexRouter + adapters)
├── widget/           # React/TypeScript widget component
└── demo-app/         # Demo app using the widget
```

---

## Current Status

### ✅ What's Working
1. **Smart Contracts Deployed to Avalanche Mainnet:**
   - DexRouter: `0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5`
   - TraderJoe V1 Adapter: `0x01A2D4498e36fc29b4B93DA4004BeD15093b2A03`

2. **API Endpoints Working (tested via curl):**
   ```bash
   # This WORKS:
   curl "http://localhost:3000/api/v1/quote/best?tokenIn=AVAX&tokenOut=USDC&amountIn=0.1"
   
   # Returns:
   {
     "bestDex": "TraderJoeV1",
     "tokenIn": "AVAX",
     "tokenOut": "USDC",
     "amountIn": "0.1",
     "amountOut": "912777",
     "amountOutFormatted": 0.912777,
     ...
   }
   ```

3. **Health Check Working:**
   ```bash
   curl "http://localhost:3000/api/v1/health"
   # Returns: {"status":"ok",...}
   ```

### ❌ What's Not Working
- **Widget/Frontend:** Returns error "No valid quotes found from any DEX"
- Seen in browser console when using the widget UI

---

## Technical Details

### Critical Discovery: WAVAX Address Issue

There are TWO different WAVAX addresses on Avalanche:

| Address | Status |
|---------|--------|
| `0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C` | ❌ Commonly cited but has NO CODE on TraderJoe V1 |
| `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7` | ✅ WORKING - Has actual liquidity pools on TJ V1 |

**We fixed this in:**
- `packages/api/src/services/dex-apis.ts` - TOKENS constant ✅
- `packages/widget/src/utils/constants.ts` - AVALANCHE_TOKENS array ✅ (just fixed)

### API Flow

1. Widget calls: `GET /api/v1/quote/best?tokenIn=AVAX&tokenOut=USDC&amountIn=0.1`
2. API resolves token symbols to addresses via `getTokenAddress()`
3. API calls on-chain `DexRouter.findBestRoute()` 
4. Contract queries TraderJoe V1 adapter for quote
5. Returns best DEX and amount

### Widget Code Location
- Main component: `packages/widget/src/components/DexRouterWidget.tsx`
- Token constants: `packages/widget/src/utils/constants.ts`
- API base URL: `http://localhost:3000/api/v1`

---

## Debugging Steps Needed

### 1. Check if widget is using updated constants
The widget may need to be rebuilt/restarted to pick up the WAVAX address fix:
```bash
cd packages/widget
# If there's a build step:
npm run build

# Or restart the demo app:
cd ../demo-app
npm run dev
```

### 2. Check browser network tab
Look at the actual HTTP request being made:
- What URL is being called?
- What are the query parameters (especially tokenIn, tokenOut)?
- Are token addresses correct?

### 3. Check for CORS issues
Open browser console - any CORS errors?

### 4. Check API logs
The API logs errors. Check:
```bash
tail -f packages/api/logs/error.log
```

### 5. Add console logging to widget
In `DexRouterWidget.tsx`, the `fetchQuote` function (around line 50) makes the API call. Add logging:
```typescript
console.log('Fetching quote with params:', {
  tokenIn: tokenIn.address,
  tokenOut: tokenOut.address,
  amountIn: amountInWei,
  url: `${apiUrl}/quote/best?${params}`
});
```

---

## How to Restart Everything

```bash
# 1. Kill existing processes
pkill -f "ts-node" 2>/dev/null
pkill -f "vite" 2>/dev/null

# 2. Start API
cd /Users/dana/DANASZOVA/WORKING/dex-router/packages/api
npm run dev &

# 3. Start widget/demo (in another terminal)
cd /Users/dana/DANASZOVA/WORKING/dex-router/packages/demo-app
npm run dev

# 4. Test API
curl "http://localhost:3000/api/v1/quote/best?tokenIn=AVAX&tokenOut=USDC&amountIn=0.1" | jq .
```

---

## Key Files to Review

| File | Purpose |
|------|---------|
| `packages/api/src/services/dex-apis.ts` | Token addresses, on-chain quote fetching |
| `packages/api/src/services/router.ts` | RouterService.findBestRoute() |
| `packages/api/src/routes/quote.ts` | Quote endpoint handlers |
| `packages/widget/src/utils/constants.ts` | Token list for widget |
| `packages/widget/src/components/DexRouterWidget.tsx` | Main widget component |
| `packages/contracts/contracts/DexRouter.sol` | Main router smart contract |
| `packages/contracts/contracts/adapters/TraderJoeV1Adapter.sol` | TraderJoe V1 integration |

---

## Expected Behavior

When working correctly:
1. User selects WAVAX as "From" token
2. User selects USDC as "To" token
3. User enters amount (e.g., 0.1)
4. Widget fetches quote from API
5. Shows "0.91 USDC" (approximately)
6. Shows "Route: TraderJoeV1"

---

## Contact/Context

This was built with AI assistance. The core functionality (contracts, API) is working. The issue is likely in:
1. Widget not picking up the fixed WAVAX address
2. Some mismatch between widget API call and what the API expects

Good luck! 🚀