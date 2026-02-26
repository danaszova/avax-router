import { ethers } from 'ethers';

const LB_FACTORY = '0x8e5C01309f8C965313D87D09EFEaEEA815047bBa'.toLowerCase();
const LB_FACTORY_ABI = ["function getAllLBPairs(address tokenX, address tokenY) external view returns (tuple(uint256 binStep, address LBPair, bool activeX, bool activeY)[] memory LBPairs)"];

const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase();
const JOE = '0x6e84a6216ea6dacc71ee816b011979d37582d9a7'.toLowerCase();

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const factory = new ethers.Contract(LB_FACTORY, LB_FACTORY_ABI, provider);

async function main() {
    console.log('Checking TraderJoe V2 (Liquidity Book) for WAVAX-JOE...');
    try {
        const pairs = await factory.getAllLBPairs(WAVAX, JOE);
        console.log(`Found ${pairs.length} LB pairs:`);
        pairs.forEach((p: any) => console.log(` - Address: ${p.LBPair}, BinStep: ${p.binStep.toString()}`));
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
