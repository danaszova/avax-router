/**
 * Search for WAVAX pairs in TraderJoe factory
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Searching for WAVAX Pairs in Factory\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  const TJ_FACTORY = '0x9ad6c38be94206ca50bb0d90783181662f0cfa10';
  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';

  const FACTORY_ABI = [
    "function allPairs(uint256) external view returns (address)",
    "function allPairsLength() external view returns (uint256)"
  ];
  
  const PAIR_ABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)"
  ];

  const factory = new ethers.Contract(TJ_FACTORY, FACTORY_ABI, provider);
  const length = await factory.allPairsLength();
  
  console.log(`Searching ${length} pairs for WAVAX...`);
  console.log('WAVAX address:', WAVAX, '\n');
  
  let found = 0;
  const wavaxPairs = [];
  
  // Sample pairs (every 2000th pair)
  for (let i = 0; i < Number(length) && found < 5; i += 2000) {
    try {
      const pairAddr = await factory.allPairs(i);
      const pair = new ethers.Contract(pairAddr, PAIR_ABI, provider);
      const t0 = await pair.token0();
      const t1 = await pair.token1();
      
      if (t0.toLowerCase() === WAVAX.toLowerCase() || t1.toLowerCase() === WAVAX.toLowerCase()) {
        const [r0, r1] = await pair.getReserves();
        
        // Check if it has meaningful liquidity
        const reserve0 = parseFloat(ethers.formatEther(r0));
        const reserve1 = parseFloat(ethers.formatEther(r1));
        
        if (reserve0 > 1 || reserve1 > 1) {
          console.log(`\n✅ Found WAVAX pair at index ${i}:`);
          console.log(`  Pair: ${pairAddr}`);
          console.log(`  Token0: ${t0}`);
          console.log(`  Token1: ${t1}`);
          console.log(`  Reserve0: ${reserve0}`);
          console.log(`  Reserve1: ${reserve1}`);
          found++;
        }
      }
    } catch (err) {}
  }
  
  console.log(`\n\nFound ${found} WAVAX pairs with liquidity`);

  // Now let's try the router with a pair we know exists
  console.log('\n\n=== Testing Router with First Pair ===');
  const ROUTER_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
  ];
  const TJ_ROUTER = '0x60ae616a2155ee3d9a68541ba4544862310933d4';
  const router = new ethers.Contract(TJ_ROUTER, ROUTER_ABI, provider);
  
  // Get pair 0
  try {
    const pairAddr = await factory.allPairs(0);
    const pair = new ethers.Contract(pairAddr, PAIR_ABI, provider);
    const t0 = await pair.token0();
    const t1 = await pair.token1();
    
    const amountIn = ethers.parseEther('0.001');
    const amounts = await router.getAmountsOut(amountIn, [t0, t1]);
    console.log(`✅ Router works!`);
    console.log(`  ${ethers.formatEther(amounts[0])} -> ${ethers.formatEther(amounts[1])}`);
  } catch (err) {
    console.log(`Router error: ${err.message?.slice(0, 100)}`);
  }
}

main().catch(console.error);