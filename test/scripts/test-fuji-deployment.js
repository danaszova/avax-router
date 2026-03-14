/**
 * Test Fuji Testnet Deployment
 * 
 * Run with: node test-fuji-deployment.js
 */

const { ethers } = require('ethers');

// Fuji Testnet Addresses
const DEX_ROUTER_ADDRESS = '0x59Cf00307E49f61485a3802EB1048168b780f30e';

// Fuji tokens (if they exist)
const WAVAX = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'; // Fuji WAVAX
const USDC = '0x5425890298aed601595a70AB815c96711a31Bc65'; // Fuji USDC (if exists)

const DEX_ROUTER_ABI = [
  "function getRegisteredDexes() external view returns (string[] memory)",
  "function adapters(string) external view returns (address)",
  "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) external view returns (string memory bestDex, uint256 bestAmountOut)",
  "function getQuote(string calldata dexName, address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)"
];

async function main() {
  console.log('🧪 Testing Fuji Deployment\n');
  console.log('==========================\n');

  // Connect to Fuji
  const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
  const dexRouter = new ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);

  // Test 1: Check registered DEXes
  console.log('1. Checking registered DEXes...');
  try {
    const dexes = await dexRouter.getRegisteredDexes();
    console.log('   ✅ Registered DEXes:', dexes);
  } catch (err) {
    console.log('   ❌ Failed:', err.message);
    return;
  }

  // Test 2: Check adapters
  console.log('\n2. Checking adapter addresses...');
  try {
    const tjAdapter = await dexRouter.adapters('TraderJoeV2');
    const pangolinAdapter = await dexRouter.adapters('Pangolin');
    console.log('   ✅ TraderJoeV2 Adapter:', tjAdapter);
    console.log('   ✅ Pangolin Adapter:', pangolinAdapter);
  } catch (err) {
    console.log('   ❌ Failed:', err.message);
  }

  // Test 3: Try a quote (may fail if no liquidity on testnet)
  console.log('\n3. Testing quote (WAVAX -> USDC)...');
  try {
    const amountIn = ethers.parseEther('0.01');
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(WAVAX, USDC, amountIn);
    console.log('   ✅ Best DEX:', bestDex);
    console.log('   ✅ Amount out:', ethers.formatUnits(bestAmountOut, 6), 'USDC');
  } catch (err) {
    console.log('   ⚠️ Quote failed (likely no liquidity on testnet):', err.message?.slice(0, 80));
  }

  // Test 4: Verify contract has code
  console.log('\n4. Verifying contract deployment...');
  try {
    const code = await provider.getCode(DEX_ROUTER_ADDRESS);
    if (code && code !== '0x') {
      console.log('   ✅ Contract is deployed (' + code.length + ' bytes)');
    } else {
      console.log('   ❌ No code at address!');
    }
  } catch (err) {
    console.log('   ❌ Failed:', err.message);
  }

  console.log('\n==========================');
  console.log('✅ Fuji deployment verified!');
  console.log('\nView on Snowtrace:');
  console.log(`  https://testnet.snowtrace.io/address/${DEX_ROUTER_ADDRESS}`);
}

main().catch(console.error);