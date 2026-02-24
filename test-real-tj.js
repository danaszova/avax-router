/**
 * Test REAL TraderJoe quotes
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing REAL TraderJoe Quotes\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // TraderJoe V1 Router
  const TJ_ROUTER = '0x60ae616a2155ee3d9a68541ba4544862310933d4';
  
  // Tokens (lowercase)
  const AVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
  const USDC_E = '0xa7d7079b0fead91f3e65d86e3331f77b8f7e17e3';
  const USDT = '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7';

  const ROUTER_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
  ];

  const router = new ethers.Contract(TJ_ROUTER, ROUTER_ABI, provider);
  const amountIn = ethers.parseEther('0.01');

  // Test direct path AVAX -> USDC
  console.log('1. AVAX -> USDC direct:');
  try {
    const amounts = await router.getAmountsOut(amountIn, [AVAX, USDC]);
    console.log('  ✅ Works! Output:', ethers.formatUnits(amounts[1], 6), 'USDC');
  } catch (err) {
    console.log('  ❌ Failed:', err.reason || err.message.slice(0, 60));
  }

  // Test AVAX -> USDC.e
  console.log('\n2. AVAX -> USDC.e direct:');
  try {
    const amounts = await router.getAmountsOut(amountIn, [AVAX, USDC_E]);
    console.log('  ✅ Works! Output:', ethers.formatUnits(amounts[1], 6), 'USDC.e');
  } catch (err) {
    console.log('  ❌ Failed:', err.reason || err.message.slice(0, 60));
  }

  // Test AVAX -> USDT
  console.log('\n3. AVAX -> USDT direct:');
  try {
    const amounts = await router.getAmountsOut(amountIn, [AVAX, USDT]);
    console.log('  ✅ Works! Output:', ethers.formatUnits(amounts[1], 6), 'USDT');
  } catch (err) {
    console.log('  ❌ Failed:', err.reason || err.message.slice(0, 60));
  }

  // Check factory
  console.log('\n4. Checking TraderJoe V2 Factory (LB):');
  const TJ_V2_FACTORY = '0x5e6420766f31aa7710473b3e7feb23a3e9b5b99a';
  const FACTORY_V2_ABI = [
    "function getLBPairIndex(address tokenX, address tokenY, uint256 binStep) external view returns (uint256)"
  ];
  
  const factoryV2 = new ethers.Contract(TJ_V2_FACTORY, FACTORY_V2_ABI, provider);
  
  // Try different bin steps
  for (const binStep of [10, 20, 50, 100]) {
    try {
      const index = await factoryV2.getLBPairIndex(AVAX, USDC, binStep);
      console.log(`  Bin step ${binStep}: index ${index}`);
    } catch (err) {}
  }
}

main();