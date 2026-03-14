import { ethers } from 'ethers';

const DEX_ROUTER_ADDRESS = '0x3ff7faad7417130c60b7422de712ead9a7c2e3b5';
const DEX_ROUTER_ABI = [
  "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) view returns (string memory bestDex, uint256 bestAmountOut)",
  "function getRegisteredDexes() view returns (string[] memory)"
];

const TOKENS: Record<string, string> = {
  AVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase(),
  JOE: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd'.toLowerCase(),
  QI: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5'.toLowerCase(),
  LINK: '0x5947bb275c521040051d82396192181b413227a3'.toLowerCase(),
  GMX: '0x62edc0692BD897D2295872a9FFCac5425011c661'.toLowerCase(),
  USDC: '0xB97EF9Ef8734C71904D8002F8b6bc66Dd9c48a6E'.toLowerCase()
};

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const dexRouter = new ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);

async function testQuote(symbolIn: string, symbolOut: string, amount: string) {
    console.log(`Testing ${amount} ${symbolIn} -> ${symbolOut}...`);
    try {
        const addrIn = TOKENS[symbolIn];
        const addrOut = TOKENS[symbolOut];
        const amountIn = ethers.parseEther(amount);
        
        const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(addrIn, addrOut, amountIn);
        const outDecimals = symbolOut === 'USDC' ? 6 : 18;
        console.log(`  ✅ SUCCESS: ${bestDex} provides ${ethers.formatUnits(bestAmountOut, outDecimals)} ${symbolOut}`);
    } catch (e: any) {
        console.log(`  ❌ FAILED: ${e.message}`);
    }
}

async function main() {
    console.log('--- ROUTER QUOTE TESTER ---');
    const dexes = await dexRouter.getRegisteredDexes();
    console.log('Registered Dexes:', dexes);
    
    await testQuote('AVAX', 'JOE', '1.0');
    await testQuote('AVAX', 'USDC', '1.0');
    await testQuote('JOE', 'AVAX', '10.0');
    await testQuote('QI', 'USDC', '100.0');
}

main().catch(console.error);
