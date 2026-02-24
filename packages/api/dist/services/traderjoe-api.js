"use strict";
/**
 * Direct TraderJoe API integration for quotes
 * Uses TraderJoe's official API as a fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTraderJoeQuote = getTraderJoeQuote;
exports.getPangolinQuote = getPangolinQuote;
// Mock prices for demo (AVAX = $35, USDC = $1)
// All keys must be lowercase for consistent lookup
const PRICES = {
    '0xb31f66aa3c1ee3b4dd11e3a23d8e14d7254c2d6c': 35, // AVAX
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': 1, // USDC
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': 1, // USDT
    '0x50b7545627a5162f82a992c33b87adc75187b218': 97000, // WBTC
    '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab': 2800, // WETH
};
async function getTraderJoeQuote(tokenIn, tokenOut, amountIn) {
    // Mock quote based on simple price ratio
    const priceIn = PRICES[tokenIn.toLowerCase()] || 1;
    const priceOut = PRICES[tokenOut.toLowerCase()] || 1;
    // amountIn is in wei (10^18), convert to ether units
    const amountInEther = parseFloat(amountIn) / 1e18;
    const rate = priceIn / priceOut;
    const outputWithoutSlippage = amountInEther * rate;
    const fee = outputWithoutSlippage * 0.0005; // 0.05% fee
    const outputWithSlippage = outputWithoutSlippage - fee;
    // USDC/USDT have 6 decimals, others have 18
    const isStablecoin = tokenOut.toLowerCase().includes('usdc') ||
        tokenOut.toLowerCase().includes('usdt') ||
        tokenOut.toLowerCase() === '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e' ||
        tokenOut.toLowerCase() === '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7';
    // Convert to token decimals
    const outputDecimals = isStablecoin ? 6 : 18;
    const outputInBaseUnits = Math.floor(outputWithSlippage * (10 ** outputDecimals));
    return {
        route: [tokenIn, tokenOut],
        pairs: ['pair1'],
        binSteps: [20],
        amounts: [amountIn, outputInBaseUnits.toString()],
        amountsWithoutSlippage: [amountIn, Math.floor(outputWithoutSlippage * (10 ** outputDecimals)).toString()],
        outputWithoutSlippage: Math.floor(outputWithoutSlippage * (10 ** outputDecimals)).toString(),
        outputWithSlippage: outputInBaseUnits.toString(),
        priceImpact: 0.05,
        gasCost: 150000,
    };
}
async function getPangolinQuote(tokenIn, tokenOut, amountIn) {
    // Mock quote - slightly worse rate than TraderJoe
    const priceIn = PRICES[tokenIn.toLowerCase()] || 1;
    const priceOut = PRICES[tokenOut.toLowerCase()] || 1;
    // amountIn is in wei (10^18), convert to ether units
    const amountInEther = parseFloat(amountIn) / 1e18;
    const rate = priceIn / priceOut;
    const outputWithoutSlippage = amountInEther * rate * 0.998; // Slightly worse
    const fee = outputWithoutSlippage * 0.0005;
    const outputWithSlippage = outputWithoutSlippage - fee;
    // USDC/USDT have 6 decimals
    const isStablecoin = tokenOut.toLowerCase().includes('usdc') ||
        tokenOut.toLowerCase().includes('usdt') ||
        tokenOut.toLowerCase() === '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e' ||
        tokenOut.toLowerCase() === '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7';
    const outputDecimals = isStablecoin ? 6 : 18;
    const outputInBaseUnits = Math.floor(outputWithSlippage * (10 ** outputDecimals));
    return {
        route: [tokenIn, tokenOut],
        outputWithSlippage: outputInBaseUnits.toString(),
        priceImpact: 0.08,
        gasCost: 120000,
    };
}
//# sourceMappingURL=traderjoe-api.js.map