import { ethers } from 'ethers';

const TJ_FACTORY_ADDRESS = '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10';
const TJ_FACTORY_ABI = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];

const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase();
const JOE = '0x6e84a6216ea6dacc71ee816b011979d37582d9a7'.toLowerCase();
const QI = '0x8729438eb15e2c8b5f8f9c5315351e3cfb0ae6e1'.toLowerCase();
const LINK = '0x5947bb275c513d93f485c74438d763fab75019ed'.toLowerCase();
const USDT_e = '0xc7198437980c041c805a1edcba50c1ce5db95118'.toLowerCase();
const USDC_e = '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664'.toLowerCase();

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const factory = new ethers.Contract(TJ_FACTORY_ADDRESS, TJ_FACTORY_ABI, provider);

async function checkPair(nameA: string, addrA: string, nameB: string, addrB: string) {
    try {
        const pair = await factory.getPair(addrA, addrB);
        console.log(`Pair ${nameA}-${nameB}: ${pair}`);
    } catch(e: any) {
        console.log(`Pair ${nameA}-${nameB} ERROR: ${e.message}`);
    }
}

async function main() {
    await checkPair('WAVAX', WAVAX, 'JOE', JOE);
    await checkPair('WAVAX', WAVAX, 'QI', QI);
    await checkPair('WAVAX', WAVAX, 'LINK', LINK);
    await checkPair('WAVAX', WAVAX, 'USDT.e', USDT_e);
    await checkPair('WAVAX', WAVAX, 'USDC.e', USDC_e);
}

main().catch(console.error);
