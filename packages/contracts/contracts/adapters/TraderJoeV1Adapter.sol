// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IDexAdapter.sol";

/**
 * @title TraderJoeV1Adapter
 * @notice Adapter for Trader Joe V1 (AMM) DEX on Avalanche
 * @dev Implements IDexAdapter using UniswapV2-style interface
 */
contract TraderJoeV1Adapter is IDexAdapter {
    using SafeERC20 for IERC20;

    // Trader Joe V1 Router
    IJoeRouter public immutable router;
    
    // Trader Joe V1 Factory
    address public immutable factory;

    // Common tokens for multi-hop routing
    address public constant WAVAX = 0xb31f66Aa3C1ee3B4Dd11E3A23d8e14D7254C2d6c;

    /**
     * @notice Constructor
     * @param _router Trader Joe V1 Router address
     * @param _factory Trader Joe V1 Factory address
     */
    constructor(IJoeRouter _router, address _factory) {
        router = _router;
        factory = _factory;
    }

    /**
     * @notice Get the DEX name
     * @return Name of the DEX
     */
    function dexName() external pure override returns (string memory) {
        return "TraderJoe V1";
    }

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
    ) external view override returns (uint256 amountOut) {
        // Try direct pair first
        if (_hasPair(tokenIn, tokenOut)) {
            address[] memory path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
            uint256[] memory amounts = router.getAmountsOut(amountIn, path);
            return amounts[1];
        }
        
        // Try multi-hop through WAVAX
        if (tokenIn != WAVAX && tokenOut != WAVAX) {
            if (_hasPair(tokenIn, WAVAX) && _hasPair(WAVAX, tokenOut)) {
                address[] memory path = new address[](3);
                path[0] = tokenIn;
                path[1] = WAVAX;
                path[2] = tokenOut;
                uint256[] memory amounts = router.getAmountsOut(amountIn, path);
                return amounts[2];
            }
        }
        
        revert("No valid pair found");
    }

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
    ) external override returns (uint256 amountOut) {
        // Transfer tokens from caller
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Approve router
        IERC20(tokenIn).safeIncreaseAllowance(address(router), amountIn);
        
        // Try direct swap first
        if (_hasPair(tokenIn, tokenOut)) {
            address[] memory path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
            
            uint256[] memory amounts = router.swapExactTokensForTokens(
                amountIn,
                minAmountOut,
                path,
                recipient,
                block.timestamp + 300
            );
            return amounts[1];
        }
        
        // Multi-hop through WAVAX
        if (tokenIn != WAVAX && tokenOut != WAVAX) {
            address[] memory path = new address[](3);
            path[0] = tokenIn;
            path[1] = WAVAX;
            path[2] = tokenOut;
            
            uint256[] memory amounts = router.swapExactTokensForTokens(
                amountIn,
                minAmountOut,
                path,
                recipient,
                block.timestamp + 300
            );
            return amounts[2];
        }
        
        revert("No valid route found");
    }

    /**
     * @notice Check if a pool exists for a token pair
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @return exists Whether a pool exists
     */
    function hasPool(
        address tokenIn,
        address tokenOut
    ) external view override returns (bool) {
        return _hasPair(tokenIn, tokenOut);
    }

    /**
     * @notice Internal function to check if pair exists
     */
    function _hasPair(address tokenA, address tokenB) internal view returns (bool) {
        try IJoeFactory(factory).getPair(tokenA, tokenB) returns (address pair) {
            return pair != address(0);
        } catch {
            return false;
        }
    }
}

/**
 * @notice Trader Joe V1 Router interface
 */
interface IJoeRouter {
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts);
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
    function swapExactAVAXForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);
    function swapExactTokensForAVAX(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

/**
 * @notice Trader Joe V1 Factory interface
 */
interface IJoeFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}