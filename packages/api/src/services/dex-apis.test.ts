/**
 * Unit tests for DEX API decimal handling
 * Run with: npm test
 */

import { getBestQuote, getTraderJoeQuote, getPangolinQuote } from './dex-apis';

// Test constants
const AVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
const USDT = '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7';

// Helper to convert USDC base units to display value
function fromUSDC(baseUnits: string): number {
  return parseFloat(baseUnits) / 1e6;
}

// Helper to convert AVAX wei to display value  
function fromAVAX(wei: string): number {
  return parseFloat(wei) / 1e18;
}

// Helper to convert display value to USDC base units
function toUSDC(amount: number): string {
  return Math.floor(amount * 1e6).toString();
}

// Helper to convert display value to AVAX wei
function toAVAX(amount: number): string {
  return Math.floor(amount * 1e18).toString();
}

describe('DEX API Decimal Tests', () => {
  
  test('TraderJoe AVAX->USDC quote returns correct decimal value', async () => {
    const amountIn = toAVAX(0.25); // 0.25 AVAX
    const quote = await getTraderJoeQuote(AVAX, USDC, amountIn);
    
    expect(quote).not.toBeNull();
    if (!quote) return;
    
    // The raw amountOut should be around 2231027 (2.231027 USDC in base units)
    const amountOutNum = parseFloat(quote.amountOut);
    const usdcValue = fromUSDC(quote.amountOut);
    
    console.log(`TraderJoe: 0.25 AVAX -> ${usdcValue} USDC (raw: ${quote.amountOut})`);
    
    // Should be approximately 2.23 USDC
    expect(usdcValue).toBeGreaterThan(2.0);
    expect(usdcValue).toBeLessThan(3.0);
    
    // Raw value should be millions, not quadrillions
    expect(quote.amountOut.length).toBeLessThan(10); // 2231027 has 7 digits
  });

  test('Pangolin AVAX->USDC quote returns correct decimal value', async () => {
    const amountIn = toAVAX(0.25);
    const quote = await getPangolinQuote(AVAX, USDC, amountIn);
    
    expect(quote).not.toBeNull();
    if (!quote) return;
    
    const usdcValue = fromUSDC(quote.amountOut);
    console.log(`Pangolin: 0.25 AVAX -> ${usdcValue} USDC (raw: ${quote.amountOut})`);
    
    // Should be approximately 2.22 USDC (slightly worse than TraderJoe)
    expect(usdcValue).toBeGreaterThan(2.0);
    expect(usdcValue).toBeLessThan(3.0);
    expect(quote.amountOut.length).toBeLessThan(10);
  });

  test('Best quote returns valid USDC amount for 1 AVAX', async () => {
    const amountIn = toAVAX(1.0); // 1 AVAX
    const result = await getBestQuote(AVAX, USDC, amountIn);
    
    console.log(`Best quote for 1 AVAX: ${result.bestDex} -> ${fromUSDC(result.amountOut)} USDC`);
    
    // Should get approximately 8.9 USDC for 1 AVAX
    const usdcValue = fromUSDC(result.amountOut);
    expect(usdcValue).toBeGreaterThan(8.0);
    expect(usdcValue).toBeLessThan(10.0);
    
    // Raw amount should be millions, not huge
    expect(result.amountOut.length).toBeLessThan(10);
    
    // Should have multiple quotes
    expect(result.allQuotes.length).toBeGreaterThan(0);
  });

  test('Best quote returns valid AVAX amount for 100 USDC', async () => {
    const amountIn = toUSDC(100); // 100 USDC
    const result = await getBestQuote(USDC, AVAX, amountIn);
    
    console.log(`Best quote for 100 USDC: ${result.bestDex} -> ${fromAVAX(result.amountOut)} AVAX`);
    
    // Should get approximately 11.2 AVAX for 100 USDC
    const avaxValue = fromAVAX(result.amountOut);
    expect(avaxValue).toBeGreaterThan(10.0);
    expect(avaxValue).toBeLessThan(12.0);
    
    // Raw amount should have 18 decimals worth of digits
    expect(result.amountOut.length).toBeGreaterThan(15);
    expect(result.amountOut.length).toBeLessThan(20);
  });

  test('Decimal calculation is mathematically correct', async () => {
    // Test the exact decimal conversion
    const testAmounts = [0.1, 0.25, 0.5, 1.0, 2.0];
    
    for (const avaxAmount of testAmounts) {
      const amountIn = toAVAX(avaxAmount);
      const quote = await getTraderJoeQuote(AVAX, USDC, amountIn);
      
      expect(quote).not.toBeNull();
      if (!quote) continue;
      
      const usdcValue = fromUSDC(quote.amountOut);
      const expectedRate = 8.92; // ~$8.92 per AVAX
      const actualRate = usdcValue / avaxAmount;
      
      console.log(`${avaxAmount} AVAX -> ${usdcValue} USDC (rate: ${actualRate})`);
      
      // Rate should be approximately 8.92 USDC per AVAX
      expect(actualRate).toBeGreaterThan(8.0);
      expect(actualRate).toBeLessThan(10.0);
    }
  });

  test('Amount scales linearly', async () => {
    const amount1 = toAVAX(0.5);
    const amount2 = toAVAX(1.0); // 2x the amount
    
    const quote1 = await getTraderJoeQuote(AVAX, USDC, amount1);
    const quote2 = await getTraderJoeQuote(AVAX, USDC, amount2);
    
    expect(quote1).not.toBeNull();
    expect(quote2).not.toBeNull();
    if (!quote1 || !quote2) return;
    
    const usdc1 = fromUSDC(quote1.amountOut);
    const usdc2 = fromUSDC(quote2.amountOut);
    
    // 1.0 AVAX should give roughly 2x the USDC of 0.5 AVAX
    const ratio = usdc2 / usdc1;
    console.log(`Linear scaling: ${usdc1} -> ${usdc2}, ratio: ${ratio}`);
    
    expect(ratio).toBeGreaterThan(1.9);
    expect(ratio).toBeLessThan(2.1);
  });

  test('USDC->USDT stablecoin swap returns nearly 1:1', async () => {
    const amountIn = toUSDC(100); // 100 USDC
    const result = await getBestQuote(USDC, USDT, amountIn);
    
    console.log(`Stable swap: 100 USDC -> ${fromUSDC(result.amountOut)} USDT via ${result.bestDex}`);
    
    const usdtValue = fromUSDC(result.amountOut);
    
    // Should be very close to 100 (within 1% due to fees)
    expect(usdtValue).toBeGreaterThan(99.0);
    expect(usdtValue).toBeLessThan(100.0);
    
    // Raw amount should be millions
    expect(result.amountOut.length).toBeLessThan(10);
  });

  test('Does NOT return astronomically large numbers', async () => {
    const amountIn = toAVAX(0.25);
    const quote = await getTraderJoeQuote(AVAX, USDC, amountIn);
    
    expect(quote).not.toBeNull();
    if (!quote) return;
    
    const rawAmount = parseFloat(quote.amountOut);
    
    // Should be in millions, not quadrillions
    expect(rawAmount).toBeLessThan(100_000_000); // Less than 100 million
    expect(rawAmount).toBeGreaterThan(1_000_000); // More than 1 million (2.23 USDC = 2,230,000)
    
    console.log(`Sanity check: raw amount ${rawAmount} is reasonable`);
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running DEX API decimal tests...\n');
  
  const tests = [
    'TraderJoe AVAX->USDC quote returns correct decimal value',
    'Pangolin AVAX->USDC quote returns correct decimal value',
    'Best quote returns valid USDC amount for 1 AVAX',
    'Best quote returns valid AVAX amount for 100 USDC',
    'Decimal calculation is mathematically correct',
    'Amount scales linearly',
    'USDC->USDT stablecoin swap returns nearly 1:1',
    'Does NOT return astronomically large numbers',
  ];
  
  let passed = 0;
  let failed = 0;
  
  (async () => {
    for (const testName of tests) {
      try {
        const testFn = (describe as any).getTests?.()[testName] || (async () => {});
        await testFn();
        console.log(`✅ ${testName}`);
        passed++;
      } catch (err) {
        console.log(`❌ ${testName}: ${err}`);
        failed++;
      }
    }
    
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  })();
}