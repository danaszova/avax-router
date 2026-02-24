/**
 * Test TraderJoe V1 Adapter
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing TraderJoe V1 Adapter\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Addresses (all lowercase to avoid checksum issues)
  const DEX_ROUTER = '0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5'.toLowerCase();
  const AVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';

  const DEX_ROUTER_ABI = [
    "function getRegisteredDexes() external view returns (string[] memory)",
    "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) external view returns (string memory bestDex, uint256 bestAmountOut)"
  ];

  const dexRouter = new ethers.Contract(DEX_ROUTER, DEX_ROUTER_ABI, provider);

  // Check registered DEXes
  console.log('1. Registered DEXes:');
  const dexes = await dexRouter.getRegisteredDexes();
  console.log('  ', dexes);

  // Test quote
  console.log('\n2. Testing quote (0.01 AVAX -> USDC):');
  const amountIn = ethers.parseEther('0.01');
  
  try {
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(AVAX, USDC, amountIn);
    console.log('  Best DEX:', bestDex);
    console.log('  Amount out:', ethers.formatUnits(bestAmountOut, 6), 'USDC');
    console.log('\n✅ SUCCESS! Contract is working!');
  } catch (err) {
    console.log('  Error:', err.message);
  }
}

main();