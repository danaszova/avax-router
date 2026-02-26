import { ethers } from 'ethers';

const TJ_FACTORY_ADDRESS = '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10';
const TJ_FACTORY_ABI = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];

const TOKENS: Record<string, string> = {
  WAVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase(),
  JOE: '0x6e84a6216eA6dACC71eE816b011979d37582D9a7'.toLowerCase(),
  QI: '0x8729438EB15e2C8B5f8f9C5315351e3Cfb0ae6e1'.toLowerCase(),
  LINK: '0x5947BB275c513d93f485c74438d763fab75019eD'.toLowerCase(),
  GMX: '0x62edc0617b9b0A8A5d97ff9C3C9C5f647A8b6a1C'.toLowerCase(),
  USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'.toLowerCase()
};

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const factory = new ethers.Contract(TJ_FACTORY_ADDRESS, TJ_FACTORY_ABI, provider);

async function checkPair(a: string, b: string) {
    const pair = await factory.getPair(TOKENS[a], TOKENS[b]);
    console.log(`Pair ${a}-${b}: ${pair}`);
}

async function main() {
    await checkPair('WAVAX', 'JOE');
    await checkPair('WAVAX', 'QI');
    await checkPair('WAVAX', 'LINK');
    await checkPair('WAVAX', 'GMX');
    await checkPair('WAVAX', 'USDC');
}

main().catch(console.error);
