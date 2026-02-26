import { ethers } from 'ethers';

// Try looking for the pair on the Factory that Pangolin uses (Common UniswapV2 fork)
const FACTORIES = [
    { name: 'TraderJoe', address: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10' },
    { name: 'Pangolin', address: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' },
    { name: 'SushiSwap', address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' }
];

const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'.toLowerCase();
const JOE = '0x6e84a6216ea6dacc71ee816b011979d37582d9a7'.toLowerCase();

const ABI = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];
const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

async function main() {
    for (const f of FACTORIES) {
        const contract = new ethers.Contract(f.address, ABI, provider);
        try {
            const pair = await contract.getPair(WAVAX, JOE);
            console.log(`${f.name} Factory -> WAVAX-JOE Pair: ${pair}`);
        } catch {
            console.log(`${f.name} failed`);
        }
    }
}

main().catch(console.error);
