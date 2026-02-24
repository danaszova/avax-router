/**
 * Test with USDC.e (bridged) which has more liquidity
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing with USDC.e (Bridged USDC)\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Tokens
  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC_E = '0xa7d7079b0fead91f3e65d86e3331f77b8f7e17e3'; // Bridged USDC.e

  // Router ABI
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

  console.log('Testing AVAX -> USDC.e:');
  for (const [name, addr] of Object.entries(DEXES)) {
    try {
      const router = new ethers.Contract(addr, ROUTER_ABI, provider);
      const amounts = await router.getAmountsOut(amountIn, [WAVAX, USDC_E]);
      console.log(`  ✅ ${name}: ${ethers.formatUnits(amounts[1], 6)} USDC.e`);
    } catch (err) {
      console.log(`  ❌ ${name}: No route`);
    }
  }

  // Also try WETH as intermediary
  const WETH = '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab';
  console.log('\nTrying multi-hop via WETH:');
  for (const [name, addr] of Object.entries(DEXES)) {
    try {
      const router = new ethers.Contract(addr, ROUTER_ABI, provider);
      const amounts = await router.getAmountsOut(amountIn, [WAVAX, WETH, USDC_E]);
      console.log(`  ✅ ${name}: ${ethers.formatUnits(amounts[2], 6)} USDC.e`);
    } catch (err) {
      console.log(`  ❌ ${name}: No route`);
    }
  }

  // Check pair existence via factory
  console.log('\n\nChecking Factory Pairs:');
  const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)"
  ];
  
  const FACTORIES = {
    'TraderJoe': '0x9ad6c38be94206ca50bb0d90783181662f0cfa10',
    'Pangolin': '0xefa94de7a4656d7876678b883ee2b9f0a3151fdc',
  };

  for (const [name, addr] of Object.entries(FACTORIES)) {
    const factory = new ethers.Contract(addr, FACTORY_ABI, provider);
    try {
      const pair = await factory.getPair(WAVAX, USDC_E);
      console.log(`  ${name} WAVAX-USDC.e: ${pair === '0x0000000000000000000000000000000000000000' ? 'NO PAIR' : pair}`);
    } catch (err) {
      console.log(`  ${name}: Error`);
    }
  }
}

main().catch(console.error);