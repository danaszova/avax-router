/**
 * Test TraderJoe V2.1 (new AMM with concentrated liquidity)
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing TraderJoe V2.1\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Tokens
  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';

  // Check if these routers exist and work
  const ROUTERS = {
    'TJ V2.1 Router': '0x542ba2c2e5ddc245dd1e26739ba818bfd3d005e5',
    'TJ LB Router': '0xb4315e873dbcf96ffd0acd6ea047c66507581979',
  };

  const ROUTER_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
    "function factory() external view returns (address)"
  ];

  const amountIn = ethers.parseEther('0.01');

  for (const [name, addr] of Object.entries(ROUTERS)) {
    console.log(`\n${name}:`);
    try {
      const code = await provider.getCode(addr);
      if (code.length <= 2) {
        console.log('  ❌ No code');
        continue;
      }
      console.log('  Has code: YES');
      
      const router = new ethers.Contract(addr, ROUTER_ABI, provider);
      
      try {
        const factory = await router.factory();
        console.log(`  Factory: ${factory}`);
      } catch (e) {}
      
      try {
        const amounts = await router.getAmountsOut(amountIn, [WAVAX, USDC]);
        console.log(`  ✅ Quote works: ${ethers.formatUnits(amounts[1], 6)} USDC`);
      } catch (e) {
        console.log(`  ❌ Quote failed: ${e.reason || e.message?.slice(0, 50)}`);
      }
    } catch (err) {
      console.log(`  Error: ${err.message?.slice(0, 50)}`);
    }
  }

  // Check Uniswap V3 Quoter V2
  console.log('\n\n=== Uniswap V3 Quoter V2 ===');
  const QUOTER_V2 = '0x5aeE966B00fB3C41f05F9635167a35970123713b';
  
  const QUOTER_V2_ABI = [
    "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)"
  ];

  try {
    const code = await provider.getCode(QUOTER_V2);
    console.log(`Code: ${code.length > 2 ? 'EXISTS' : 'NO CODE'}`);
    
    if (code.length > 2) {
      const quoter = new ethers.Contract(QUOTER_V2, QUOTER_V2_ABI, provider);
      
      for (const fee of [500, 2500, 3000, 10000]) {
        try {
          const calldata = quoter.interface.encodeFunctionData('quoteExactInputSingle', [{
            tokenIn: WAVAX,
            tokenOut: USDC,
            amountIn: amountIn,
            fee: fee,
            sqrtPriceLimitX96: 0
          }]);
          
          const result = await provider.call({ to: QUOTER_V2, data: calldata });
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ['uint256', 'uint160', 'uint32', 'uint256'],
            result
          );
          console.log(`  ✅ Fee ${fee}: ${ethers.formatUnits(decoded[0], 6)} USDC`);
        } catch (e) {
          console.log(`  ❌ Fee ${fee}: No pool`);
        }
      }
    }
  } catch (err) {
    console.log(`Error: ${err.message?.slice(0, 50)}`);
  }
}

main().catch(console.error);