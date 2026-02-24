/**
 * Test the ACTUAL factories we found
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing Real Factories\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Use lowercase to avoid checksum issues
  const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
  const USDC_E = '0xa7d7079b0fead91f3e65d86e3331f77b8f7e17e3';

  // Factories we found
  const FACTORIES = {
    'UniV3/TJV2 Factory': '0x740b1c1de25031c31ff4fc9a62f554a55cdc1bad',
    'TJ V1 Factory': '0x9ad6c38be94206ca50bb0d90783181662f0cfa10',
  };

  // Test V2-style factory (getPair)
  console.log('=== Testing TJ V1 Factory (V2-style) ===');
  const V2_FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
    "function allPairsLength() external view returns (uint256)"
  ];
  
  const tjFactory = new ethers.Contract(FACTORIES['TJ V1 Factory'], V2_FACTORY_ABI, provider);
  
  const pairCount = await tjFactory.allPairsLength();
  console.log(`Total pairs: ${pairCount}`);
  
  // Check specific pairs
  const pairs = [
    ['WAVAX', 'USDC', WAVAX, USDC],
    ['WAVAX', 'USDC.e', WAVAX, USDC_E],
  ];
  
  for (const [nameA, nameB, addrA, addrB] of pairs) {
    try {
      const pair = await tjFactory.getPair(addrA, addrB);
      if (pair === '0x0000000000000000000000000000000000000000') {
        console.log(`${nameA}-${nameB}: NO PAIR`);
      } else {
        console.log(`${nameA}-${nameB}: ${pair}`);
        
        // Check reserves
        const PAIR_ABI = ['function getReserves() external view returns (uint112 r0, uint112 r1, uint32 ts)'];
        const pairContract = new ethers.Contract(pair, PAIR_ABI, provider);
        try {
          const [r0, r1] = await pairContract.getReserves();
          console.log(`  Reserves: ${ethers.formatEther(r0)} / ${ethers.formatUnits(r1, 6)}`);
        } catch (e) {
          console.log(`  Reserves: Error reading`);
        }
      }
    } catch (e) {
      console.log(`${nameA}-${nameB}: Error - ${e.reason || e.message?.slice(0, 40)}`);
    }
  }

  // Test V3-style factory (getPool)
  console.log('\n=== Testing UniV3/TJV2 Factory (V3-style) ===');
  const V3_FACTORY_ABI = [
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
  ];
  
  const v3Factory = new ethers.Contract(FACTORIES['UniV3/TJV2 Factory'], V3_FACTORY_ABI, provider);
  
  for (const fee of [500, 2500, 3000, 10000]) {
    try {
      const pool = await v3Factory.getPool(WAVAX, USDC, fee);
      if (pool === '0x0000000000000000000000000000000000000000') {
        console.log(`WAVAX-USDC fee ${fee}: NO POOL`);
      } else {
        console.log(`WAVAX-USDC fee ${fee}: ${pool}`);
        
        // Check liquidity
        const POOL_ABI = ['function liquidity() external view returns (uint128)'];
        const poolContract = new ethers.Contract(pool, POOL_ABI, provider);
        try {
          const liq = await poolContract.liquidity();
          console.log(`  Liquidity: ${liq}`);
        } catch (e) {}
      }
    } catch (e) {
      console.log(`WAVAX-USDC fee ${fee}: Error - ${e.reason || e.message?.slice(0, 40)}`);
    }
  }

  // Also try USDC.e
  console.log('\nChecking WAVAX-USDC.e pools:');
  for (const fee of [500, 2500, 3000, 10000]) {
    try {
      const pool = await v3Factory.getPool(WAVAX, USDC_E, fee);
      if (pool === '0x0000000000000000000000000000000000000000') {
        console.log(`WAVAX-USDC.e fee ${fee}: NO POOL`);
      } else {
        console.log(`WAVAX-USDC.e fee ${fee}: ${pool}`);
        const POOL_ABI = ['function liquidity() external view returns (uint128)'];
        const poolContract = new ethers.Contract(pool, POOL_ABI, provider);
        try {
          const liq = await poolContract.liquidity();
          console.log(`  Liquidity: ${liq}`);
        } catch (e) {}
      }
    } catch (e) {}
  }
}

main().catch(console.error);