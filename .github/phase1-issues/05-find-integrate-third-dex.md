# Ticket 5: Find & Integrate Third DEX

**Labels**: contracts, medium-high, phase1
**Assignee**: TBD
**Priority**: Medium-High
**Estimated Time**: 3-5 days
**Dependencies**: Tickets 1, 2

## Description
Research and integrate at least one additional DEX beyond TraderJoe V1/V2.

## Problem Statement
We need minimum 3 DEXes for meaningful aggregation and split routing. Currently only TraderJoe V1 is (potentially) working.

## Tasks
1. Research current Avalanche DEX landscape
2. Prioritize DEXes by: liquidity, API availability, community activity
3. Implement adapter for selected DEX
4. Test integration
5. Deploy and register with DexRouter

## Candidate DEXes (in priority order):
1. Pangolin - if current router can be found
2. SushiSwap - if current Avalanche deployment exists
3. Platypus - StableSwap for stablecoins
4. GMX - if they have swap functionality
5. Any other active DEX on Avalanche

## Acceptance Criteria
- [ ] Working adapter for third DEX
- [ ] Valid quotes returned
- [ ] Successfully integrated with DexRouter
- [ ] Tested on mainnet

## Technical Details
- Will depend on selected DEX
- May need different interface implementations (UniswapV2, StableSwap, etc.)
- Consider gas costs and complexity

## Files to Modify/Create
- New adapter contract in `/packages/contracts/contracts/adapters/`
- Interface definitions if needed
- Deployment script
- Test scripts

## Testing Requirements
- Quotes should match direct DEX interaction
- Integration with DexRouter should work
- Should handle common token pairs

## Notes
- Start with research before implementation
- Consider reaching out to DEX communities
- Verify liquidity exists for target pairs
