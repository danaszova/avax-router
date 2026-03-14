// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IDexAdapter.sol";

/**
 * @title UniswapV2Adapter
 * @notice Generic adapter for Uniswap V2 style DEXes on Avalanche
 * @dev Can be deployed with different router/factory addresses for different DEXes
 *      Supports: TraderJoe V1, SushiSwap, Lydia, YetiSwap, and any V2 fork
 */
contract UniswapV2Adapter is IDexAdapter {
    using SafeERC20 for IERC20;

    // Router address
    IUniswapV2Router public immutable router;
    
    // Factory address
    address public immutable factory;

    // DEX name (set at deployment)
    string private _dexName;

    // Common tokens for multi-hop routing
    // CORRECT WAVAX address that has liquidity on TraderJoe V1
    address public constant WAVAX = 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7;
    address public constant USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address public constant USDT = 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7;

    /**
     * @notice Constructor
     * @param _router DEX Router address
     * @param _factory DEX Factory address
     * @param _name Human-readable name for this DEX
     */
    constructor(IUniswapV2Router _router, address _factory, string memory _name) {
        router = _router;
        factory = _factory;
        _dexName = _name;
    }

    /**
     * @notice Get the DEX name
     * @return Name of the DEX
     */
    function dexName() external view override returns (string memory) {
        return _dexName;
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
        if (_getPair(tokenIn, tokenOut) != address(0)) {
            address[] memory path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
            
            try router.getAmountsOut(amountIn, path) returns (uint256[] memory amounts) {
                return amounts[1];
            } catch {}
        }
        
        // Try multi-hop through WAVAX
        if (tokenIn != WAVAX && tokenOut != WAVAX) {
            address[] memory path = new address[](3);
            path[0] = tokenIn;
            path[1] = WAVAX;
            path[2] = tokenOut;
            
            try router.getAmountsOut(amountIn, path) returns (uint256[] memory amounts) {
                return amounts[2];
            } catch {}
        }
        
        // Try multi-hop through USDC
        if (tokenIn != USDC && tokenOut != USDC) {
            address[] memory path = new address[](3);
            path[0] = tokenIn;
            path[1] = USDC;
            path[2] = tokenOut;
            
            try router.getAmountsOut(amountIn, path) returns (uint256[] memory amounts) {
                return amounts[2];
            } catch {}
        }
        
        revert("No valid route found");
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
        
        uint256[] memory amounts;
        
        // Try direct swap first
        if (_getPair(tokenIn, tokenOut) != address(0)) {
            address[] memory path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;
            
            amounts = router.swapExactTokensForTokens(
                amountIn,
                minAmountOut,
                path,
                recipient,
                block.timestamp + 300
            );
        } else {
            // Try multi-hop through WAVAX
            if (_getPair(tokenIn, WAVAX) != address(0) && _getPair(WAVAX, tokenOut) != address(0)) {
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
            } else {
                // Try multi-hop through USDC
                address[] memory path = new address[](3);
                path[0] = tokenIn;
                path[1] = USDC;
                path[2] = tokenOut;
                
                amounts = router.swapExactTokensForTokens(
                    amountIn,
                    minAmountOut,
                    path,
                    recipient,
                    block.timestamp + 300
                );
            }
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
        return IUniswapV2Factory(factory).getPair(tokenA, tokenB);
    }
}

/**
 * @title IUniswapV2Router
 * @notice Interface for Uniswap V2 style routers
 */
interface IUniswapV2Router {
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts);
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

/**
 * @title IUniswapV2Factory
 * @notice Interface for Uniswap V2 style factories
 */
interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address);
}