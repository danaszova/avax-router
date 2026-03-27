# Ticket 1: DEX Address Discovery & Verification System

**Labels**: infrastructure, critical, phase1
**Assignee**: TBD
**Priority**: Critical
**Estimated Time**: 3-5 days
**Dependencies**: None

## Description
Create a systematic approach to find and verify working DEX router addresses on Avalanche.

## Problem Statement
Current documented addresses for Pangolin, SushiSwap, Lydia, etc. return empty contracts. Without working DEX integrations, our sophisticated routing algorithms cannot function. We need a reliable method to discover current addresses.

## Tasks
1. Research official DEX documentation for current addresses
2. Contact DEX teams via Discord/Telegram for confirmation
3. Analyze on-chain data from working token pairs to infer router addresses
4. Create verification scripts that check if addresses have code and can process quotes
5. Document findings in a central repository

## Acceptance Criteria
- [ ] Working address discovery scripts in `/tools/dex-discovery/`
- [ ] Verified addresses for at least 3 DEXes (TraderJoe V1, TraderJoe V2, +1 other)
- [ ] Documentation of discovery process and findings
- [ ] Automated verification of router functionality

## Technical Details
- Create scripts in `/tools/dex-discovery/` directory
- Use ethers.js to check contract code at addresses
- Test basic quote functionality with common token pairs
- Document findings in `/docs/DEX_ADDRESSES.md`

## Files to Modify/Create
- `/tools/dex-discovery/find-dex-addresses.ts`
- `/tools/dex-discovery/verify-addresses.ts`
- `/docs/DEX_ADDRESSES.md`
- Update existing test scripts with verified addresses

## Testing Requirements
- Scripts should run without errors
- Should identify working vs non-working addresses
- Should provide clear output for manual verification

## Notes
- Start with TraderJoe documentation (most likely to be accurate)
- Use Snowtrace to verify contract deployments
- Consider reaching out to DEX communities for confirmation
