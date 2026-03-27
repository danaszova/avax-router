# Ticket 6: Fix Basic Quote API

**Labels**: api, high, phase1
**Assignee**: TBD
**Priority**: High
**Estimated Time**: 2-3 days
**Dependencies**: Tickets 1, 2, 3, 4, 5

## Description
Fix the API layer to return accurate quotes from working DEX adapters.

## Problem Statement
Current API returns quotes but they may be from non-existent or non-functional DEXes. Need to ensure API only returns quotes from verified, working DEXes.

## Tasks
1. Update `/packages/api/src/services/router.ts` to use verified DEX addresses
2. Fix error handling when adapters fail
3. Implement proper fallback mechanisms
4. Update API response format to indicate DEX status
5. Create health check endpoint for DEX connectivity

## Acceptance Criteria
- [ ] `/api/v1/quote` returns valid quotes from working DEXes
- [ ] `/api/v1/quote/best` correctly identifies best price
- [ ] API indicates when DEXes are unavailable
- [ ] Health endpoint shows DEX connectivity status
- [ ] Error handling for failed quote requests

## Technical Details
- Should only query DEXes with verified addresses
- Implement timeout for slow DEX responses
- Cache quotes where appropriate
- Return structured error messages

## Files to Modify/Create
- `/packages/api/src/services/router.ts`
- `/packages/api/src/services/dex-apis.ts`
- `/packages/api/src/routes/quote.ts`
- `/packages/api/src/routes/health.ts`
- `/packages/api/src/utils/dex-status.ts` (new)

## Testing Requirements
- API should return valid quotes for working DEXes
- Should handle DEX failures gracefully
- Health endpoint should reflect actual status
- Error responses should be informative

## Notes
- Start with TraderJoe V1 as baseline
- Add other DEXes as they become available
- Consider rate limiting for public API
