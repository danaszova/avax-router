const { ethers } = require('ethers');

// Avalanche mainnet RPC
const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

// Contract addresses
const DEX_ROUTER = '0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5';

// Token addresses on Avalanche
const TOKENS = {
  WAVAX: { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', decimals: 18, symbol: 'WAVAX' },
  USDC: { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, symbol: 'USDC' },
  USDT: { address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6, symbol: 'USDT' },
  DAI: { address: '0xd586E7F844CeA2F87f50152665BCbc2C279D8D70', decimals: 18, symbol: 'DAI' },
  WETH: { address: '0x49d5c2bdFFac6Ce2BFdb6640F4f80f226bc10baB', decimals: 18, symbol: 'WETH' },
  WBTC: { address: '0x50b7545627a5162f82a992c33b87adc75187b218', decimals: 8, symbol: 'WBTC' },
};

// ERC20 ABI - just balanceOf
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)'];

async function checkBalances() {
  console.log('='.repeat(60));
  console.log('DEX Router Fee Balances');
  console.log('Contract:', DEX_ROUTER);
  console.log('='.repeat(60));
  console.log('');
  
  let totalValue = 0;
  
  for (const [name, token] of Object.entries(TOKENS)) {
    try {
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(DEX_ROUTER);
      
      if (balance > 0n) {
        const formatted = ethers.formatUnits(balance, token.decimals);
        console.log(`${token.symbol}: ${formatted}`);
        console.log(`  Address: ${token.address}`);
        console.log('');
      }
    } catch (error) {
      console.log(`${token.symbol}: Error fetching balance`);
      console.log(`  ${error.message}`);
      console.log('');
    }
  }
  
  // Also check native AVAX balance
  try {
    const avaxBalance = await provider.getBalance(DEX_ROUTER);
    if (avaxBalance > 0n) {
      console.log(`Native AVAX: ${ethers.formatEther(avaxBalance)}`);
      console.log('  (Note: Contract should not hold native AVAX normally)');
      console.log('');
    }
  } catch (error) {
    console.log('Native AVAX: Error fetching balance');
  }
  
  console.log('='.repeat(60));
  console.log('To withdraw fees, call withdrawFees(token, amount, recipient)');
  console.log('Example with cast:');
  console.log(`cast send ${DEX_ROUTER} "withdrawFees(address,uint256,address)" <TOKEN> <AMOUNT> <YOUR_ADDRESS> --rpc-url https://api.avax.network/ext/bc/C/rpc --private-key <YOUR_KEY>`);
  console.log('='.repeat(60));
}

checkBalances().catch(console.error);