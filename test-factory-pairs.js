/**
 * Check actual pairs from TraderJoe factory
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Checking TraderJoe Factory Pairs\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  const TJ_FACTORY = '0x9ad6c38be94206ca50bb0d90783181662f0cfa10';
  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
  const USDC_E = '0xa7d7079b0fead91f3e65d86e3331f77b8f7e17e3';

  const FACTORY_ABI = [
    "function allPairs(uint256) external view returns (address)",
    "function allPairsLength() external view returns (uint256)",
    "function getPair(address tokenA, address tokenB) external view returns (address pair)"
  ];
  
  const PAIR_ABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)"
  ];

  const factory = new ethers.Contract(TJ_FACTORY, FACTORY_ABI, provider);

  // Check recent pairs (higher indices likely newer)
  console.log('Checking recent pairs:');
  const length = await factory.allPairsLength();
  
  // Check last 5 pairs
  for (let i = Number(length) - 1; i >= Number(length) - 5; i--) {
    try {
      const pairAddr = await factory.allPairs(i);
      const pair = new ethers.Contract(pairAddr, PAIR_ABI, provider);
      const [r0, r1] = await pair.getReserves();
      const t0 = await pair.token0();
      const t1 = await pair.token1();
      
      console.log(`\nPair ${i}: ${pairAddr}`);
      console.log(`  Token0: ${t0}`);
      console.log(`  Token1: ${t1}`);
      console.log(`  Reserve0: ${ethers.formatEther(r0)}`);
      console.log(`  Reserve1: ${ethers.formatEther(r1)}`);
    } catch (err) {
      console.log(`Pair ${i}: Error`);
    }
  }

  // Try getPair with different case
  console.log('\n\n=== Testing getPair ===');
  console.log('WAVAX:', WAVAX);
  console.log('USDC:', USDC);
  
  // The getPair function might be case-sensitive
  // Try with exact addresses
  try {
    const pair = await factory.getPair(WAVAX, USDC);
    console.log('getPair(WAVAX, USDC):', pair);
  } catch (err) {
    console.log('getPair error:', err.message?.slice(0, 80));
  }

  // Check first pair
  console.log('\n\n=== First Pair ===');
  try {
    const pairAddr = await factory.allPairs(0);
    const pair = new ethers.Contract(pairAddr, PAIR_ABI, provider);
    const t0 = await pair.token0();
    const t1 = await pair.token1();
    const [r0, r1] = await pair.getReserves();
    
    console.log(`Pair 0: ${pairAddr}`);
    console.log(`  Token0: ${t0}`);
    console.log(`  Token1: ${t1}`);
    console.log(`  Reserve0: ${ethers.formatEther(r0)}`);
    console.log(`  Reserve1: ${ethers.formatEther(r1)}`);
  } catch (err) {
    console.log('Error:', err.message);
  }
}

main().catch(console.error);