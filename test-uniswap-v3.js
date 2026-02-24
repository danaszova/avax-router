/**
 * Test Uniswap V3 on Avalanche
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing Uniswap V3 on Avalanche\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Uniswap V3 on Avalanche
  const UNISWAP_V3_ROUTER = '0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE';
  const UNISWAP_V3_QUOTER = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
  const UNISWAP_V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';

  // Check contract code
  console.log('Contract Code Check:');
  for (const [name, addr] of Object.entries({
    'V3 Router': UNISWAP_V3_ROUTER,
    'V3 Quoter': UNISWAP_V3_QUOTER,
    'V3 Factory': UNISWAP_V3_FACTORY,
  })) {
    const code = await provider.getCode(addr);
    console.log(`  ${name}: ${code.length > 2 ? 'EXISTS' : 'NO CODE'}`);
  }

  // Quoter ABI for getting quotes
  const QUOTER_ABI = [
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
  ];

  const quoter = new ethers.Contract(UNISWAP_V3_QUOTER, QUOTER_ABI, provider);
  const amountIn = ethers.parseEther('0.01');

  // Try different fee tiers
  console.log('\nTrying V3 Quotes (different fee tiers):');
  for (const fee of [500, 2500, 3000, 10000]) {
    try {
      // Static call
      const data = quoter.interface.encodeFunctionData('quoteExactInputSingle', [
        WAVAX, USDC, fee, amountIn, 0
      ]);
      const result = await provider.call({
        to: UNISWAP_V3_QUOTER,
        data
      });
      const amountOut = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], result)[0];
      console.log(`  ✅ Fee ${fee}: ${ethers.formatUnits(amountOut, 6)} USDC`);
    } catch (err) {
      console.log(`  ❌ Fee ${fee}: No pool`);
    }
  }
}

main().catch(console.error);