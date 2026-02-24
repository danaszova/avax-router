/**
 * Check the actual status of known pair contracts
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Checking Known Pair Contract Status\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Known TraderJoe pair (from historical data)
  const KNOWN_PAIRS = {
    'TJ WAVAX-JOE': '0x85169afae083c4d635b3c93b705ae05d2f85f51b',
    'TJ WAVAX-USDC.e': '0xe431cb4bea6f7f1e2a25070e47b2dd4a026d6851',
    'TJ WAVAX-WETH': '0x9f95eac0676c8d6896a033e0e1c0c2c2a3c9d7e8',
  };

  const PAIR_ABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function totalSupply() external view returns (uint256)"
  ];

  for (const [name, addr] of Object.entries(KNOWN_PAIRS)) {
    console.log(`${name}:`);
    try {
      const code = await provider.getCode(addr);
      if (code.length <= 2) {
        console.log(`  ❌ No contract at this address`);
      } else {
        const pair = new ethers.Contract(addr, PAIR_ABI, provider);
        const [r0, r1] = await pair.getReserves();
        console.log(`  ✅ Contract exists`);
        console.log(`  Reserve0: ${ethers.formatEther(r0)}`);
        console.log(`  Reserve1: ${ethers.formatEther(r1)}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message?.slice(0, 50)}`);
    }
    console.log();
  }

  // Let's also verify the factory has pairs
  console.log('\n=== Checking Factory ===');
  const TJ_FACTORY = '0x9ad6c38be94206ca50bb0d90783181662f0cfa10';
  const FACTORY_ABI = [
    "function allPairs(uint256) external view returns (address)",
    "function allPairsLength() external view returns (uint256)"
  ];
  
  try {
    const factory = new ethers.Contract(TJ_FACTORY, FACTORY_ABI, provider);
    const length = await factory.allPairsLength();
    console.log(`Factory has ${length} pairs`);
    
    // Check first few pairs
    for (let i = 0; i < Math.min(3, Number(length)); i++) {
      const pair = await factory.allPairs(i);
      console.log(`  Pair ${i}: ${pair}`);
    }
  } catch (err) {
    console.log(`Factory error: ${err.message?.slice(0, 80)}`);
  }
}

main().catch(console.error);