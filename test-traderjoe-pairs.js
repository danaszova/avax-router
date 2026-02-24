/**
 * Test to find actual TraderJoe LB pairs
 * Run with: node test-traderjoe-pairs.js
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Checking TraderJoe LB Pairs\n');
  console.log('================================\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Get proper checksummed addresses
  const TJ_ROUTER = ethers.getAddress('0xb4315e873dbcf96ffd0acd6ea047c66507581979');
  const TJ_FACTORY = ethers.getAddress('0x5e6420766f31aa7710473b3e7feb23a3e9b5b99a');
  const AVAX = ethers.getAddress('0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c');
  const USDC = ethers.getAddress('0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e');

  console.log('Addresses:');
  console.log(`  Router: ${TJ_ROUTER}`);
  console.log(`  Factory: ${TJ_FACTORY}`);
  console.log(`  AVAX: ${AVAX}`);
  console.log(`  USDC: ${USDC}`);

  // Minimal ABI
  const ROUTER_ABI = [
    "function getLBPair(address tokenX, address tokenY, uint256 binStep) external view returns (address lbPair)"
  ];

  const router = new ethers.Contract(TJ_ROUTER, ROUTER_ABI, provider);

  try {
    // Check all bin steps
    console.log('\n1. Checking available bin steps...');
    const binSteps = [1, 5, 10, 15, 20, 25, 50, 100];
    
    for (const step of binSteps) {
      try {
        const pair = await router.getLBPair(AVAX, USDC, step);
        if (pair && pair !== ethers.ZeroAddress) {
          console.log(`  ✅ Bin step ${step}: ${pair}`);
        } else {
          console.log(`  ❌ Bin step ${step}: No pair`);
        }
      } catch (err) {
        console.log(`  ❌ Bin step ${step}: ${err.message.slice(0, 60)}...`);
      }
    }

    console.log('\n================================');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();