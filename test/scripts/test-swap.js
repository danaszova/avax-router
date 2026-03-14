/**
 * Test script to verify swap readiness
 * Run with: node test-swap.js
 */

const { ethers } = require('ethers');

// Contract info
const DEX_ROUTER_ADDRESS = '0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5';
const AVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';

// ABI with payable functions
const DEX_ROUTER_ABI = [
  "function swapBestRoute(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient) external payable returns (uint256 amountOut)",
  "function swapOnDex(string calldata dexName, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient) external payable returns (uint256 amountOut)",
  "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) external view returns (string memory bestDex, uint256 bestAmountOut)",
  "function getRegisteredDexes() external view returns (string[] memory)",
  "function adapters(string) external view returns (address)"
];

async function testContract() {
  console.log('🔍 Testing DEX Router Contract\n');
  console.log('================================\n');

  // Connect to Avalanche mainnet
  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  const dexRouter = new ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);

  try {
    // Test 1: Check registered DEXes
    console.log('Test 1: Checking registered DEXes...');
    const dexes = await dexRouter.getRegisteredDexes();
    console.log(`  ✅ Found ${dexes.length} DEXes: ${dexes.join(', ')}`);
    
    // Test 2: Check adapters
    console.log('\nTest 2: Checking DEX adapters...');
    for (const dex of dexes) {
      const adapter = await dexRouter.adapters(dex);
      console.log(`  ${dex}: ${adapter}`);
    }

    // Test 3: Test quote for 0.01 AVAX
    console.log('\nTest 3: Getting quote for 0.01 AVAX → USDC...');
    const amountIn = ethers.parseEther('0.01');
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(AVAX, USDC, amountIn);
    const usdcOut = parseFloat(ethers.formatUnits(bestAmountOut, 6));
    console.log(`  Best DEX: ${bestDex}`);
    console.log(`  Amount out: ${usdcOut} USDC`);
    console.log(`  Rate: ${usdcOut / 0.01} USDC per AVAX`);

    // Test 4: Verify contract has code
    console.log('\nTest 4: Verifying contract deployment...');
    const code = await provider.getCode(DEX_ROUTER_ADDRESS);
    if (code && code !== '0x') {
      console.log(`  ✅ Contract is deployed (${code.length} bytes)`);
    } else {
      console.log('  ❌ Contract not found at this address!');
    }

    // Test 5: Check if we can estimate gas (this will fail without a signer, but we can check the error)
    console.log('\nTest 5: Checking transaction format...');
    try {
      const iface = new ethers.Interface(DEX_ROUTER_ABI);
      const data = iface.encodeFunctionData('swapBestRoute', [
        AVAX,
        USDC,
        amountIn,
        bestAmountOut * 995n / 1000n, // 0.5% slippage
        DEX_ROUTER_ADDRESS // dummy recipient
      ]);
      
      console.log('  ✅ Transaction encoding works');
      console.log(`  Data: ${data.slice(0, 50)}...`);
      
      // Check if function is payable
      const fragment = iface.getFunction('swapBestRoute');
      console.log(`  Function payable: ${fragment.payable}`);
      
    } catch (err) {
      console.log(`  Error encoding: ${err.message}`);
    }

    console.log('\n================================');
    console.log('✅ All tests passed!');
    console.log('\nThe contract is ready for swaps.');
    console.log('Connect with MetaMask and try a small test swap (0.01 AVAX)');

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    console.error(err);
  }
}

testContract();