# V2 Archive - PAUSED

This folder contains V2 DEX aggregator work that was paused due to outdated DEX router addresses.

## Why This Was Archived

Most Avalanche DEX router addresses found online no longer have contracts deployed. Only TraderJoeV1 has working contracts at documented addresses.

See `docs/V2_REQUIREMENTS.md` for full details.

## What's Here

### contracts/adapters/
- `PangolinAdapter.sol` - Pangolin DEX adapter (no working router)
- `PlatypusAdapter.sol` - Platypus StableSwap adapter (not deployed)
- `TraderJoeV2Adapter.sol` - TraderJoe Liquidity Bin adapter (needs work)
- `UniswapV2Adapter.sol` - Generic UniswapV2 adapter

### contracts/interfaces/
- `pangolin/` - Pangolin interface definitions
- `traderjoe/` - TraderJoe interface definitions

### scripts/
Debug and deployment scripts for V2 work:
- `discover-dex-addresses.ts` - Test router addresses
- `find-*.ts` - Search for DEX contracts
- `debug-*.ts` - Debug scripts
- `redeploy-*.ts` - Redeployment scripts
- `test-*.ts` - Test scripts

## Resuming V2 Work

To resume V2 development:
1. Get current router addresses from each DEX's official docs/Discord
2. Update adapter contracts with correct addresses
3. Test adapters individually
4. Move files back to main contracts folder

---

*Archived: March 14, 2026*