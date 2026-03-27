# Ticket 3: Update & Test TraderJoe V1 Adapter

**Labels**: contracts, high, phase1
**Assignee**: TBD
**Priority**: High
**Estimated Time**: 1-2 days
**Dependencies**: Tickets 1, 2

## Description
Verify and fix the existing TraderJoe V1 adapter, which should be working but shows issues in tests.

## Problem Statement
Test scripts show AVAX->USDC fails even for TraderJoe V1, suggesting address or configuration issues. This is our most likely working DEX and should be fixed first.

## Tasks
1. Verify TraderJoe V1 router address (`0x60aE616a2155Ee3d9A68541Ba4544862310933d4`)
2. Test adapter contract on mainnet with small quotes
3. Fix any configuration issues (factory address, token addresses)
4. Create comprehensive integration tests
5. Update deployment scripts if needed

## Acceptance Criteria
- [ ] TraderJoe V1 adapter returns valid quotes for AVAX->USDC
- [ ] Integration tests pass on mainnet
- [ ] Adapter correctly integrated with DexRouter contract
- [ ] Documentation updated with working examples

## Technical Details
- TraderJoe V1 router: `0x60aE616a2155Ee3d9A68541Ba4544862310933d4`
- Factory: `0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10`
- Use UniswapV2-style interface (`getAmountsOut`, `swapExactTokensForTokens`)

## Files to Modify/Create
- `/packages/contracts/contracts/adapters/TraderJoeV1Adapter.sol`
- `/packages/contracts/scripts/deploy-mainnet.ts`
- `/test/scripts/test-tj-v1.js` (new)
- Update existing test scripts

## Testing Requirements
- Quotes should match direct TraderJoe V1 interaction
- Small test swaps should work on mainnet
- Integration with DexRouter should function

## Notes
- Start with small amounts (0.01 AVAX) to test
- Verify WAVAX address is correct in adapter
- Check factory address is correct
