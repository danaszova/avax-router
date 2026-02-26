import { ethers } from 'ethers';

const LB_FACTORY = '0x8e5C01309f8C965313D87D09EFEaEEA815047bBa'.toLowerCase();
const LB_FACTORY_ABI = ["function getLBPairInformation(address tokenX, address tokenY, uint256 binStep) external view returns (tuple(uint16 binStep, address LBPair, bool activeX, bool activeY))"];

const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase();
const JOE = '0x6e84a6216ea6dacc71ee816b011979d37582d9a7'.toLowerCase();

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const factory = new ethers.Contract(LB_FACTORY, LB_FACTORY_ABI, provider);

async function main() {
    console.log('Checking TraderJoe V2 binStep 20 for WAVAX-JOE...');
    try {
        const info = await factory.getLBPairInformation(WAVAX, JOE, 20);
        console.log('LBPair Address:', info.LBPair);
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
