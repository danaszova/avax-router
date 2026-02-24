/**
 * Find REAL working pools on Avalanche
 * Testing: Uniswap V3, TraderJoe LB
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Finding REAL Working Pools on Avalanche\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Tokens
  const WAVAX = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
  const USDC = '0xB97ef9ef8734C71904d8002F8b6Bc66Dd9c48a6E';
  const USDC_E = '0xA7D7079b0fEaD91F3e65f86E441549223E77cD07';

  // 1. Check Uniswap V3 Factory
  console.log('=== Uniswap V3 Factory ===');
  const UNI_V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
  
  const factoryCode = await provider.getCode(UNI_V3_FACTORY);
  console.log('Factory code exists:', factoryCode.length > 2 ? 'YES' : 'NO');

  if (factoryCode.length > 2) {
    const V3_FACTORY_ABI = [
      "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
    ];
    
    const factory = new ethers.Contract(UNI_V3_FACTORY, V3_FACTORY_ABI, provider);
    
    console.log('\nChecking WAVAX-USDC pools:');
    for (const fee of [500, 2500, 3000, 10000]) {
      try {
        const pool = await factory.getPool(WAVAX, USDC, fee);
        if (pool !== '0x0000000000000000000000000000000000000000') {
          console.log(`  ✅ Fee ${fee}: ${pool}`);
          
          // Check pool reserves
          const POOL_ABI = [
            "function liquidity() external view returns (uint128)",
            "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
          ];
          const poolContract = new ethers.Contract(pool, POOL_ABI, provider);
          const liquidity = await poolContract.liquidity();
          console.log(`     Liquidity: ${liquidity.toString()}`);
        }
      } catch (e) {
        console.log(`  ❌ Fee ${fee}: ${e.reason || e.message?.slice(0, 40)}`);
      }
    }

    console.log('\nChecking WAVAX-USDC.e pools:');
    for (const fee of [500, 2500, 3000, 10000]) {
      try {
        const pool = await factory.getPool(WAVAX, USDC_E, fee);
        if (pool !== '0x0000000000000000000000000000000000000000') {
          console.log(`  ✅ Fee ${fee}: ${pool}`);
          const poolContract = new ethers.Contract(pool, ['function liquidity() external view returns (uint128)'], provider);
          const liquidity = await poolContract.liquidity();
          console.log(`     Liquidity: ${liquidity.toString()}`);
        }
      } catch (e) {}
    }
  }

  // 2. Check TraderJoe LB Factory
  console.log('\n\n=== TraderJoe Liquidity Book Factory ===');
  const TJ_LB_FACTORY = '0x5e6420766f31aa7710473b3e7feb23a3e9b5b99a';
  
  const lbFactoryCode = await provider.getCode(TJ_LB_FACTORY);
  console.log('LB Factory code exists:', lbFactoryCode.length > 2 ? 'YES' : 'NO');

  if (lbFactoryCode.length > 2) {
    // LB Factory uses different method to get pairs
    const LB_FACTORY_ABI = [
      "function getLBPairInformation(uint8 tokenXDecimals, uint8 tokenYDecimals, address tokenX, address tokenY, uint256 binStep) external view returns (address lbPair)"
    ];
    
    try {
      const lbFactory = new ethers.Contract(TJ_LB_FACTORY, LB_FACTORY_ABI, provider);
      
      // Try different bin steps
      console.log('\nTrying LB pairs with different bin steps:');
      for (const binStep of [10, 20, 50, 100, 200]) {
        try {
          // USDC has 6 decimals, WAVAX has 18
          const pair = await lbFactory.getLBPairInformation(18, 6, WAVAX, USDC, binStep);
          if (pair && pair !== '0x0000000000000000000000000000000000000000') {
            console.log(`  ✅ BinStep ${binStep}: ${pair}`);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.log('LB Factory error:', e.message?.slice(0, 80));
    }
  }

  // 3. Try Uniswap V3 Quoter
  console.log('\n\n=== Uniswap V3 Quoter (Direct Quote Test) ===');
  const UNI_QUOTER = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
  
  const quoterCode = await provider.getCode(UNI_QUOTER);
  console.log('Quoter code exists:', quoterCode.length > 2 ? 'YES' : 'NO');

  if (quoterCode.length > 2) {
    // Try the quoter with static call
    const QUOTER_ABI = [
      "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
    ];
    
    const amountIn = ethers.parseEther('0.01');
    
    for (const fee of [500, 3000, 10000]) {
      try {
        const quoter = new ethers.Contract(UNI_QUOTER, QUOTER_ABI, provider);
        const calldata = quoter.interface.encodeFunctionData('quoteExactInputSingle', [
          WAVAX, USDC, fee, amountIn, 0
        ]);
        
        const result = await provider.call({
          to: UNI_QUOTER,
          data: calldata
        });
        
        const [amountOut] = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], result);
        console.log(`  ✅ Fee ${fee}: ${ethers.formatUnits(amountOut, 6)} USDC`);
      } catch (e) {
        console.log(`  ❌ Fee ${fee}: ${e.reason || 'No pool'}`);
      }
    }
  }

  // 4. Check actual router swap simulation
  console.log('\n\n=== Uniswap V3 Router (Swap Simulation) ===');
  const UNI_ROUTER = '0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE';
  
  const routerCode = await provider.getCode(UNI_ROUTER);
  console.log('Router code exists:', routerCode.length > 2 ? 'YES' : 'NO');
}

main().catch(console.error);