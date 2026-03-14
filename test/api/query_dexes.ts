import { ethers } from 'ethers';

const DEX_ROUTER_ADDRESS = '0x3ff7faad7417130c60b7422de712ead9a7c2e3b5';
const DEX_ROUTER_ABI = ["function getRegisteredDexes() view returns (string[] memory)"];
const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

async function main() {
    const dexRouter = new ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);
    const dexes = await dexRouter.getRegisteredDexes();
    console.log('Registered DEXes:', dexes);
}

main().catch(console.error);
