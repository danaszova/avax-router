// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ILBPair.sol";

/**
 * @title ILBRouter
 * @notice Interface for Trader Joe V2 Liquidity Book Router
 */
interface ILBRouter {
    struct LBSwapExactInParams {
        uint256 amountIn;
        uint256 amountOutMin;
        uint256[] pairBinSteps;
        IERC20[] tokenPath;
        address to;
        uint256 deadline;
    }

    struct LBSwapExactOutParams {
        uint256 amountOut;
        uint256 amountInMax;
        uint256[] pairBinSteps;
        IERC20[] tokenPath;
        address to;
        uint256 deadline;
    }

    /**
     * @notice Swaps exact tokens for tokens
     */
    function swapExactTokensForTokens(
        LBSwapExactInParams calldata params
    ) external returns (uint256 amountOut);

    /**
     * @notice Swaps tokens for exact tokens
     */
    function swapTokensForExactTokens(
        LBSwapExactOutParams calldata params
    ) external returns (uint256 amountIn);

    /**
     * @notice Get the LB pair for a token pair and bin step
     */
    function getLBPair(
        IERC20 tokenA,
        IERC20 tokenB,
        uint16 binStep
    ) external view returns (ILBPair pair);

    /**
     * @notice Get the quote for a swap
     */
    function getSwapIn(
        ILBPair lbPair,
        uint256 amountOut,
        bool swapForY
    ) external view returns (uint256 amountIn, uint256 feesIn);

    /**
     * @notice Get the quote for a swap
     */
    function getSwapOut(
        ILBPair lbPair,
        uint256 amountIn,
        bool swapForY
    ) external view returns (uint256 amountOut, uint256 feesIn);
}