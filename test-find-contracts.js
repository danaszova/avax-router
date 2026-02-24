/**
 * Find ACTUAL deployed DEX contracts on Avalanche
 * By checking common addresses and official deployments
 */

const { ethers } = require('ethers');

async function main() {
  console.log('🔍 Finding ACTUAL DEX Contracts on Avalanche\n');

  const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  
  // Common addresses to check
  const ADDRESSES = {
    // Uniswap V3 - try multiple known addresses
    'Uniswap V3 Router 1': '0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE',
    'Uniswap V3 Router 2': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    'Uniswap V3 Factory 1': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    'Uniswap V3 Quoter 1': '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    'Uniswap V3 Quoter 2': '0xf1d107E7687F3047887F7742E329Bd4E35025Ec2',
    
    // TraderJoe
    'TJ Router V1': '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    'TJ Router V2': '0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE', // Same as Uni?
    'TJ Factory V1': '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
    'TJ LB Router': '0xb4315e873dbcf96ffd0acd6ea047c66507581979',
    'TJ LB Factory 1': '0x5e6420766f31aa7710473b3e7feb23a3e9b5b99a',
    'TJ LB Factory 2': '0x542ba2C2e5DDc245Dd1E26739BA818bfd3d005e5',
    
    // QuickSwap (Polygon fork on AVAX)
    'QuickSwap Router': '0x974Feb2AA0ad729C2a0455907277a4E93d42AdA5',
    
    // SushiSwap
    'Sushi Router': '0x1b02dA8Cb0d097eB8D57A175b88974318F97d17B',
  };

  console.log('Checking contract existence:\n');
  
  const existingContracts = [];
  
  for (const [name, addr] of Object.entries(ADDRESSES)) {
    try {
      const code = await provider.getCode(addr);
      const exists = code.length > 2;
      console.log(`${exists ? '✅' : '❌'} ${name}: ${addr}`);
      if (exists) {
        existingContracts.push([name, addr]);
      }
    } catch (e) {
      console.log(`❌ ${name}: Error`);
    }
  }

  // Now try to identify what each router supports
  console.log('\n\n=== Testing Router Interfaces ===\n');
  
  const ROUTER_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
    "function factory() external view returns (address)",
    "function WETH() external view returns (address)"
  ];

  const WAVAX = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
  const USDC = '0xB97ef9ef8734C71904d8002F8b6Bc66Dd9c48a6E';
  const amountIn = ethers.parseEther('0.01');

  for (const [name, addr] of existingContracts) {
    console.log(`\n${name}:`);
    const router = new ethers.Contract(addr, ROUTER_ABI, provider);
    
    // Try to get factory
    try {
      const factory = await router.factory();
      console.log(`  Factory: ${factory}`);
      
      // Check if factory has code
      const factoryCode = await provider.getCode(factory);
      console.log(`  Factory has code: ${factoryCode.length > 2 ? 'YES' : 'NO'}`);
    } catch (e) {
      console.log(`  Factory: Not supported`);
    }
    
    // Try to get WETH
    try {
      const weth = await router.WETH();
      console.log(`  WETH: ${weth}`);
    } catch (e) {}
    
    // Try getAmountsOut
    try {
      const amounts = await router.getAmountsOut(amountIn, [WAVAX, USDC]);
      console.log(`  ✅ Quote: ${ethers.formatUnits(amounts[1], 6)} USDC`);
    } catch (e) {
      console.log(`  ❌ Quote failed: ${e.reason || e.message?.slice(0, 50)}`);
    }
  }
}

main().catch(console.error);