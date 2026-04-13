# 📜 Contract Deployment Guide

This guide explains how to deploy your own AVAX Router smart contracts to Avalanche (Fuji testnet or Mainnet).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Contract Architecture](#contract-architecture)
- [Deploy to Fuji Testnet](#deploy-to-fuji-testnet)
- [Deploy to Avalanche Mainnet](#deploy-to-avalanche-mainnet)
- [Register DEX Adapters](#register-dex-adapters)
- [Verify Contracts](#verify-contracts)
- [Testing](#testing)
- [Security Considerations](#security-considerations)

---

## Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- An Avalanche wallet with AVAX for gas
- [Snowtrace API Key](https://snowtrace.io/) for contract verification

## Environment Setup

### 1. Install Dependencies

```bash
cd packages/contracts
npm install
```

### 2. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Avalanche RPC URLs
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Private key for deployment (DO NOT COMMIT)
PRIVATE_KEY=your_private_key_here

# Snowtrace API Key for verification
SNOWTRACE_API_KEY=your_snowtrace_api_key
```

⚠️ **Never commit your `.env` file or private key to git.**

### 3. Compile Contracts

```bash
npx hardhat compile
```

---

## Contract Architecture

The system consists of three main contracts:

### `DexRouter.sol`
The main router contract that:
- Receives swap requests
- Finds the best DEX adapter
- Executes the swap through the adapter
- Splits fees with partners

### `PartnerRegistry.sol`
Manages partner fee sharing:
- Registers partners with unique IDs
- Tracks fee percentages (up to 0.50%)
- Handles fee collection addresses

### DEX Adapters
Individual adapters for each DEX:
- `TraderJoeV1Adapter.sol` — Trader Joe V1 AMM
- `PangolinV2Adapter.sol` — Pangolin V2 AMM
- Custom adapters can be added by implementing `IDexAdapter`

### Contract Relationships

```
DexRouter
├── PartnerRegistry (fee tracking)
├── TraderJoeV1Adapter (swap execution)
├── PangolinV2Adapter (swap execution)
└── [Future adapters...]
```

---

## Deploy to Fuji Testnet

We recommend testing on Fuji first before mainnet.

### Step 1: Get Testnet AVAX

Visit the [Fuji Faucet](https://faucet.avax.network/) and get testnet AVAX.

### Step 2: Deploy Partner System

This deploys `PartnerRegistry` + `DexRouter` together:

```bash
npx hardhat run scripts/deploy-partner-system.ts --network fuji
```

Save the output addresses — you'll need them for the next steps.

### Step 3: Deploy DEX Adapters

**Deploy Trader Joe V1 Adapter:**

```bash
npx hardhat run scripts/deploy-v1-adapter.ts --network fuji
```

**Deploy Pangolin V2 Adapter (optional):**

```bash
npx hardhat run scripts/deploy-pangolin-adapter.ts --network fuji
```

### Step 4: Register Adapters

Register the adapter with the DexRouter:

```bash
npx hardhat run scripts/register-adapter-fuji.ts --network fuji
```

### Step 5: Test on Fuji

```bash
# Test partner registration
npx hardhat run scripts/test-fuji-partner.ts --network fuji
```

---

## Deploy to Avalanche Mainnet

⚠️ **Ensure you've tested thoroughly on Fuji first.**

### Step 1: Ensure Sufficient AVAX

You'll need AVAX for gas on mainnet. Typical deployment costs:
- DexRouter: ~0.05-0.1 AVAX
- PartnerRegistry: ~0.03-0.05 AVAX
- Each Adapter: ~0.02-0.05 AVAX

### Step 2: Deploy Partner System

```bash
npx hardhat run scripts/deploy-mainnet-partner.ts --network avalanche
```

### Step 3: Deploy Adapters

```bash
# Trader Joe V1
npx hardhat run scripts/deploy-v1-adapter.ts --network avalanche

# Pangolin V2 (optional)
npx hardhat run scripts/deploy-pangolin-adapter.ts --network avalanche
```

### Step 4: Register Adapters

Update the script with your deployed addresses, then:

```bash
npx hardhat run scripts/register-adapter-fuji.ts --network avalanche
```

### Step 5: Verify Contracts

```bash
npx hardhat run scripts/verify-mainnet.ts --network avalanche
```

### Step 6: Test on Mainnet

```bash
npx hardhat run scripts/test-mainnet-partner.ts --network avalanche
```

---

## Register DEX Adapters

After deploying the DexRouter and an adapter, you need to register the adapter:

```typescript
// In your registration script:
const dexRouter = await ethers.getContractAt("DexRouter", ROUTER_ADDRESS);

await dexRouter.registerAdapter(
  ADAPTER_ADDRESS,
  "TraderJoeV1"  // Unique DEX name
);
```

### Adding a New DEX Adapter

1. Create a new Solidity contract implementing `IDexAdapter`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IDexAdapter.sol";

contract MyDexAdapter is IDexAdapter {
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view override returns (uint256) {
        // Query the DEX for the output amount
    }

    function executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external override returns (uint256) {
        // Execute the swap on the DEX
    }
}
```

2. Deploy the adapter
3. Register it with the DexRouter
4. Update the API worker to include the new DEX

---

## Verify Contracts

Verify contracts on Snowtrace for transparency:

```bash
# Verify DexRouter
npx hardhat verify --network avalanche <DEX_ROUTER_ADDRESS>

# Verify PartnerRegistry
npx hardhat verify --network avalanche <PARTNER_REGISTRY_ADDRESS>

# Verify Adapter
npx hardhat verify --network avalanche <ADAPTER_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Testing

### Run Unit Tests

```bash
npx hardhat test
```

### Run Specific Tests

```bash
npx hardhat test test/DexRouter.test.ts
```

### Test with Gas Reporting

```bash
REPORT_GAS=true npx hardhat test
```

---

## Security Considerations

- **ReentrancyGuard**: All swap functions are protected against reentrancy attacks
- **Owner-only functions**: Adapter registration and partner management are restricted to the contract owner
- **Fee limits**: Partner fees are capped at 0.50% (50 basis points)
- **Slippage protection**: All swaps require a minimum output amount

### Pre-Deployment Checklist

- [ ] All unit tests passing
- [ ] Tested on Fuji testnet
- [ ] Contract owner is a secure multisig or hardware wallet
- [ ] Environment variables are properly configured
- [ ] Snowtrace API key is set for verification
- [ ] Sufficient AVAX for deployment gas costs
- [ ] Constructor arguments are correct

### Post-Deployment Checklist

- [ ] Contracts verified on Snowtrace
- [ ] Adapter registered with DexRouter
- [ ] Test swap executed successfully
- [ ] Partner fee system tested
- [ ] Contract addresses saved and documented
- [ ] Ownership transferred to multisig (if applicable)

---

## Deployed Contract Addresses

### Avalanche Mainnet (C-Chain, Chain ID: 43114)

| Contract | Address | Snowtrace |
|----------|---------|-----------|
| DexRouter | `0x81308B8e4C72E5aA042ADA30f9b29729c5a43098` | [View](https://snowtrace.io/address/0x81308B8e4C72E5aA042ADA30f9b29729c5a43098) |
| PartnerRegistry | `0xBF1f8E2872E82555e1Ce85b31077e2903368d943` | [View](https://snowtrace.io/address/0xBF1f8E2872E82555e1Ce85b31077e2903368d943) |
| TraderJoe V1 Adapter | `0x108831f20954211336704eaE0483e887a7bfd3A1` | [View](https://snowtrace.io/address/0x108831f20954211336704eaE0483e887a7bfd3A1) |
| Pangolin V2 Adapter | `0xc9F25F209c038312218827B4297A956Cfb9cE0b4` | [View](https://snowtrace.io/address/0xc9F25F209c038312218827B4297A956Cfb9cE0b4) |

### Fuji Testnet (Chain ID: 43113)

| Contract | Address |
|----------|---------|
| DexRouter | `0xc4396498B42DE35D38CE47c38e75240a49B5452a` |
| PartnerRegistry | `0xEC19b44BAfB8572dfEaec8Fd38A1E15aCA82E01a` |
| TraderJoe V1 Adapter | `0x62d133b127786c4D2D9e7D64dDdD4Cac7685eA8c` |

---

## Troubleshooting

### "Insufficient funds for gas"
Ensure your deployer wallet has enough AVAX for the transaction.

### "Nonce too high"
Reset your nonce: `npx hardhat run --network fuji` or wait for pending transactions.

### "Contract verification failed"
- Ensure constructor arguments match exactly
- Wait a few blocks after deployment before verifying
- Check that your Snowtrace API key is valid

---

*For questions or issues, open a [GitHub issue](https://github.com/danaszova/avax-router/issues).*