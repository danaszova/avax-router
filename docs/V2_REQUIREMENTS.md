# DEX Router V2 - Requirements & Progress Document

> **STATUS: PAUSED** - Pivoting to focus on V1 contracts. V2 work archived in `packages/contracts/v2-archive/`

## Project Overview

**Goal:** Build a DEX aggregator/router for Avalanche that routes trades between major DEXes to find the best prices. We don't have our own liquidity, so we aggregate existing DEXes.

**Network:** Avalanche C-Chain (Mainnet)

---

## 🔴 WHERE WE GOT STUCK

The V2 effort hit a wall due to **outdated DEX router addresses**. Most commonly-cited addresses for Avalanche DEXes no longer have contracts deployed to them.

### The Core Problem
- We built adapters for Pangolin, SushiSwap, Lydia, etc.
- All their router addresses return `0x` (no code) when queried
- Only **TraderJoeV1** has working contracts at documented addresses

### What We Tried
1. Tested 10+ router addresses from various sources
2. Analyzed working pairs to trace back to factories
3. Searched for routers matching factory addresses
4. All failed except TraderJoeV1

### Why This Matters
Without working router contracts, our V2 aggregator can only route through TraderJoeV1 - which provides **no value over V1** since V1 already uses TraderJoe directly.

### What's Needed to Resume V2
1. **Pangolin**: Contact their team/Discord for current router addresses
2. **SushiSwap**: Research if they use Trident or V3 on Avalanche
3. **TraderJoeV2 (LB)**: Build adapter for Liquidity Bin architecture
4. **Platypus**: Build StableSwap adapter (different interface)

### Decision
**Pause V2 development** and focus on V1 contracts which work reliably. Archive V2 code for future reference.

---

## Current State

### Deployed Contracts (Avalanche Mainnet)

| Contract | Address | Status |
|----------|---------|--------|
| **DexRouter** | `0x919383A49341f1EeccB6F3Da14d7497e481869d9` | ✅ Working |
| **TraderJoeV1 Adapter** | `0x23682D6f8539497435BdC2Cfa5BC6B14d278962B` | ✅ Working |
| **Pangolin Adapter** | `0x8cC366b4Ea18a35CaCbfEC0a52A7f08D1676A49E` | ❌ No liquidity (router doesn't exist) |
| **SushiSwap Adapter** | `0xD502FD801C6E73B4CF15F6839f1F01285b970Ea7` | ❌ No liquidity (router doesn't exist) |
| **Lydia Adapter** | `0xD58382ECA2Ef882F23C59fb1c960B1237e2a20f5` | ❌ No liquidity (router doesn't exist) |

### What's Actually Working

**Only TraderJoeV1 is fully functional.** We've successfully tested:
- ✅ AVAX → USDC
- ✅ AVAX → USDT  
- ✅ AVAX → JOE
- ✅ JOE → AVAX

View successful transactions:
- https://snowtrace.io/tx/0xcff9746bebf6204e758844f1ba3e668602d40c1a08320202077c5705fecfadac
- https://snowtrace.io/tx/0x4d9152f812a3412f447f0df46e723994d96719b353c931f345a4e25ca3de334e

---

## DEX Investigation Results

We thoroughly tested all major Avalanche DEXes. Here's what we found:

### TraderJoeV1 ✅ WORKING

| Component | Address |
|-----------|---------|
| Router | `0x60aE616a2155Ee3d9A68541Ba4544862310933d4` |
| Factory | `0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10` |

**Status:** Fully functional, standard UniswapV2 interface.

**Verified Pairs on Factory:**
- WAVAX/USDC: `0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1`
- WAVAX/JOE: `0x454E67025631C065d3cFAD6d71E6892f74487a15`
- WAVAX/USDT: `0xbb4646a764358ee93c2a9c4a147d5aDEd527ab73`
- WAVAX/WBTC: `0xd5a37dC5C9A396A03dd1136Fc76A1a02B1c88Ffa`

---

### TraderJoeV2 (Liquidity Bin) ⚠️ NEEDS WORK

| Component | Address |
|-----------|---------|
| LBRouter | `0xb4315e873DbCf96Fd0acd6EA047c66507581979` |
| Factory | Needs verification |

**Status:** Contract exists but uses a different architecture (Liquidity Bin / concentrated liquidity). Our adapter needs work.

**Issue:** The LBRouter doesn't use standard `getAmountsOut`. It uses `quoteExactInputSingle` style functions.

---

### SushiSwap ⚠️ HAS LIQUIDITY, NO ROUTER FOUND

| Component | Address | Status |
|-----------|---------|--------|
| Factory | `0xc35DADB65012eC5796536bD9864eD8773aBc74C4` | ✅ Works |
| Router (V2 style) | `0x1B02dA8cB0d097eB8d57A175B8897c0240FaD033` | ❌ No contract |

**Status:** Factory has working pairs with liquidity:
- WAVAX/USDC pair (`0x4eD65dAB34d5FD4b1eb384432027CE47E90E1185`) has ~461 USDC / ~52 WAVAX

**Problem:** The standard SushiSwap router doesn't exist at the commonly-cited address. SushiSwap may have:
1. Migrated to Trident architecture
2. Deployed at a different address
3. Be using V3 style contracts

**Next Steps:** Research SushiSwap's current Avalanche deployment from their official docs.

---

### Pangolin ❌ NO CONTRACTS FOUND

| Component | Address | Status |
|-----------|---------|--------|
| Router V1 | `0xE54Ca86531e17Ef3616d11Ca5b4d259Fa0d24756` | ❌ No code (`0x`) |
| Router V2 | `0x9D9Bcf22B8b08c9045Bd220AA08e227396914b92` | ❌ No code |
| Factory | `0xefa94DE7a4656C78d211230a9760b5809DF662e0` | ❌ No code |

**Status:** All commonly-cited Pangolin addresses return empty code. Pangolin has likely:
1. Migrated to new contracts
2. Changed to V3 architecture  
3. Rebranded or merged

**Next Steps:** Check https://docs.pangolin.exchange/ for current contract addresses.

---

### Lydia ❌ NO CONTRACTS FOUND

| Component | Address | Status |
|-----------|---------|--------|
| Router | `0x52f0e2440dcc7d2FA2f1c6B8A4BBDa8D4068Dc0b` | ❌ No code |

**Status:** No contract at the commonly-cited address.

---

### Other DEXes Tested

| DEX | Router Address | Status |
|-----|----------------|--------|
| YetiSwap | `0x0060F75E6D410C93eD09BBc82b0f22B726536517` | ❌ No code |
| Elk | `0x0E8a12C54dc7a532f20DEB28f8E0360AeedcD2b3` | ❌ No code |

---

## Architecture

### Smart Contract Structure

```
DexRouter (Main contract)
├── IDexAdapter (Interface)
│   ├── TraderJoeV1Adapter ✅
│   ├── TraderJoeV2Adapter ⚠️ (needs work)
│   ├── PangolinAdapter ❌ (no router)
│   ├── SushiSwapAdapter ❌ (no router)
│   ├── LydiaAdapter ❌ (no router)
│   └── PlatypusAdapter ⚠️ (not deployed - different architecture)
```

### Key Files

| File | Purpose |
|------|---------|
| `contracts/DexRouter.sol` | Main router contract |
| `contracts/interfaces/IDexAdapter.sol` | Adapter interface |
| `contracts/adapters/*.sol` | DEX-specific adapters |
| `contracts/interfaces/traderjoe/` | TraderJoe interfaces |
| `contracts/interfaces/pangolin/` | Pangolin interfaces |

### Adapter Interface

```solidity
interface IDexAdapter {
    function getName() external pure returns (string memory);
    function getQuote(address tokenIn, address tokenOut, uint256 amountIn) 
        external view returns (uint256 amountOut);
    function swap(address tokenIn, address tokenOut, uint256 amountIn, 
        uint256 minAmountOut, address to) external returns (uint256 amountOut);
}
```

---

## Known Issues

### 1. WAVAX Address Confusion
**Fixed:** We initially used wrong WAVAX address. Correct address is:
- `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7`

### 2. Outdated Router Addresses
Most DEX router addresses found online are outdated. The contracts no longer exist at those addresses.

### 3. Checksum Errors
Hardhat/ethers is strict about address checksums. Use `ethers.getAddress()` to ensure proper formatting.

### 4. Different DEX Architectures
Not all DEXes use UniswapV2-style `getAmountsOut`. Some use:
- `quoteExactInputSingle` (V3 style)
- `get_dy` (Curve/Platypus style)
- Custom functions

---

## Debug Scripts Created

| Script | Purpose |
|--------|---------|
| `scripts/discover-dex-addresses.ts` | Test router addresses for working contracts |
| `scripts/discover-from-pairs.ts` | Find factories from working pairs |
| `scripts/find-pangolin.ts` | Search for Pangolin contracts |
| `scripts/analyze-sushi-pair.ts` | Analyze SushiSwap pair for router info |
| `scripts/debug-router-abi.ts` | Test different router function signatures |
| `scripts/test-swap-mainnet.ts` | Test actual swaps on mainnet |
| `scripts/test-multi-swap.ts` | Test multiple token pairs |

---

## Next Steps (Priority Order)

### High Priority
1. **Research current Pangolin contracts** - Check official docs/Discord
2. **Research SushiSwap Avalanche deployment** - May need Trident adapter
3. **Fix TraderJoeV2 (LB) adapter** - Different interface than V2

### Medium Priority
4. **Add Platypus support** - StableSwap, different architecture
5. **Look for other working DEXes** - Any other active DEXes on Avalanche?

### Low Priority
6. **Gas optimization** - Once we have more working DEXes
7. **Multi-hop routing** - Route through intermediate tokens for better prices

---

## Token Addresses (Verified Working)

| Token | Address | Decimals |
|-------|---------|----------|
| WAVAX | `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7` | 18 |
| USDC (Bridged) | `0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664` | 6 |
| USDC (Native) | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | 6 |
| USDT | `0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7` | 6 |
| JOE | `0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd` | 18 |
| PNG | `0x60781C2586D68229fde47564546784ab3fACA982` | 18 |

---

## Environment Setup

```bash
# Install dependencies
npm install

# Compile contracts
cd packages/contracts && npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Avalanche (requires private key in .env)
npx hardhat run scripts/deploy-mainnet.ts --network avalanche

# Test swaps
npx hardhat run scripts/test-swap-mainnet.ts --network avalanche
```

### Required .env Variables

```
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
PRIVATE_KEY=your_private_key
SNOWTRACE_API_KEY=your_api_key
```

---

## Questions for New Developer

1. Do you have access to current Pangolin contract addresses?
2. Any experience with SushiSwap Trident architecture?
3. Are there other active DEXes on Avalanche we should consider?
4. Ideas for finding working router addresses beyond official docs?

---

## Resources

- [TraderJoe Docs](https://docs.traderjoexyz.com/)
- [Pangolin Docs](https://docs.pangolin.exchange/)
- [SushiSwap Docs](https://docs.sushi.com/)
- [Avalanche Docs](https://docs.avax.network/)
- [Snowtrace Explorer](https://snowtrace.io/)

---

*Last Updated: March 8, 2026*