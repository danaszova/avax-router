/**
 * Test TraderJoe V1 Factory directly
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Testing TraderJoe V1 Factory Directly\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Use lowercase addresses to avoid checksum issues
  const TJ_FACTORY = '0x9ad6c38be94206ca50bb0d90783181662f0cfa10';
  const TJ_ROUTER = '0x60ae616a2155ee3d9a68541ba4544862310933d4';
  const AVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC_CIRCLE = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
  const USDC_BRIDGED = '0xa7d7079b0fead91f3e65d86e3331f77b8f7e17e3'; // USDC.e
  const USDT = '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7';

  const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)"
  ];

  const factory = new ethers.Contract(TJ_FACTORY, FACTORY_ABI, provider);

  console.log('1. Testing Factory getPair:');
  
  // Try AVAX-USDC
  try {
    const pair1 = await factory.getPair(AVAX, USDC_CIRCLE);
    console.log('  AVAX-USDC (Circle):', pair1);
  } catch (err) {
    console.log('  AVAX-USDC (Circle): Error');
  }
  
  // Try AVAX-USDC.e (bridged)
  try {
    const pair2 = await factory.getPair(AVAX, USDC_BRIDGED);
    console.log('  AVAX-USDC.e (Bridged):', pair2);
  } catch (err) {
    console.log('  AVAX-USDC.e (Bridged): Error');
  }
  
  // Try with USDT
  try {
    const pair3 = await factory.getPair(AVAX, USDT);
    console.log('  AVAX-USDT:', pair3);
  } catch (err) {
    console.log('  AVAX-USDT: Error');
  }
  
  // Try USDC.e - USDC
  try {
    const pair4 = await factory.getPair(USDC_BRIDGED, USDC_CIRCLE);
    console.log('  USDC.e-USDC:', pair4);
  } catch (err) {}

  // Try USDC.e - USDT
  try {
    const pair5 = await factory.getPair(USDC_BRIDGED, USDT);
    console.log('  USDC.e-USDT:', pair5);
  } catch (err) {}
}

main();