/**
 * Test ALL DEXes on Avalanche for AVAX-USDC
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing ALL Avalanche DEXes for AVAX -> USDC\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Tokens (lowercase)
  const AVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
  const USDC_E = '0xa7d7079b0fead91f3e65d86e3331f77b8f7e17e3';

  const amountIn = ethers.parseEther('0.01');

  const ROUTER_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
  ];

  // DEX Routers
  const DEXES = {
    'Pangolin': '0xefa94DE7a4656D7876678B883ee2B9F0a3151FDC',
    'SushiSwap': '0x1b02dA8Cb0d097eB8D57A175b88974318F97d17B',
    'TraderJoe V1': '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    'Kyber': '0x1cD8bD2de1972bFBA722bB4246177aD7418597A1',
  };

  for (const [name, routerAddr] of Object.entries(DEXES)) {
    console.log(`\n${name}:`);
    const router = new ethers.Contract(routerAddr.toLowerCase(), ROUTER_ABI, provider);
    
    // Try AVAX -> USDC
    try {
      const amounts = await router.getAmountsOut(amountIn, [AVAX, USDC]);
      console.log(`  ✅ AVAX->USDC: ${ethers.formatUnits(amounts[1], 6)} USDC`);
    } catch (err) {
      console.log(`  ❌ AVAX->USDC: No pair`);
    }
    
    // Try AVAX -> USDC.e
    try {
      const amounts = await router.getAmountsOut(amountIn, [AVAX, USDC_E]);
      console.log(`  ✅ AVAX->USDC.e: ${ethers.formatUnits(amounts[1], 6)} USDC.e`);
    } catch (err) {
      console.log(`  ❌ AVAX->USDC.e: No pair`);
    }
  }

  // Also test the new DexRouter contract
  console.log('\n\n=== Testing DexRouter Contract ===');
  const DEX_ROUTER = '0x3ff7faad7417130c60b7422de712ead9a7c2e3b5';
  const DEX_ROUTER_ABI = [
    "function getRegisteredDexes() view returns (string[] memory)",
    "function getQuote(string calldata dexName, address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)"
  ];
  
  const dexRouter = new ethers.Contract(DEX_ROUTER, DEX_ROUTER_ABI, provider);
  
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log('Registered DEXes:', registeredDexes);
  
  for (const dexName of registeredDexes) {
    console.log(`\n${dexName}:`);
    try {
      const quote = await dexRouter.getQuote(dexName, AVAX, USDC, amountIn);
      console.log(`  ✅ Quote: ${ethers.formatUnits(quote, 6)} USDC`);
    } catch (err) {
      console.log(`  ❌ Quote failed: ${err.reason || 'No route'}`);
    }
  }
}

main();