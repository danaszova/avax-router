/**
 * Test the deployed DexRouter contract directly with correct addresses
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing Deployed Contract with Correct Addresses\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Correct lowercase addresses
  const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
  
  // Deployed contracts
  const DEX_ROUTER = '0x3ff7faad7417130c60b7422de712ead9a7c2e3b5';
  
  const DEX_ROUTER_ABI = [
    "function getRegisteredDexes() view returns (string[] memory)",
    "function getAdapter(string calldata dexName) view returns (address)",
    "function getQuote(string calldata dexName, address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)",
    "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) view returns (string memory bestDex, uint256 bestAmountOut)"
  ];

  const dexRouter = new ethers.Contract(DEX_ROUTER, DEX_ROUTER_ABI, provider);
  
  // Check registered DEXes
  console.log('=== Registered DEXes ===');
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log('DEXes:', registeredDexes);
  
  // Get adapter address
  for (const dex of registeredDexes) {
    try {
      const adapter = await dexRouter.getAdapter(dex);
      console.log(`${dex} adapter: ${adapter}`);
    } catch (e) {}
  }

  // Try getQuote for each DEX
  console.log('\n=== Testing getQuote ===');
  const amountIn = ethers.parseEther('0.1');
  
  for (const dex of registeredDexes) {
    console.log(`\n${dex}:`);
    try {
      const quote = await dexRouter.getQuote(dex, WAVAX, USDC, amountIn);
      console.log(`  ✅ Quote: ${ethers.formatUnits(quote, 6)} USDC`);
    } catch (e) {
      console.log(`  ❌ Quote failed: ${e.reason || e.message?.slice(0, 80)}`);
    }
  }

  // Try findBestRoute
  console.log('\n=== Testing findBestRoute ===');
  try {
    const [bestDex, bestAmount] = await dexRouter.findBestRoute(WAVAX, USDC, amountIn);
    console.log(`✅ Best DEX: ${bestDex}`);
    console.log(`   Amount out: ${ethers.formatUnits(bestAmount, 6)} USDC`);
  } catch (e) {
    console.log(`❌ findBestRoute failed: ${e.reason || e.message?.slice(0, 100)}`);
  }

  // Check the adapter contract directly
  console.log('\n\n=== Checking Adapter Directly ===');
  
  // Get TraderJoeV1 adapter address
  try {
    const tjAdapter = await dexRouter.getAdapter('TraderJoeV1');
    console.log('TJ V1 Adapter:', tjAdapter);
    
    const ADAPTER_ABI = [
      "function dexName() view returns (string memory)",
      "function hasPool(address tokenA, address tokenB) view returns (bool)",
      "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)"
    ];
    
    const adapter = new ethers.Contract(tjAdapter, ADAPTER_ABI, provider);
    
    // Check name
    const name = await adapter.dexName();
    console.log('Adapter name:', name);
    
    // Check hasPool
    const hasPool = await adapter.hasPool(WAVAX, USDC);
    console.log('Has WAVAX-USDC pool:', hasPool);
    
    // Get quote
    if (hasPool) {
      const quote = await adapter.getAmountOut(WAVAX, USDC, amountIn);
      console.log(`✅ Direct quote: ${ethers.formatUnits(quote, 6)} USDC`);
    }
  } catch (e) {
    console.log('Adapter check failed:', e.reason || e.message?.slice(0, 100));
  }
}

main().catch(console.error);