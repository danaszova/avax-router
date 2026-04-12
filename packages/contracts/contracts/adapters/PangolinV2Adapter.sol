// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IDexAdapter.sol";

/**
 * @title PangolinV2Adapter
 * @notice Adapter for Pangolin DEX (Uniswap V2 fork) on Avalanche
 * @dev Uses official Pangolin V2 router and factory addresses
 * 
 * Addresses sourced from official Pangolin SDK:
 * https://github.com/pangolindex/sdk/blob/master/src/chains.ts
 * 
 * Router:  0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106
 * Factory: 0xefa94DE7a4656D787667C749f7E1223D71E9FD88
 */
contract PangolinV2Adapter is IDexAdapter {
    using SafeERC20 for IERC20;

    // Pangolin V2 Router
    IPangolinRouter public immutable router;
    
    // Pangolin V2 Factory
    address public immutable factory;

    // Official WAVAX address on Avalanche
    address public constant WAVAX = 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7;

    /**
     * @notice Constructor
     * @param _router Pangolin V2 Router address
     * @param _factory Pangolin V2 Factory address
     */
    constructor(IPangolinRouter _router, address _factory) {
        router = _router;
        factory = _factory;
    }

    /**
     * @notice Get the DEX name
     * @return Name of the DEX
     */
    function dexName() external pure override returns (string memory) {
        return "Pangolin V2";
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
        try IPangolinFactory(factory).getPair(tokenA, tokenB) returns (address pair) {
            return pair != address(0);
        } catch {
            return false;
        }
    }
}

/**
 * @notice Pangolin V2 Router interface (Uniswap V2 compatible)
 */
interface IPangolinRouter {
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
 * @notice Pangolin V2 Factory interface (Uniswap V2 compatible)
 */
interface IPangolinFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}