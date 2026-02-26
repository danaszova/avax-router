import { ethers } from 'ethers';

const JOE_ROUTER_ADDRESS = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4';
const JOE_ROUTER_ABI = ["function factory() external view returns (address)"];

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

async function main() {
    const router = new ethers.Contract(JOE_ROUTER_ADDRESS, JOE_ROUTER_ABI, provider);
    const factory = await router.factory();
    console.log('Actual TraderJoe V1 Factory:', factory);
}

main().catch(console.error);
