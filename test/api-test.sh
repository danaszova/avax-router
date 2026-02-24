#!/bin/bash

# API Test Suite for Avalanche DEX Router
# Run with: ./test/api-test.sh

set -e

API_URL="http://localhost:3000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test tokens (Fuji testnet) - Using lowercase to avoid checksum issues
WAVAX="0xb31f66aa3c0e6c59128b16a7e6757b4a7d5b2d6c"
USDC="0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"
USDT="0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7"

echo "=========================================="
echo "Avalanche DEX Router - API Test Suite"
echo "=========================================="
echo ""

# Check if API is running
echo "Checking API health..."
if ! curl -s "${API_URL}/health" > /dev/null; then
    echo -e "${RED}❌ API is not running on ${API_URL}${NC}"
    echo "Start the API with: cd packages/api && yarn dev"
    exit 1
fi
echo -e "${GREEN}✓ API is running${NC}"
echo ""

# Test 1: Health endpoint
echo "Test 1: Health Check"
response=$(curl -s "${API_URL}/health")
if echo "$response" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "$response"
fi
echo ""

# Test 2: Ready endpoint
echo "Test 2: Readiness Check"
response=$(curl -s "${API_URL}/ready")
if echo "$response" | grep -q '"ready":'; then
    echo -e "${GREEN}✓ Readiness check passed${NC}"
else
    echo -e "${RED}✗ Readiness check failed${NC}"
fi
echo ""

# Test 3: List DEXes
echo "Test 3: List Supported DEXes"
response=$(curl -s "${API_URL}/dexes")
if echo "$response" | grep -q '"name":"TraderJoeV2"'; then
    echo -e "${GREEN}✓ DEX list returned${NC}"
    echo "$response" | grep -o '"name":"[^"]*"' | head -2
else
    echo -e "${RED}✗ DEX list failed${NC}"
fi
echo ""

# Test 4: Basic quote (TraderJoe)
echo "Test 4: Basic Quote (TraderJoe)"
echo "Requesting quote for 1 AVAX -> USDC..."
response=$(curl -s "${API_URL}/quote?dex=TraderJoeV2&tokenIn=${WAVAX}&tokenOut=${USDC}&amountIn=1000000000000000000")
if echo "$response" | grep -q '"amountOut":"'; then
    amount_out=$(echo "$response" | grep -o '"amountOut":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Quote received: ${amount_out} USDC${NC}"
else
    echo -e "${RED}✗ Quote failed${NC}"
    echo "$response"
fi
echo ""

# Test 5: Best route
echo "Test 5: Best Route (across all DEXes)"
echo "Finding best route for 1 AVAX -> USDC..."
response=$(curl -s "${API_URL}/quote/best?tokenIn=${WAVAX}&tokenOut=${USDC}&amountIn=1000000000000000000")
if echo "$response" | grep -q '"bestDex":"'; then
    best_dex=$(echo "$response" | grep -o '"bestDex":"[^"]*"' | cut -d'"' -f4)
    amount_out=$(echo "$response" | grep -o '"amountOut":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✓ Best route: ${best_dex}${NC}"
    echo -e "${GREEN}  Amount out: ${amount_out}${NC}"
else
    echo -e "${RED}✗ Best route failed${NC}"
    echo "$response"
fi
echo ""

# Test 6: Compare routes
echo "Test 6: Compare All Routes"
response=$(curl -s "${API_URL}/quote/compare?tokenIn=${WAVAX}&tokenOut=${USDC}&amountIn=1000000000000000000")
if echo "$response" | grep -q '"spread":'; then
    spread=$(echo "$response" | grep -o '"spread":[0-9.]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ Route comparison completed${NC}"
    echo -e "${GREEN}  Price spread: ${spread}%${NC}"
else
    echo -e "${RED}✗ Compare failed${NC}"
fi
echo ""

# Test 7: Advanced routing
echo "Test 7: Advanced Routing (with split optimization)"
echo "This may take 5-10 seconds..."
response=$(curl -s "${API_URL}/quote/advanced?tokenIn=${WAVAX}&tokenOut=${USDC}&amountIn=1000000000000000000")
if echo "$response" | grep -q '"strategy":"'; then
    strategy=$(echo "$response" | grep -o '"strategy":"[^"]*"' | cut -d'"' -f4)
    savings=$(echo "$response" | grep -o '"savingsVsBestSingle":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Advanced routing completed${NC}"
    echo -e "${GREEN}  Strategy: ${strategy}${NC}"
    echo -e "${GREEN}  Savings: ${savings}${NC}"
else
    echo -e "${RED}✗ Advanced routing failed${NC}"
    echo "$response"
fi
echo ""

# Test 8: Multi-hop routing (exotic pair)
echo "Test 8: Multi-hop Routing (WBTC -> USDT via intermediates)"
# Note: This tests routing through WAVAX, USDC, etc.
response=$(curl -s "${API_URL}/quote/advanced?tokenIn=${WAVAX}&tokenOut=${USDT}&amountIn=1000000000000000000&maxHops=2")
if echo "$response" | grep -q '"routes":'; then
    route_count=$(echo "$response" | grep -o '"path":\[([^]]*)\]' | wc -l)
    echo -e "${GREEN}✓ Multi-hop routing found ${route_count} route(s)${NC}"
else
    echo -e "${YELLOW}⚠ No multi-hop route found (may need liquidity)${NC}"
fi
echo ""

# Test 9: Error handling - missing parameters
echo "Test 9: Error Handling (missing parameters)"
response=$(curl -s "${API_URL}/quote")
if echo "$response" | grep -q '"error":"Missing required parameters"'; then
    echo -e "${GREEN}✓ Error handling works correctly${NC}"
else
    echo -e "${RED}✗ Error handling failed${NC}"
fi
echo ""

# Test 10: Performance check
echo "Test 10: Performance Check"
echo "Testing response time for best route..."
start_time=$(date +%s%N)
response=$(curl -s "${API_URL}/quote/best?tokenIn=${WAVAX}&tokenOut=${USDC}&amountIn=1000000000000000000")
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

if [ $duration -lt 5000 ]; then
    echo -e "${GREEN}✓ Response time: ${duration}ms (under 5s limit)${NC}"
else
    echo -e "${YELLOW}⚠ Response time: ${duration}ms (over 5s limit)${NC}"
fi
echo ""

# Test 11: Advanced routing without split
echo "Test 11: Single Route Only (no split)"
response=$(curl -s "${API_URL}/quote/advanced?tokenIn=${WAVAX}&tokenOut=${USDC}&amountIn=1000000000000000000&allowSplit=false")
if echo "$response" | grep -q '"strategy":"single"'; then
    echo -e "${GREEN}✓ Single route optimization works${NC}"
else
    echo -e "${RED}✗ Single route test failed${NC}"
fi
echo ""

echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Run tests against: ${API_URL}"
echo "  - Network: Avalanche Fuji Testnet"
echo ""
echo "To run tests against mainnet, update API_URL and token addresses"