// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IDexAdapter.sol";

/**
 * @title PlatypusAdapter
 * @notice Adapter for Platypus StableSwap on Avalanche
 * @dev Implements IDexAdapter for Platypus pools
 *      Platypus is optimized for stablecoin swaps with low slippage
 */
contract PlatypusAdapter is IDexAdapter {
    using SafeERC20 for IERC20;

    // Platypus Router address
    IPlatypusRouter public immutable router;
    
    // Platypus Pool address (main pool for stablecoins)
    address public immutable pool;

    /**
     * @notice Constructor
     * @param _router Platypus Router address
     * @param _pool Platypus Pool address
     */
    constructor(IPlatypusRouter _router, address _pool) {
        router = _router;
        pool = _pool;
    }

    /**
     * @notice Get the DEX name
     * @return Name of the DEX
     */
    function dexName() external pure override returns (string memory) {
        return "Platypus";
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
        // Check if both tokens are in the pool
        if (!_isTokenInPool(tokenIn) || !_isTokenInPool(tokenOut)) {
            revert("Tokens not in pool");
        }
        
        // Get quote from Platypus
        try router.quotePotentialSwap(tokenIn, tokenOut, amountIn) returns (uint256 amount) {
            return amount;
        } catch {
            revert("No valid route found");
        }
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
        
        // Execute swap via Platypus router
        amountOut = router.swap(
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            address(this), // receive to this contract first
            block.timestamp + 300
        );
        
        // Transfer output to recipient
        IERC20(tokenOut).safeTransfer(recipient, amountOut);
        
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
        return _isTokenInPool(tokenIn) && _isTokenInPool(tokenOut);
    }

    /**
     * @notice Check if token is in the Platypus pool
     * @param token Token address
     * @return Whether token is supported
     */
    function _isTokenInPool(address token) internal view returns (bool) {
        // Common stablecoins in Platypus main pool
        address USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
        address USDT = 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7;
        address DAI = 0xd586E7F844cEa2F87f50152665BCbc2C279D8d70;
        address USDC_E = 0xa7D7079b0FEAD91F3E65F86989107b8D491C2D0C;
        address USDT_E = 0xc7198437980c041c805A1EDcbA50c1Ce5db95118;
        address MIM = 0x130966628846BFd36ff31a822705796e8cb8C18D;
        
        return token == USDC || token == USDT || token == DAI || 
               token == USDC_E || token == USDT_E || token == MIM;
    }
}

/**
 * @title IPlatypusRouter
 * @notice Interface for Platypus Router
 */
interface IPlatypusRouter {
    function quotePotentialSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut);
    
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);
}