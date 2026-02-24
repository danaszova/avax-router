/**
 * Find what pools ARE working on Avalanche
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Finding Working Pools on Avalanche\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Test with WETH which should have good liquidity
  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const WETH = '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab';
  const JOE = '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd';

  const ROUTER_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
  ];

  const amountIn = ethers.parseEther('0.01');

  // DEX Routers
  const DEXES = {
    'TraderJoe V1': '0x60ae616a2155ee3d9a68541ba4544862310933d4',
    'Pangolin V1': '0xefa94de7a4656d7876678b883ee2b9f0a3151fdc',
    'SushiSwap': '0x1b02da8cb0d097eb8d57a175b88974318f97d17b',
  };

  // Test AVAX -> WETH
  console.log('1. Testing AVAX -> WETH:');
  for (const [name, addr] of Object.entries(DEXES)) {
    try {
      const router = new ethers.Contract(addr, ROUTER_ABI, provider);
      const amounts = await router.getAmountsOut(amountIn, [WAVAX, WETH]);
      console.log(`  ✅ ${name}: ${ethers.formatEther(amounts[1])} WETH`);
    } catch (err) {
      console.log(`  ❌ ${name}: No route`);
    }
  }

  // Test AVAX -> JOE
  console.log('\n2. Testing AVAX -> JOE:');
  for (const [name, addr] of Object.entries(DEXES)) {
    try {
      const router = new ethers.Contract(addr, ROUTER_ABI, provider);
      const amounts = await router.getAmountsOut(amountIn, [WAVAX, JOE]);
      console.log(`  ✅ ${name}: ${ethers.formatEther(amounts[1])} JOE`);
    } catch (err) {
      console.log(`  ❌ ${name}: No route`);
    }
  }

  // Try Pangolin's newer router
  console.log('\n3. Testing Pangolin V2 Router:');
  const PANGOLIN_V2 = '0x2f77485795f4e9f4eb2f21785152d38c3756fd00';
  try {
    const router = new ethers.Contract(PANGOLIN_V2, ROUTER_ABI, provider);
    const amounts = await router.getAmountsOut(amountIn, [WAVAX, WETH]);
    console.log(`  ✅ Pangolin V2: ${ethers.formatEther(amounts[1])} WETH`);
  } catch (err) {
    console.log(`  ❌ Pangolin V2: No route`);
  }

  // Check if any of the routers actually have liquidity
  console.log('\n4. Contract Code Status:');
  for (const [name, addr] of Object.entries({
    ...DEXES,
    'Pangolin V2': PANGOLIN_V2,
  })) {
    const code = await provider.getCode(addr);
    console.log(`  ${name}: ${code.length > 2 ? 'HAS CODE' : 'NO CODE'}`);
  }
}

main().catch(console.error);