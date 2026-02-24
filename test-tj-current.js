/**
 * Test current TraderJoe contracts
 * TraderJoe may have migrated to new contracts
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing Current TraderJoe Contracts\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Current TraderJoe addresses (from official docs)
  const TJ_ADDRESSES = {
    // V2.1
    'V2.1 Router': '0x542ba2C2e5DDc245Dd1E26739BA818bfd3d005e5',
    'V2.1 Factory': '0x5E6420766F31aA7710473b3e7fEB23a3e9b5b99A',
    // Legacy V1
    'V1 Router': '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    'V1 Factory': '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
  };

  // Tokens
  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';

  const ROUTER_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
    "function factory() external view returns (address)"
  ];

  const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
    "function createPair(address tokenA, address tokenB) external returns (address pair)"
  ];

  const amountIn = ethers.parseEther('0.01');

  // Test V1 Router
  console.log('=== TraderJoe V1 Router ===');
  try {
    const v1Router = new ethers.Contract(TJ_ADDRESSES['V1 Router'], ROUTER_ABI, provider);
    const v1Factory = await v1Router.factory();
    console.log('V1 Router points to factory:', v1Factory);
    
    const amounts = await v1Router.getAmountsOut(amountIn, [WAVAX, USDC]);
    console.log('✅ V1 Quote works!', ethers.formatUnits(amounts[1], 6), 'USDC');
  } catch (err) {
    console.log('❌ V1 Quote failed:', err.reason || err.message.slice(0, 80));
  }

  // Test V2.1 Router
  console.log('\n=== TraderJoe V2.1 Router ===');
  try {
    const v2Router = new ethers.Contract(TJ_ADDRESSES['V2.1 Router'], ROUTER_ABI, provider);
    const v2Factory = await v2Router.factory();
    console.log('V2.1 Router points to factory:', v2Factory);
    
    const amounts = await v2Router.getAmountsOut(amountIn, [WAVAX, USDC]);
    console.log('✅ V2.1 Quote works!', ethers.formatUnits(amounts[1], 6), 'USDC');
  } catch (err) {
    console.log('❌ V2.1 Quote failed:', err.reason || err.message.slice(0, 80));
  }

  // Test V1 Factory directly
  console.log('\n=== V1 Factory Direct ===');
  try {
    const v1Factory = new ethers.Contract(TJ_ADDRESSES['V1 Factory'], FACTORY_ABI, provider);
    const pair = await v1Factory.getPair(WAVAX, USDC);
    console.log('WAVAX-USDC pair:', pair);
  } catch (err) {
    console.log('Error:', err.reason || err.message.slice(0, 80));
  }

  // Test V2.1 Factory directly
  console.log('\n=== V2.1 Factory Direct ===');
  try {
    const v2Factory = new ethers.Contract(TJ_ADDRESSES['V2.1 Factory'], FACTORY_ABI, provider);
    const pair = await v2Factory.getPair(WAVAX, USDC);
    console.log('WAVAX-USDC pair:', pair);
  } catch (err) {
    console.log('Error:', err.reason || err.message.slice(0, 80));
  }

  // List all pairs on V1 factory by checking code at factory
  console.log('\n=== Contract Code Check ===');
  for (const [name, addr] of Object.entries(TJ_ADDRESSES)) {
    const code = await provider.getCode(addr);
    console.log(`${name}: ${code.length > 2 ? 'Has code' : 'NO CODE'}`);
  }
}

main();