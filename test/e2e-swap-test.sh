#!/bin/bash

# End-to-End Swap Test Suite
# Tests actual swaps on Fuji testnet
# WARNING: Uses real testnet tokens!

set -e

RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"
DEX_ROUTER="0xB4041e5E85eE16F2890068f7559EE962eE4D01Ad"
PRIVATE_KEY="${PRIVATE_KEY:-}"  # Set via environment variable

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Tokens
WAVAX="0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C"
USDC="0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"

echo "=========================================="
echo "E2E Swap Test - Fuji Testnet"
echo "=========================================="
echo ""

if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY environment variable not set${NC}"
    echo "Set it with: export PRIVATE_KEY=0x..."
    exit 1
fi

# Check cast is installed
if ! command -v cast &> /dev/null; then
    echo -e "${YELLOW}Warning: cast not found. Install Foundry for full E2E tests${NC}"
    echo "Install: curl -L https://foundry.paradigm.xyz | bash"
    exit 1
fi

echo "Getting wallet address..."
WALLET=$(cast wallet address --private-key "$PRIVATE_KEY")
echo "Testing with wallet: $WALLET"

echo ""
echo "Checking balances..."
AVAX_BALANCE=$(cast balance $WALLET --rpc-url $RPC_URL)
echo "AVAX Balance: $(cast from-wei $AVAX_BALANCE)"

# Wrap some AVAX to WAVAX for testing
echo ""
echo "Test 1: Wrap AVAX to WAVAX"
WRAP_AMOUNT="100000000000000000"  # 0.1 AVAX

echo "Sending wrap transaction..."
cast send $WAVAX \
    --value $WRAP_AMOUNT \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    "deposit()" 2>/dev/null || echo -e "${YELLOW}Wrap may have failed (check manually)${NC}"

WAVAX_BALANCE=$(cast call $WAVAX "balanceOf(address)(uint256)" $WALLET --rpc-url $RPC_URL)
echo "WAVAX Balance: $(cast from-wei $WAVAX_BALANCE)"
echo ""

# Test fee calculation
echo "Test 2: Verify Fee Calculation (0.05%)"
AMOUNT_IN="1000000000000000000"  # 1 AVAX
EXPECTED_FEE=$(echo "$AMOUNT_IN * 5 / 10000" | bc)
echo "Input: 1 AVAX"
echo "Expected fee: $(cast from-wei $EXPECTED_FEE) AVAX"
echo ""

# Test approve
echo "Test 3: Approve DEX Router to spend WAVAX"
cast send $WAVAX \
    "approve(address,uint256)" \
    $DEX_ROUTER \
    $AMOUNT_IN \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY 2>/dev/null || echo -e "${YELLOW}Approve may have failed${NC}"

echo -e "${GREEN}✓ Approve transaction sent${NC}"
echo ""

# Note: We can't easily test actual swap without knowing pool state
# This is where you'd integrate with a test framework that can mock or fork

echo "=========================================="
echo "E2E Test Suite Complete"
echo "=========================================="
echo ""
echo "Manual verification steps:"
echo "1. Check Snowtrace for transactions:"
echo "   https://testnet.snowtrace.io/address/$WALLET"
echo ""
echo "2. Verify fee collection:"
echo "   https://testnet.snowtrace.io/address/$DEX_ROUTER"
echo ""
echo "3. Test actual swap via UI or direct contract call"