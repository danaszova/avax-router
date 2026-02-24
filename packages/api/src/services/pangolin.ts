import { ethers } from 'ethers';
import { TOKENS, getTokenDecimals } from './dex-apis';

// Pangolin Router on Avalanche Mainnet
const PANGOLIN_ROUTER = '0xE54Ca86531e17Ef3616d11Ca5b4d259Fa0d24756';

const ROUTER_ABI = [
    'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)',
];

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const pangolinRouter = new ethers.Contract(PANGOLIN_ROUTER, ROUTER_ABI, provider);

export async function getPangolinDirectQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
): Promise<{ dex: string; amountOut: bigint; amountOutFormatted: number } | null> {
    try {
        const path = [ethers.getAddress(tokenIn), ethers.getAddress(tokenOut)];
        const amounts = await pangolinRouter.getAmountsOut(amountIn, path);
        const amountOut = amounts[1] as bigint;
        const outDecimals = getTokenDecimals(tokenOut);

        return {
            dex: 'Pangolin',
            amountOut,
            amountOutFormatted: Number(amountOut) / Math.pow(10, outDecimals),
        };
    } catch {
        return null;
    }
}
