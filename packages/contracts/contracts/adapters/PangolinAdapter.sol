// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IDexAdapter.sol";
import "../interfaces/pangolin/IPangolinRouter.sol";
import "../interfaces/pangolin/IPangolinPair.sol";

/**
 * @title PangolinAdapter
 * @notice Adapter for Pangolin DEX (Uniswap V2 fork) on Avalanche
 * @dev Implements IDexAdapter for Pangolin
 */
contract PangolinAdapter is IDexAdapter {
    using SafeERC20 for IERC20;

    // Pangolin Router address on Avalanche
    IPangolinRouter public immutable router;
    
    // Pangolin Factory address
    address public immutable factory;

    // Common tokens for multi-hop routing
    address public constant WAVAX = 0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C;
    address public constant USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address public constant USDT = 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7;

    /**
     * @notice Constructor
     * @param _router Pangolin Router address
     * @param _factory Pangolin Factory address
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
        return "Pangolin";
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
        address pair = _getPair(tokenIn, tokenOut);
        
        if (pair != address(0)) {
            return router.getAmountsOut(amountIn, _getPath(tokenIn, tokenOut))[1];
        }
        
        // Try multi-hop through WAVAX
        if (tokenIn != WAVAX && tokenOut != WAVAX) {
            address[] memory path = new address[](3);
            path[0] = tokenIn;
            path[1] = WAVAX;
            path[2] = tokenOut;
            
            try router.getAmountsOut(amountIn, path) returns (uint256[] memory amounts) {
                return amounts[2];
            } catch {
                revert("No valid route found");
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
        address pair = _getPair(tokenIn, tokenOut);
        
        uint256[] memory amounts;
        
        if (pair != address(0)) {
            address[] memory path = _getPath(tokenIn, tokenOut);
            amounts = router.swapExactTokensForTokens(
                amountIn,
                minAmountOut,
                path,
                recipient,
                block.timestamp + 300
            );
        } else {
            // Multi-hop through WAVAX
            address[] memory path = new address[](3);
            path[0] = tokenIn;
            path[1] = WAVAX;
            path[2] = tokenOut;
            
            amounts = router.swapExactTokensForTokens(
                amountIn,
                minAmountOut,
                path,
                recipient,
                block.timestamp + 300
            );
        }
        
        amountOut = amounts[amounts.length - 1];
        require(amountOut >= minAmountOut, "Slippage exceeded");
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
        return _getPair(tokenIn, tokenOut) != address(0);
    }

    /**
     * @notice Get pair address for token pair
     * @param tokenA First token
     * @param tokenB Second token
     * @return pair The pair address
     */
    function _getPair(address tokenA, address tokenB) internal view returns (address) {
        return IPangolinFactory(factory).getPair(tokenA, tokenB);
    }

    /**
     * @notice Get swap path for direct swap
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @return path The swap path
     */
    function _getPath(
        address tokenIn,
        address tokenOut
    ) internal pure returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        return path;
    }
}

/**
 * @title IPangolinFactory
 * @notice Interface for Pangolin Factory
 */
interface IPangolinFactory {
    function getPair(address tokenA, address tokenB) external view returns (address);
}