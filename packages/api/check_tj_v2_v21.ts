import { ethers } from 'ethers';

// Try looking for JOE on V2 Liquidity Book instead
const LB_FACTORY_V2 = '0x8e5C01309f8C965313D87D09EFEaEEA815047bBa'.toLowerCase();
const LB_ROUTER_V2 = '0xb4315e873dbcf96ffd0acd6ea047c66507581979'.toLowerCase();

const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
const JOE = '0x6e84a6216ea6dacc71ee816b011979d37582d9a7';

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

async function main() {
    console.log('Test LB Route...');
    const LB_ROUTER_ABI = ["function getPrice(address,address) view returns (uint256)"];
    // Wait, the router doesn't have a simple getPrice. 
    // Let's just check the bytecode again for standard V2 addresses.
    const V2_ROUTER = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4';
    const code = await provider.getCode(V2_ROUTER);
    console.log('Router code found:', code.length > 2);
}

main().catch(console.error);
