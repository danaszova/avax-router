/**
 * Multi-hop routing service
 *
 * The deployed TraderJoeV1Adapter has the WRONG WAVAX address hardcoded, so its
 * multi-hop path (tokenIn → WAVAX → tokenOut) always fails on-chain.
 *
 * This service bypasses the adapter and queries the TJ V1 Router directly
 * for any path, including multi-hop paths through WAVAX.
 */

import { ethers } from 'ethers';
import { TOKENS, getTokenDecimals } from './dex-apis';

// TraderJoe V1 Router on Avalanche Mainnet
const TJ_V1_ROUTER = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4';

// TraderJoe V1 Factory on Avalanche Mainnet
const TJ_V1_FACTORY = '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10';

const ROUTER_ABI = [
    'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)',
];

const FACTORY_ABI = [
    'function getPair(address tokenA, address tokenB) external view returns (address pair)',
];

const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
const tjRouter = new ethers.Contract(TJ_V1_ROUTER, ROUTER_ABI, provider);
const tjFactory = new ethers.Contract(TJ_V1_FACTORY, FACTORY_ABI, provider);

// The correct WAVAX address with actual liquidity on TJ V1
const WAVAX = TOKENS.WAVAX; // lowercase

export interface MultiHopQuote {
    dex: string;
    amountOut: bigint;
    amountOutFormatted: number;
    route: string[];
    hops: number;
    priceImpact: number;
    estimatedGas: bigint;
}

/**
 * Check if a liquidity pair exists on TJ V1
 */
async function hasPair(tokenA: string, tokenB: string): Promise<boolean> {
    try {
        const pair = await tjFactory.getPair(
            ethers.getAddress(tokenA),
            ethers.getAddress(tokenB)
        );
        return pair !== ethers.ZeroAddress;
    } catch {
        return false;
    }
}

/**
 * Get a direct (1-hop) quote from TJ V1 Router
 */
async function getDirectQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
): Promise<bigint | null> {
    try {
        const path = [ethers.getAddress(tokenIn), ethers.getAddress(tokenOut)];
        const amounts = await tjRouter.getAmountsOut(amountIn, path);
        return amounts[1] as bigint;
    } catch {
        return null;
    }
}

/**
 * Get a 2-hop quote from TJ V1 Router via an intermediate token
 */
async function getHopQuote(
    tokenIn: string,
    intermediate: string,
    tokenOut: string,
    amountIn: bigint
): Promise<bigint | null> {
    try {
        const path = [
            ethers.getAddress(tokenIn),
            ethers.getAddress(intermediate),
            ethers.getAddress(tokenOut),
        ];
        const amounts = await tjRouter.getAmountsOut(amountIn, path);
        return amounts[2] as bigint;
    } catch {
        return null;
    }
}

/**
 * Find the best quote for a token pair using TJ V1 Router directly.
 * Tries: direct, WAVAX hop, USDC hop, USDT hop.
 */
export async function getMultiHopBestQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
): Promise<MultiHopQuote> {
    const tokenInLower = tokenIn.toLowerCase();
    const tokenOutLower = tokenOut.toLowerCase();
    const outDecimals = getTokenDecimals(tokenOutLower);

    // Candidate routes to try
    const routeCandidates: { label: string; path: string[] }[] = [
        // Direct
        { label: 'direct', path: [tokenInLower, tokenOutLower] },
        // Via WAVAX
        { label: 'via WAVAX', path: [tokenInLower, WAVAX, tokenOutLower] },
        // Via USDC
        { label: 'via USDC', path: [tokenInLower, TOKENS.USDC, tokenOutLower] },
        // Via USDT
        { label: 'via USDT', path: [tokenInLower, TOKENS.USDT, tokenOutLower] },
    ];

    let bestAmount: bigint = 0n;
    let bestPath: string[] = [];
    let bestLabel = '';

    for (const candidate of routeCandidates) {
        const { path, label } = candidate;

        // Skip routes where tokenIn or tokenOut is also the intermediate
        if (new Set(path).size !== path.length) continue;

        try {
            const checksummedPath = path.map(a => ethers.getAddress(a));
            const amounts: bigint[] = await tjRouter.getAmountsOut(amountIn, checksummedPath);
            const amountOut = amounts[amounts.length - 1];

            if (amountOut > bestAmount) {
                bestAmount = amountOut;
                bestPath = checksummedPath;
                bestLabel = label;
            }
        } catch {
            // This path doesn't have liquidity, skip silently
        }
    }

    if (bestAmount === 0n) {
        throw new Error('No valid route found on TraderJoe V1 (direct or multi-hop)');
    }

    return {
        dex: 'TraderJoeV1',
        amountOut: bestAmount,
        amountOutFormatted: Number(bestAmount) / Math.pow(10, outDecimals),
        route: bestPath,
        hops: bestPath.length - 1,
        priceImpact: 0.05,
        estimatedGas: bestPath.length === 2 ? BigInt(120000) : BigInt(180000),
    };
}
