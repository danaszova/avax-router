/**
 * Test REAL quotes on the pools we found
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing REAL Quotes\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Lowercase to avoid checksum issues
  const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
  
  const amountIn = ethers.parseEther('0.1'); // 0.1 AVAX

  // Test TJ V1 Router
  console.log('=== TraderJoe V1 Router ===');
  const TJ_ROUTER = '0x60ae616a2155ee3d9a68541ba4544862310933d4';
  
  const ROUTER_V2_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
  ];
  
  try {
    const router = new ethers.Contract(TJ_ROUTER, ROUTER_V2_ABI, provider);
    const amounts = await router.getAmountsOut(amountIn, [WAVAX, USDC]);
    console.log(`✅ TJ V1 Quote: 0.1 AVAX → ${ethers.formatUnits(amounts[1], 6)} USDC`);
  } catch (e) {
    console.log(`❌ TJ V1 Quote failed: ${e.reason || e.message?.slice(0, 80)}`);
  }

  // Test Uniswap V3 Router (SwapRouter02)
  console.log('\n=== Uniswap V3 Style Router ===');
  const V3_ROUTER = '0xbb00ff08d01d300023c629e8ffffcb65a5a578ce';
  
  // V3 uses exactInputSingle
  const V3_ROUTER_ABI = [
    "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 minAmountOut, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
  ];

  // For quotes, we need to use the quoter pattern - simulate the call
  // Let's try a static call to see if it works
  for (const fee of [500, 3000, 10000]) {
    try {
      const router = new ethers.Contract(V3_ROUTER, V3_ROUTER_ABI, provider);
      
      const calldata = router.interface.encodeFunctionData('exactInputSingle', [{
        tokenIn: WAVAX,
        tokenOut: USDC,
        fee: fee,
        recipient: '0x0000000000000000000000000000000000000001', // dummy
        amountIn: amountIn,
        minAmountOut: 0,
        sqrtPriceLimitX96: 0
      }]);
      
      // This will fail because we're not sending it to a real quoter
      // But let's try anyway
      const result = await provider.call({
        to: V3_ROUTER,
        data: calldata,
        value: amountIn
      });
      
      console.log(`✅ V3 Fee ${fee}: Got result`);
    } catch (e) {
      // Expected to fail without proper quoter
      // console.log(`V3 Fee ${fee}: ${e.reason?.slice(0, 40) || 'Need quoter'}`);
    }
  }

  // Better approach: Read directly from pool and calculate output
  console.log('\n=== Direct Pool Calculation ===');
  
  // V2 Pool
  const V2_PAIR = '0xf4003F4efBE8691B60249E6afbD307aBE7758adb';
  const PAIR_ABI = [
    "function getReserves() external view returns (uint112 r0, uint112 r1, uint32 ts)",
    "function token0() external view returns (address)"
  ];
  
  try {
    const pair = new ethers.Contract(V2_PAIR, PAIR_ABI, provider);
    const [r0, r1] = await pair.getReserves();
    const token0 = await pair.token0();
    
    // Determine which reserve is which
    const isToken0AVAX = token0.toLowerCase() === WAVAX;
    const avaxReserve = isToken0AVAX ? r0 : r1;
    const usdcReserve = isToken0AVAX ? r1 : r0;
    
    // Calculate output using V2 formula: amountOut = amountIn * reserveOut / (reserveIn + amountIn)
    const amountInWithFee = amountIn * 997n; // 0.3% fee
    const numerator = amountInWithFee * BigInt(usdcReserve);
    const denominator = (BigInt(avaxReserve) * 1000n) + amountInWithFee;
    const amountOut = numerator / denominator;
    
    console.log(`Pool reserves: ${ethers.formatEther(avaxReserve)} AVAX / ${ethers.formatUnits(usdcReserve, 6)} USDC`);
    console.log(`✅ Calculated output: 0.1 AVAX → ${ethers.formatUnits(amountOut, 6)} USDC`);
  } catch (e) {
    console.log(`❌ Direct calculation failed: ${e.message?.slice(0, 60)}`);
  }

  // V3 Pool (fee 500) - more complex calculation
  console.log('\n=== V3 Pool (Fee 500) ===');
  const V3_POOL = '0xfAe3f424a0a47706811521E3ee268f00cFb5c45E';
  const POOL_V3_ABI = [
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)",
    "function liquidity() external view returns (uint128)",
    "function token0() external view returns (address)"
  ];
  
  try {
    const pool = new ethers.Contract(V3_POOL, POOL_V3_ABI, provider);
    const [sqrtPriceX96] = await pool.slot0();
    const liquidity = await pool.liquidity();
    
    console.log(`Pool liquidity: ${liquidity}`);
    console.log(`sqrtPriceX96: ${sqrtPriceX96}`);
    console.log(`(V3 requires quoter contract for exact amounts)`);
  } catch (e) {
    console.log(`V3 pool read error: ${e.message?.slice(0, 60)}`);
  }

  // Final test: Try TJ router one more time with explicit path
  console.log('\n\n=== Final TJ V1 Test ===');
  try {
    const router = new ethers.Contract(TJ_ROUTER, [
      "function getAmountsOut(uint256, address[]) external view returns (uint256[])"
    ], provider);
    
    const path = [WAVAX, USDC];
    const amounts = await router.getAmountsOut(amountIn, path);
    
    console.log(`\n✅✅✅ SUCCESS! TJ V1 Quote:`);
    console.log(`    Input: 0.1 AVAX`);
    console.log(`    Output: ${ethers.formatUnits(amounts[1], 6)} USDC`);
    console.log(`    Rate: 1 AVAX = ${ethers.formatUnits(amounts[1] * 10n, 6)} USDC`);
  } catch (e) {
    console.log(`Final test failed: ${e.message}`);
  }
}

main().catch(console.error);