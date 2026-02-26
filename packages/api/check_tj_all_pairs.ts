import { ethers } from 'ethers';

const TJ_FACTORY = '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10';
const ABI = ["function allPairs(uint256) view returns (address)", "function allPairsLength() view returns (uint256)"];

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

async function main() {
    const factory = new ethers.Contract(TJ_FACTORY, ABI, provider);
    const length = await factory.allPairsLength();
    console.log('Total pairs in TJ V1:', length.toString());
    
    // Check the last 5 pairs to see if they are active
    for (let i = Number(length) - 1; i >= Number(length) - 5; i--) {
        const pair = await factory.allPairs(i);
        console.log(`Pair ${i}: ${pair}`);
    }
}

main().catch(console.error);
