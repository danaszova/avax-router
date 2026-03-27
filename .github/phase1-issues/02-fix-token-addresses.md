# Ticket 2: Fix Token Address Confusion

**Labels**: infrastructure, high, phase1
**Assignee**: TBD
**Priority**: High
**Estimated Time**: 2-3 days
**Dependencies**: Ticket 1

## Description
Resolve inconsistencies in token addresses across the codebase, particularly WAVAX and USDC variants.

## Problem Statement
Multiple WAVAX addresses exist in the codebase. Test scripts show token pair failures even for basic swaps like AVAX->USDC. USDC has both native and bridged versions (USDC vs USDC.e) which may be causing confusion.

## Tasks
1. Audit all token references in codebase (`dex-apis.ts`, `router.ts`, test scripts)
2. Verify correct addresses using official sources (Snowtrace, DEX documentation)
3. Create single source of truth for token addresses
4. Update all references to use verified addresses
5. Test basic token pairs (AVAX->USDC, AVAX->USDT) with correct addresses

## Acceptance Criteria
- [ ] Single source of truth for token addresses in `/packages/api/src/utils/tokens.ts`
- [ ] All code references updated to use verified addresses
- [ ] Basic token pairs work in test scripts
- [ ] Documentation of token address standards

## Technical Details
- WAVAX official address: `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7`
- USDC native: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`
- USDC.e (bridged): `0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664`
- Need to verify which versions each DEX uses

## Files to Modify/Create
- `/packages/api/src/utils/tokens.ts` (new)
- `/packages/api/src/services/dex-apis.ts`
- `/packages/api/src/services/router.ts`
- `/test/scripts/test-all-dexes.js`
- `/test/scripts/test-swap.js`

## Testing Requirements
- Test scripts should show successful quotes for basic pairs
- All token references should be consistent
- No hardcoded addresses outside of token registry

## Notes
- Use checksummed addresses consistently
- Consider creating a token registry contract for on-chain verification
- Document which DEXes use which token versions
