/**
 * Check known AVAX-USDC pair addresses directly
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Checking Known Pair Addresses\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Known pair addresses (from various sources)
  const PAIRS = {
    'TJ AVAX-USDC.e': '0xe431cb4bea6f7f1e2a25070e47b2dd4a026d6851',
    'TJ AVAX-USDT': '0x435b8bb957915aeede39f6cd2514e91d4b84258e',
    'Pangolin AVAX-USDC.e': '0x9ee0a4e21bd333a6bbceab792eee465b7e0eacful', // lowercase to avoid checksum
  };

  const PAIR_ABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function totalSupply() external view returns (uint256)"
  ];

  for (const [name, addr] of Object.entries(PAIRS)) {
    console.log(`${name}:`);
    try {
      const pair = new ethers.Contract(addr.toLowerCase(), PAIR_ABI, provider);
      const [r0, r1] = await pair.getReserves();
      const t0 = await pair.token0();
      const t1 = await pair.token1();
      const supply = await pair.totalSupply();
      
      console.log(`  ✅ Pair exists!`);
      console.log(`  Token0: ${t0}`);
      console.log(`  Token1: ${t1}`);
      console.log(`  Reserve0: ${ethers.formatEther(r0)}`);
      console.log(`  Reserve1: ${ethers.formatUnits(r1, 6)}`);
      console.log(`  Total Supply: ${ethers.formatEther(supply)}`);
    } catch (err) {
      console.log(`  ❌ Not found or error`);
    }
    console.log();
  }

  // Try the newer USDC (Circle native)
  console.log('\n=== Searching for Circle USDC pairs ===');
  // Use DexScreener or similar API
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e');
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      console.log('Found pairs on DexScreener:');
      for (const pair of data.pairs.slice(0, 5)) {
        console.log(`  - ${pair.baseToken?.symbol}/${pair.quoteToken?.symbol} on ${pair.dexId}`);
        console.log(`    Pair: ${pair.pairAddress}`);
        console.log(`    Liquidity: $${pair.liquidity?.usd?.toLocaleString()}`);
      }
    }
  } catch (err) {
    console.log('DexScreener API error:', err.message);
  }
}

main();