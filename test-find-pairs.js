/**
 * Find WAVAX-USDC pairs using DexScreener API
 */

async function main() {
  console.log('🔍 Finding WAVAX-USDC Pairs via DexScreener\n');
  
  // Search for AVAX pairs
  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';

  // Search for WAVAX token pairs
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${WAVAX}`);
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      // Filter for USDC pairs
      const usdcPairs = data.pairs.filter(p => 
        p.baseToken?.address?.toLowerCase() === USDC.toLowerCase() ||
        p.quoteToken?.address?.toLowerCase() === USDC.toLowerCase()
      );
      
      console.log('WAVAX-USDC Pairs Found:');
      for (const pair of usdcPairs) {
        console.log(`\n  DEX: ${pair.dexId}`);
        console.log(`  Pair: ${pair.pairAddress}`);
        console.log(`  Base: ${pair.baseToken?.symbol}`);
        console.log(`  Quote: ${pair.quoteToken?.symbol}`);
        console.log(`  Liquidity: $${pair.liquidity?.usd?.toLocaleString()}`);
        console.log(`  Volume 24h: $${pair.volume?.h24?.toLocaleString()}`);
      }
      
      // Also show top 5 pairs by liquidity
      console.log('\n\n=== Top 5 WAVAX Pairs by Liquidity ===');
      const sorted = data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
      for (const pair of sorted.slice(0, 5)) {
        console.log(`\n  ${pair.baseToken?.symbol}/${pair.quoteToken?.symbol} on ${pair.dexId}`);
        console.log(`  Pair: ${pair.pairAddress}`);
        console.log(`  Liquidity: $${pair.liquidity?.usd?.toLocaleString()}`);
      }
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

main();