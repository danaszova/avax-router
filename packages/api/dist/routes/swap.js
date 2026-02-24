"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapRouter = void 0;
const express_1 = require("express");
const ethers_1 = require("ethers");
const router_1 = require("../services/router");
const dex_apis_1 = require("../services/dex-apis");
const logger_1 = require("../utils/logger");
// Convert token symbol or address to checksummed address
function resolveToken(token) {
    if (token.startsWith('0x')) {
        try {
            return ethers_1.ethers.getAddress(token);
        }
        catch {
            return ethers_1.ethers.getAddress(token.toLowerCase());
        }
    }
    return (0, dex_apis_1.getTokenAddress)(token);
}
exports.SwapRouter = (0, express_1.Router)();
const routerService = new router_1.RouterService();
// DexRouter contract address
const DEX_ROUTER_ADDRESS = '0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5';
// DexRouter ABI for swap functions
const DEX_ROUTER_ABI = [
    "function swapBestRoute(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient) external returns (uint256 amountOut)",
    "function swapOnDex(string calldata dexName, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient) external returns (uint256 amountOut)",
    "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) external view returns (string memory bestDex, uint256 bestAmountOut)"
];
// ERC20 ABI for approval
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)"
];
/**
 * @route GET /api/v1/swap/prepare
 * @description Prepare a swap transaction for the user's wallet to sign
 * @query tokenIn - Input token symbol or address
 * @query tokenOut - Output token symbol or address
 * @query amountIn - Input amount (in token units, e.g. "0.1")
 * @query slippage - Slippage tolerance in percent (default: 0.5)
 */
exports.SwapRouter.get('/prepare', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn, slippage = '0.5' } = req.query;
        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['tokenIn', 'tokenOut', 'amountIn']
            });
        }
        // Resolve token addresses
        const tokenInAddress = resolveToken(tokenIn);
        const tokenOutAddress = resolveToken(tokenOut);
        // Get provider to read token decimals
        const provider = new ethers_1.ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
        const tokenInContract = new ethers_1.ethers.Contract(tokenInAddress, ERC20_ABI, provider);
        const tokenOutContract = new ethers_1.ethers.Contract(tokenOutAddress, ERC20_ABI, provider);
        const decimalsIn = await tokenInContract.decimals();
        const decimalsOut = await tokenOutContract.decimals();
        const symbolIn = await tokenInContract.symbol();
        const symbolOut = await tokenOutContract.symbol();
        // Convert amount to wei
        const amountInWei = ethers_1.ethers.parseUnits(amountIn, decimalsIn);
        // Get quote for expected output
        const bestRoute = await routerService.findBestRoute(tokenInAddress, tokenOutAddress, amountInWei);
        // Calculate minimum output with slippage
        const slippagePercent = parseFloat(slippage);
        const slippageBps = Math.floor(slippagePercent * 100);
        const minAmountOut = (bestRoute.amountOut * BigInt(10000 - slippageBps)) / BigInt(10000);
        // Use zero address as placeholder - frontend should replace with user's address
        const PLACEHOLDER_RECIPIENT = '0x0000000000000000000000000000000000000000';
        // Encode the swap transaction data
        const dexRouter = new ethers_1.ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);
        const swapData = dexRouter.interface.encodeFunctionData('swapBestRoute', [
            tokenInAddress,
            tokenOutAddress,
            amountInWei,
            minAmountOut,
            PLACEHOLDER_RECIPIENT
        ]);
        // Encode approval data (for tokenIn)
        const approveData = new ethers_1.ethers.Contract(tokenInAddress, ERC20_ABI, provider)
            .interface.encodeFunctionData('approve', [DEX_ROUTER_ADDRESS, amountInWei]);
        res.json({
            // Quote info
            quote: {
                tokenIn: symbolIn,
                tokenOut: symbolOut,
                amountIn: amountIn,
                expectedOutput: ethers_1.ethers.formatUnits(bestRoute.amountOut, decimalsOut),
                minimumOutput: ethers_1.ethers.formatUnits(minAmountOut, decimalsOut),
                bestDex: bestRoute.dex,
                priceImpact: bestRoute.priceImpact,
                slippage: `${slippagePercent}%`,
            },
            // Token addresses
            tokens: {
                tokenIn: tokenInAddress,
                tokenOut: tokenOutAddress,
            },
            // Amounts in wei
            amounts: {
                amountIn: amountInWei.toString(),
                minAmountOut: minAmountOut.toString(),
            },
            // Transaction data for frontend to use
            tx: {
                // Step 1: Approve token spending (if needed)
                approve: {
                    to: tokenInAddress,
                    data: approveData,
                    value: '0',
                },
                // Step 2: Execute swap
                swap: {
                    to: DEX_ROUTER_ADDRESS,
                    data: swapData,
                    value: '0',
                    gasLimit: '300000', // Estimated
                },
            },
            // Contract addresses
            contracts: {
                dexRouter: DEX_ROUTER_ADDRESS,
            },
            timestamp: Date.now()
        });
    }
    catch (error) {
        logger_1.logger.error('Prepare swap error:', error);
        res.status(500).json({
            error: 'Failed to prepare swap',
            message: error.message
        });
    }
});
/**
 * @route GET /api/v1/swap/approve-check
 * @description Check if approval is needed for a swap
 * @query tokenIn - Input token address
 * @query amountIn - Input amount in wei
 * @query userAddress - User's wallet address
 */
exports.SwapRouter.get('/approve-check', async (req, res) => {
    try {
        const { tokenIn, amountIn, userAddress } = req.query;
        if (!tokenIn || !amountIn || !userAddress) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['tokenIn', 'amountIn', 'userAddress']
            });
        }
        const provider = new ethers_1.ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
        const tokenContract = new ethers_1.ethers.Contract(tokenIn, ERC20_ABI, provider);
        const allowance = await tokenContract.allowiance(userAddress, DEX_ROUTER_ADDRESS);
        const amountInBN = BigInt(amountIn);
        const needsApproval = allowance < amountInBN;
        res.json({
            needsApproval,
            currentAllowance: allowance.toString(),
            requiredAmount: amountIn,
            tokenAddress: tokenIn,
            spenderAddress: DEX_ROUTER_ADDRESS,
        });
    }
    catch (error) {
        logger_1.logger.error('Approve check error:', error);
        res.status(500).json({
            error: 'Failed to check approval',
            message: error.message
        });
    }
});
/**
 * @route GET /api/v1/swap/tx/:type
 * @description Get transaction data for approve or swap
 * @param type - "approve" or "swap"
 * @query tokenIn - Input token symbol/address
 * @query tokenOut - Output token symbol/address (for swap)
 * @query amountIn - Input amount
 * @query userAddress - User's wallet address
 * @query slippage - Slippage tolerance (default: 0.5)
 */
exports.SwapRouter.get('/tx/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { tokenIn, tokenOut, amountIn, userAddress, slippage = '0.5' } = req.query;
        if (!tokenIn || !amountIn || !userAddress) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['tokenIn', 'amountIn', 'userAddress']
            });
        }
        const tokenInAddress = resolveToken(tokenIn);
        const provider = new ethers_1.ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
        if (type === 'approve') {
            // Get token decimals
            const tokenContract = new ethers_1.ethers.Contract(tokenInAddress, ERC20_ABI, provider);
            const decimals = await tokenContract.decimals();
            const amountInWei = ethers_1.ethers.parseUnits(amountIn, decimals);
            // Encode approval
            const approveData = new ethers_1.ethers.Contract(tokenInAddress, ERC20_ABI, provider)
                .interface.encodeFunctionData('approve', [DEX_ROUTER_ADDRESS, amountInWei]);
            return res.json({
                to: tokenInAddress,
                from: userAddress,
                data: approveData,
                value: '0',
                gasLimit: '60000',
            });
        }
        if (type === 'swap') {
            if (!tokenOut) {
                return res.status(400).json({
                    error: 'Missing tokenOut for swap transaction'
                });
            }
            const tokenOutAddress = resolveToken(tokenOut);
            // Get decimals
            const tokenInContract = new ethers_1.ethers.Contract(tokenInAddress, ERC20_ABI, provider);
            const tokenOutContract = new ethers_1.ethers.Contract(tokenOutAddress, ERC20_ABI, provider);
            const decimalsIn = await tokenInContract.decimals();
            const decimalsOut = await tokenOutContract.decimals();
            const amountInWei = ethers_1.ethers.parseUnits(amountIn, decimalsIn);
            // Get quote
            const bestRoute = await routerService.findBestRoute(tokenInAddress, tokenOutAddress, amountInWei);
            // Calculate min output with slippage
            const slippagePercent = parseFloat(slippage);
            const slippageBps = Math.floor(slippagePercent * 100);
            const minAmountOut = (bestRoute.amountOut * BigInt(10000 - slippageBps)) / BigInt(10000);
            // Encode swap
            const dexRouter = new ethers_1.ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);
            const swapData = dexRouter.interface.encodeFunctionData('swapBestRoute', [
                tokenInAddress,
                tokenOutAddress,
                amountInWei,
                minAmountOut,
                userAddress,
            ]);
            return res.json({
                to: DEX_ROUTER_ADDRESS,
                from: userAddress,
                data: swapData,
                value: '0',
                gasLimit: '300000',
                expectedOutput: ethers_1.ethers.formatUnits(bestRoute.amountOut, decimalsOut),
                minimumOutput: ethers_1.ethers.formatUnits(minAmountOut, decimalsOut),
                bestDex: bestRoute.dex,
            });
        }
        return res.status(400).json({
            error: 'Invalid transaction type',
            validTypes: ['approve', 'swap']
        });
    }
    catch (error) {
        logger_1.logger.error('Get tx error:', error);
        res.status(500).json({
            error: 'Failed to get transaction',
            message: error.message
        });
    }
});
//# sourceMappingURL=swap.js.map