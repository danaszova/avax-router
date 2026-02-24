/**
 * Find what pairs actually exist on Avalanche DEXes
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Finding Actual Pairs on Avalanche DEXes\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Tokens
  const WAVAX = '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c';
  const USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
  const USDC_E = '0xa7d7079b0fead91f3e65d86e3331f77b8f7e17e3';
  const USDT = '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7';
  const WETH = '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab';
  const WBTC = '0x50b7545627a5162f82a992c33b87adc75187b218';
  const JOE = '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd';

  const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)"
  ];

  // Factories
  const FACTORIES = {
    'TraderJoe V1': '0x9ad6c38be94206ca50bb0d90783181662f0cfa10',
    'Pangolin': '0xefa94de7a4656d7876678b883ee2b9f0a3151fdc',
    'SushiSwap': '0xc35dadb65012ec5796536bd9864ed361a60e4ae1',
  };

  // Pairs to check
  const PAIRS = [
    ['WAVAX', 'USDC', WAVAX, USDC],
    ['WAVAX', 'USDC.e', WAVAX, USDC_E],
    ['WAVAX', 'USDT', WAVAX, USDT],
    ['WAVAX', 'WETH', WAVAX, WETH],
    ['WAVAX', 'WBTC', WAVAX, WBTC],
    ['WAVAX', 'JOE', WAVAX, JOE],
    ['USDC', 'USDC.e', USDC, USDC_E],
    ['USDC.e', 'USDT', USDC_E, USDT],
  ];

  for (const [dexName, factoryAddr] of Object.entries(FACTORIES)) {
    console.log(`\n${dexName}:`);
    const factory = new ethers.Contract(factoryAddr, FACTORY_ABI, provider);
    
    for (const [nameA, nameB, addrA, addrB] of PAIRS) {
      try {
        const pair = await factory.getPair(addrA, addrB);
        if (pair && pair !== '0x0000000000000000000000000000000000000000') {
          console.log(`  ✅ ${nameA}-${nameB}: ${pair}`);
        }
      } catch (err) {}
    }
  }

  // Also check if these are the correct factory addresses by calling a test
  console.log('\n\n=== Verifying Factory Addresses ===');
  
  for (const [dexName, factoryAddr] of Object.entries(FACTORIES)) {
    const code = await provider.getCode(factoryAddr);
    console.log(`${dexName} factory has code: ${code.length > 2 ? 'YES' : 'NO'}`);
  }
}

main();