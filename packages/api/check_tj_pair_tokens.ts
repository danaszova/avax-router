import { ethers } from 'ethers';

// Try the standard address for JOE from Avalanche bridge
const JOE_BRIDGE = '0x6e84a6216ea6dacc71ee816b011979d37582d9a7';
const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');

async function main() {
    const code = await provider.getCode(JOE_BRIDGE);
    console.log('JOE code length:', code.length);
}

main().catch(console.error);
