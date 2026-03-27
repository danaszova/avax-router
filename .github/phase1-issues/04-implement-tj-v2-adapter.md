# Ticket 4: TraderJoe V2 (Liquidity Bin) Adapter Implementation

**Labels**: contracts, high, phase1
**Assignee**: TBD
**Priority**: High
**Estimated Time**: 3-4 days
**Dependencies**: Tickets 1, 2

## Description
Implement adapter for TraderJoe V2 using Liquidity Bin architecture (different interface than V1).

## Problem Statement
TraderJoe V2 uses concentrated liquidity with different functions (`quoteExactInputSingle` vs `getAmountsOut`). We need to support this for better prices on common pairs.

## Tasks
1. Study TraderJoe V2 interface (LBRouter, LBPair)
2. Create adapter contract in `/packages/contracts/contracts/adapters/TraderJoeV2Adapter.sol`
3. Implement `getAmountOut` and `swap` functions for Liquidity Bin
4. Test with different bin steps (0.01%, 0.05%, 0.1%, 0.2%, 0.5%)
5. Integrate with DexRouter

## Acceptance Criteria
- [ ] Working TraderJoe V2 adapter contract
- [ ] Returns quotes comparable to direct TraderJoe V2 interaction
- [ ] Supports multiple bin steps for best price
- [ ] Integrated with DexRouter
- [ ] Tested on mainnet with small amounts

## Technical Details
- LBRouter address: `0xb4315e873DbCf96Fd0aCd6EA047c66507581979` (needs verification)
- Uses `quoteExactInputSingle` for quotes
- Different fee structure (bin steps)
- May need to handle native AVAX differently

## Files to Modify/Create
- `/packages/contracts/contracts/adapters/TraderJoeV2Adapter.sol` (new)
- `/packages/contracts/contracts/interfaces/traderjoe/ILBRouter.sol` (if not exists)
- `/packages/contracts/scripts/deploy-tj-v2-adapter.ts` (new)
- `/test/scripts/test-tj-v2.js` (new)

## Testing Requirements
- Quotes should match TraderJoe V2 official quotes
- Should handle different bin steps
- Integration with DexRouter should work

## Notes
- Check V2 archive for existing work
- May need to handle WAVAX wrapping/unwrapping
- Consider gas optimization for multiple bin step checks
