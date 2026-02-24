// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IDexAdapter.sol";
import "./libraries/RouteLib.sol";

/**
 * @title DexRouter
 * @author Avalanche DEX Router Team
 * @notice Main entry point for routing swaps across multiple DEXes on Avalanche
 * @dev Routes trades to the best available DEX based on price
 */
contract DexRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using RouteLib for address[];

    // Fee in basis points (0.05% = 5 basis points)
    uint256 public constant FEE_BPS = 5;
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Mapping of DEX name to adapter
    mapping(string => IDexAdapter) public adapters;
    
    // Array of registered DEX names for iteration
    string[] public registeredDexes;

    // Events
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string dexUsed,
        uint256 feeCollected
    );
    
    event AdapterRegistered(string indexed dexName, address indexed adapter);
    event AdapterRemoved(string indexed dexName);
    event FeesWithdrawn(address indexed token, uint256 amount, address recipient);

    /**
     * @notice Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new DEX adapter
     * @param dexName Human-readable name of the DEX
     * @param adapter Address of the adapter contract
     */
    function registerAdapter(string calldata dexName, IDexAdapter adapter) external onlyOwner {
        require(address(adapters[dexName]) == address(0), "Adapter already registered");
        require(address(adapter) != address(0), "Invalid adapter address");
        
        adapters[dexName] = adapter;
        registeredDexes.push(dexName);
        
        emit AdapterRegistered(dexName, address(adapter));
    }

    /**
     * @notice Remove a DEX adapter
     * @param dexName Name of the DEX to remove
     */
    function removeAdapter(string calldata dexName) external onlyOwner {
        require(address(adapters[dexName]) != address(0), "Adapter not found");
        
        delete adapters[dexName];
        
        // Remove from array
        for (uint256 i = 0; i < registeredDexes.length; i++) {
            if (keccak256(bytes(registeredDexes[i])) == keccak256(bytes(dexName))) {
                registeredDexes[i] = registeredDexes[registeredDexes.length - 1];
                registeredDexes.pop();
                break;
            }
        }
        
        emit AdapterRemoved(dexName);
    }

    /**
     * @notice Get a quote from a specific DEX
     * @param dexName Name of the DEX
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @return amountOut Expected output amount
     */
    function getQuote(
        string calldata dexName,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        require(address(adapters[dexName]) != address(0), "Adapter not found");
        return adapters[dexName].getAmountOut(tokenIn, tokenOut, amountIn);
    }

    /**
     * @notice Find the best route across all DEXes
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @return bestDex Name of the DEX with best price
     * @return bestAmountOut Best output amount
     */
    function findBestRoute(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (string memory bestDex, uint256 bestAmountOut) {
        bestAmountOut = 0;
        
        for (uint256 i = 0; i < registeredDexes.length; i++) {
            IDexAdapter adapter = adapters[registeredDexes[i]];
            
            try adapter.getAmountOut(tokenIn, tokenOut, amountIn) returns (uint256 amountOut) {
                if (amountOut > bestAmountOut) {
                    bestAmountOut = amountOut;
                    bestDex = registeredDexes[i];
                }
            } catch {
                // Skip this DEX if quote fails
                continue;
            }
        }
        
        require(bestAmountOut > 0, "No valid route found");
    }

    /**
     * @notice Execute a swap using the best available route
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum output amount (slippage protection)
     * @param recipient Address to receive the output tokens
     * @return amountOut Actual output amount
     */
    function swapBestRoute(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external nonReentrant returns (uint256 amountOut) {
        // Find best DEX
        (string memory bestDex, uint256 expectedOut) = this.findBestRoute(tokenIn, tokenOut, amountIn);
        require(expectedOut >= minAmountOut, "Slippage too high");

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Calculate fee
        uint256 feeAmount = (amountIn * FEE_BPS) / BPS_DENOMINATOR;
        uint256 swapAmount = amountIn - feeAmount;

        // Approve adapter
        IERC20(tokenIn).safeIncreaseAllowance(address(adapters[bestDex]), swapAmount);

        // Execute swap
        amountOut = adapters[bestDex].swap(
            tokenIn,
            tokenOut,
            swapAmount,
            minAmountOut - ((minAmountOut * FEE_BPS) / BPS_DENOMINATOR), // Adjust min for fee
            recipient
        );

        emit SwapExecuted(
            recipient,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            bestDex,
            feeAmount
        );
    }

    /**
     * @notice Execute a swap on a specific DEX
     * @param dexName Name of the DEX to use
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum output amount (slippage protection)
     * @param recipient Address to receive the output tokens
     * @return amountOut Actual output amount
     */
    function swapOnDex(
        string calldata dexName,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external nonReentrant returns (uint256 amountOut) {
        require(address(adapters[dexName]) != address(0), "Adapter not found");

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Calculate fee
        uint256 feeAmount = (amountIn * FEE_BPS) / BPS_DENOMINATOR;
        uint256 swapAmount = amountIn - feeAmount;

        // Approve adapter
        IERC20(tokenIn).safeIncreaseAllowance(address(adapters[dexName]), swapAmount);

        // Execute swap
        amountOut = adapters[dexName].swap(
            tokenIn,
            tokenOut,
            swapAmount,
            minAmountOut,
            recipient
        );

        emit SwapExecuted(
            recipient,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            dexName,
            feeAmount
        );
    }

    /**
     * @notice Get all registered DEXes
     * @return Array of DEX names
     */
    function getRegisteredDexes() external view returns (string[] memory) {
        return registeredDexes;
    }

    /**
     * @notice Withdraw collected fees (owner only)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     * @param recipient Address to receive the tokens
     */
    function withdrawFees(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner {
        IERC20(token).safeTransfer(recipient, amount);
        emit FeesWithdrawn(token, amount, recipient);
    }

    /**
     * @notice Emergency withdraw (owner only)
     * @param token Token address to withdraw
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(owner(), balance);
    }
}