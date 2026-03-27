# Phase 1: Infrastructure Recovery - GitHub Tickets

## Overview
Phase 1 focuses on fixing the root cause of our stalled project: outdated DEX router addresses. Without working DEX integrations, our sophisticated routing algorithms cannot function.

## Current State Analysis
- Only TraderJoe V1 adapter is deployed but not properly tested
- Most documented DEX router addresses return empty contracts
- API returns quotes from non-existent DEXes
- Test scripts show AVAX->USDC fails for ALL DEXes

## Phase 1 Objectives
1. Find and verify working router addresses for major Avalanche DEXes
2. Fix token address confusion (WAVAX, USDC variants)
3. Deploy updated adapters for at least 3 working DEXes
4. Fix basic quote API functionality

---

## Ticket 1: DEX Address Discovery & Verification System

### Description
Create a systematic approach to find and verify working DEX router addresses on Avalanche.

### Problem
Current documented addresses for Pangolin, SushiSwap, Lydia, etc. return empty contracts. We need a reliable method to discover current addresses.

### Tasks
1. Research official DEX documentation for current addresses
2. Contact DEX teams via Discord/Telegram for confirmation
3. Analyze on-chain data from working token pairs to infer router addresses
4. Create verification scripts that check if addresses have code and can process quotes
5. Document findings in a central repository

### Acceptance Criteria
- [ ] Working address discovery scripts in `/tools/dex-discovery/`
- [ ] Verified addresses for at least 3 DEXes (TraderJoe V1, TraderJoe V2, +1 other)
- [ ] Documentation of discovery process and findings
- [ ] Automated verification of router functionality

### Estimated Time: 3-5 days
### Priority: Critical

---

## Ticket 2: Fix Token Address Confusion

### Description
Resolve inconsistencies in token addresses across the codebase, particularly WAVAX and USDC variants.

### Problem
Multiple WAVAX addresses exist, test scripts show token pair failures. USDC has both native and bridged versions.

### Tasks
1. Audit all token references in codebase (`dex-apis.ts`, `router.ts`, test scripts)
2. Verify correct addresses using official sources (Snowtrace, DEX documentation)
3. Create single source of truth for token addresses
4. Update all references to use verified addresses
5. Test basic token pairs (AVAX->USDC, AVAX->USDT) with correct addresses

### Acceptance Criteria
- [ ] Single source of truth for token addresses in `/packages/api/src/utils/tokens.ts`
- [ ] All code references updated to use verified addresses
- [ ] Basic token pairs work in test scripts
- [ ] Documentation of token address standards

### Estimated Time: 2-3 days
### Priority: High

---

## Ticket 3: Update & Test TraderJoe V1 Adapter

### Description
Verify and fix the existing TraderJoe V1 adapter, which should be working but shows issues in tests.

### Problem
Test scripts show AVAX->USDC fails even for TraderJoe V1, suggesting address or configuration issues.

### Tasks
1. Verify TraderJoe V1 router address (`0x60aE616a2155Ee3d9A68541Ba4544862310933d4`)
2. Test adapter contract on mainnet with small quotes
3. Fix any configuration issues (factory address, token addresses)
4. Create comprehensive integration tests
5. Update deployment scripts if needed

### Acceptance Criteria
- [ ] TraderJoe V1 adapter returns valid quotes for AVAX->USDC
- [ ] Integration tests pass on mainnet
- [ ] Adapter correctly integrated with DexRouter contract
- [ ] Documentation updated with working examples

### Estimated Time: 1-2 days
### Priority: High

---

## Ticket 4: TraderJoe V2 (Liquidity Bin) Adapter Implementation

### Description
Implement adapter for TraderJoe V2 using Liquidity Bin architecture (different interface than V1).

### Problem
TraderJoe V2 uses concentrated liquidity with different functions (`quoteExactInputSingle` vs `getAmountsOut`).

### Tasks
1. Study TraderJoe V2 interface (LBRouter, LBPair)
2. Create adapter contract in `/packages/contracts/contracts/adapters/TraderJoeV2Adapter.sol`
3. Implement `getAmountOut` and `swap` functions for Liquidity Bin
4. Test with different bin steps (0.01%, 0.05%, 0.1%, 0.2%, 0.5%)
5. Integrate with DexRouter

### Acceptance Criteria
- [ ] Working TraderJoe V2 adapter contract
- [ ] Returns quotes comparable to direct TraderJoe V2 interaction
- [ ] Supports multiple bin steps for best price
- [ ] Integrated with DexRouter
- [ ] Tested on mainnet with small amounts

### Estimated Time: 3-4 days
### Priority: High

---

## Ticket 5: Find & Integrate Third DEX

### Description
Research and integrate at least one additional DEX beyond TraderJoe V1/V2.

### Problem
We need minimum 3 DEXes for meaningful aggregation and split routing.

### Tasks
1. Research current Avalanche DEX landscape
2. Prioritize DEXes by: liquidity, API availability, community activity
3. Implement adapter for selected DEX
4. Test integration
5. Deploy and register with DexRouter

### Candidate DEXes (in priority order):
1. Pangolin - if current router can be found
2. SushiSwap - if current Avalanche deployment exists
3. Platypus - StableSwap for stablecoins
4. GMX - if they have swap functionality

### Acceptance Criteria
- [ ] Working adapter for third DEX
- [ ] Valid quotes returned
- [ ] Successfully integrated with DexRouter
- [ ] Tested on mainnet

### Estimated Time: 3-5 days
### Priority: Medium-High

---

## Ticket 6: Fix Basic Quote API

### Description
Fix the API layer to return accurate quotes from working DEX adapters.

### Problem
Current API returns quotes but they may be from non-existent or non-functional DEXes.

### Tasks
1. Update `/packages/api/src/services/router.ts` to use verified DEX addresses
2. Fix error handling when adapters fail
3. Implement proper fallback mechanisms
4. Update API response format to indicate DEX status
5. Create health check endpoint for DEX connectivity

### Acceptance Criteria
- [ ] `/api/v1/quote` returns valid quotes from working DEXes
- [ ] `/api/v1/quote/best` correctly identifies best price
- [ ] API indicates when DEXes are unavailable
- [ ] Health endpoint shows DEX connectivity status
- [ ] Error handling for failed quote requests

### Estimated Time: 2-3 days
### Priority: High

---

## Ticket 7: Comprehensive Testing Framework

### Description
Create end-to-end testing framework to verify full swap flow.

### Problem
Lack of comprehensive tests makes it hard to verify system functionality.

### Tasks
1. Create test scripts for each DEX adapter
2. Implement integration tests for DexRouter
3. Create API test suite
4. Set up testnet deployment and testing
5. Implement CI/CD pipeline for automated testing

### Acceptance Criteria
- [ ] Test suite covering all adapters
- [ ] Integration tests for DexRouter
- [ ] API test suite
- [ ] Automated CI/CD pipeline
- [ ] Testnet deployment verification

### Estimated Time: 3-4 days
### Priority: Medium

---

## Ticket 8: Documentation & Developer Setup

### Description
Update documentation and setup instructions for new developers.

### Problem
Current setup may be confusing for new team members.

### Tasks
1. Update README with current project status
2. Create developer onboarding guide
3. Document DEX integration process
4. Create troubleshooting guide
5. Update API documentation

### Acceptance Criteria
- [ ] Updated README reflecting current state
- [ ] Developer onboarding guide
- [ ] DEX integration documentation
- [ ] Troubleshooting guide for common issues
- [ ] Complete API documentation

### Estimated Time: 2-3 days
### Priority: Medium

---

## Dependencies

```
Ticket 1 (Discovery) → Tickets 2, 3, 4, 5
Ticket 2 (Token Addresses) → Tickets 3, 4, 5, 6
Ticket 3 (TJ V1) → Ticket 6 (API)
Ticket 4 (TJ V2) → Ticket 6 (API)
Ticket 5 (Third DEX) → Ticket 6 (API)
All tickets → Ticket 7 (Testing)
All tickets → Ticket 8 (Documentation)
```

## Success Metrics for Phase 1 Completion
1. ✅ 3+ working DEX integrations (TraderJoe V1, TraderJoe V2, +1 other)
2. ✅ Basic quote API returning valid quotes
3. ✅ End-to-end test showing successful small swap
4. ✅ Updated documentation reflecting current capabilities
5. ✅ Team able to develop and test new features

## Timeline Estimate
- Weeks 1-2: Complete Tickets 1-6 (Core functionality)
- Week 3: Complete Tickets 7-8 (Testing & Documentation)

## Resources Required
- Smart Contract Engineer (Tickets 3, 4, 5)
- Backend/API Engineer (Tickets 2, 6)
- QA/Testing Engineer (Ticket 7)
- Technical Writer (Ticket 8)

