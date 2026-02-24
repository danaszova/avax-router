// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ILBPair
 * @notice Interface for Trader Joe V2 Liquidity Book Pair
 */
interface ILBPair {
    /**
     * @notice Returns the token X of the pair
     */
    function getTokenX() external view returns (IERC20);

    /**
     * @notice Returns the token Y of the pair
     */
    function getTokenY() external view returns (IERC20);

    /**
     * @notice Returns the bin step (basis points between bins)
     */
    function getBinStep() external view returns (uint16);

    /**
     * @notice Returns the active bin ID
     */
    function getActiveId() external view returns (uint24);

    /**
     * @notice Returns the reserves for each token
     */
    function getReserves() external view returns (uint128 reserveX, uint128 reserveY);

    /**
     * @notice Get the swap in amount for a given output
     */
    function getSwapIn(
        IERC20 tokenIn,
        uint256 amountOut
    ) external view returns (uint256 amountIn, uint256 feesIn, uint256 feesOutOfBin);

    /**
     * @notice Get the swap out amount for a given input
     */
    function getSwapOut(
        IERC20 tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 feesIn, uint256 feesOutOfBin);

    /**
     * @notice Swaps tokens based on the parameters
     */
    function swap(
        bool swapForY,
        address to
    ) external returns (bytes32[] memory swapDebris, uint256 amountIn, uint256 amountOut);
}