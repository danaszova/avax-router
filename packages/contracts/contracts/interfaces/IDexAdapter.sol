// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDexAdapter
 * @notice Interface for DEX adapter contracts
 * @dev All DEX adapters must implement this interface to be compatible with DexRouter
 */
interface IDexAdapter {
    /**
     * @notice Get the expected output amount for a swap
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @return amountOut Expected output amount
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut);

    /**
     * @notice Execute a swap
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum output amount (slippage protection)
     * @param recipient Address to receive the output tokens
     * @return amountOut Actual output amount
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external returns (uint256 amountOut);

    /**
     * @notice Get the DEX name
     * @return Name of the DEX this adapter interfaces with
     */
    function dexName() external view returns (string memory);

    /**
     * @notice Check if a pool exists for a token pair
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @return exists Whether a pool exists
     */
    function hasPool(
        address tokenIn,
        address tokenOut
    ) external view returns (bool exists);
}