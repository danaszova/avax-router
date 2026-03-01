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
 * @author AVAX Router Team
 * @notice Main entry point for routing swaps across multiple DEXes on Avalanche
 * @dev Routes trades to the best available DEX based on price, with partner fee support
 */
contract DexRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using RouteLib for address[];

    // Protocol fee in basis points (0.05% = 5 basis points)
    uint256 public constant PROTOCOL_FEE_BPS = 5;
    
    // Maximum partner fee in basis points (0.50% = 50 basis points)
    uint256 public constant MAX_PARTNER_FEE_BPS = 50;
    
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
        uint256 protocolFeeCollected,
        uint256 partnerFeeCollected,
        address partner
    );
    
    event AdapterRegistered(string indexed dexName, address indexed adapter);
    event AdapterRemoved(string indexed dexName);
    event ProtocolFeesWithdrawn(address indexed token, uint256 amount, address recipient);

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
        // Call with no partner fees
        amountOut = _executeSwap(
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            recipient,
            address(0),
            0
        );
    }

    /**
     * @notice Execute a swap using the best available route with partner fees
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum output amount (slippage protection)
     * @param recipient Address to receive the output tokens
     * @param partner Partner address to receive partner fees (address(0) for no partner)
     * @param partnerFeeBps Partner fee in basis points (max 50 = 0.50%)
     * @return amountOut Actual output amount
     */
    function swapBestRouteWithPartner(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient,
        address partner,
        uint256 partnerFeeBps
    ) external nonReentrant returns (uint256 amountOut) {
        amountOut = _executeSwap(
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            recipient,
            partner,
            partnerFeeBps
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
        amountOut = _executeSwapOnDex(
            dexName,
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            recipient,
            address(0),
            0
        );
    }

    /**
     * @notice Execute a swap on a specific DEX with partner fees
     * @param dexName Name of the DEX to use
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum output amount (slippage protection)
     * @param recipient Address to receive the output tokens
     * @param partner Partner address to receive partner fees
     * @param partnerFeeBps Partner fee in basis points (max 50 = 0.50%)
     * @return amountOut Actual output amount
     */
    function swapOnDexWithPartner(
        string calldata dexName,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient,
        address partner,
        uint256 partnerFeeBps
    ) external nonReentrant returns (uint256 amountOut) {
        amountOut = _executeSwapOnDex(
            dexName,
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            recipient,
            partner,
            partnerFeeBps
        );
    }

    /**
     * @notice Internal function to execute swap with best route
     */
    function _executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient,
        address partner,
        uint256 partnerFeeBps
    ) internal returns (uint256 amountOut) {
        // Validate partner fee
        require(partnerFeeBps <= MAX_PARTNER_FEE_BPS, "Partner fee too high");
        
        // Find best DEX (using amount after fees for comparison)
        (string memory bestDex, uint256 expectedOut) = this.findBestRoute(tokenIn, tokenOut, amountIn);
        
        // Calculate fees
        uint256 protocolFeeAmount = (amountIn * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 partnerFeeAmount = partner != address(0) 
            ? (amountIn * partnerFeeBps) / BPS_DENOMINATOR 
            : 0;
        uint256 totalFees = protocolFeeAmount + partnerFeeAmount;
        uint256 swapAmount = amountIn - totalFees;

        // Adjust minAmountOut for fees
        uint256 adjustedMinOut = minAmountOut > totalFees 
            ? minAmountOut - ((minAmountOut * (PROTOCOL_FEE_BPS + partnerFeeBps)) / BPS_DENOMINATOR)
            : 0;
        
        require(expectedOut >= adjustedMinOut, "Slippage too high");

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Send partner fee immediately if applicable
        if (partnerFeeAmount > 0 && partner != address(0)) {
            IERC20(tokenIn).safeTransfer(partner, partnerFeeAmount);
        }

        // Approve adapter
        IERC20(tokenIn).safeIncreaseAllowance(address(adapters[bestDex]), swapAmount);

        // Execute swap
        amountOut = adapters[bestDex].swap(
            tokenIn,
            tokenOut,
            swapAmount,
            adjustedMinOut,
            recipient
        );

        emit SwapExecuted(
            recipient,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            bestDex,
            protocolFeeAmount,
            partnerFeeAmount,
            partner
        );
    }

    /**
     * @notice Internal function to execute swap on specific DEX
     */
    function _executeSwapOnDex(
        string calldata dexName,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient,
        address partner,
        uint256 partnerFeeBps
    ) internal returns (uint256 amountOut) {
        require(address(adapters[dexName]) != address(0), "Adapter not found");
        require(partnerFeeBps <= MAX_PARTNER_FEE_BPS, "Partner fee too high");

        // Calculate fees
        uint256 protocolFeeAmount = (amountIn * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 partnerFeeAmount = partner != address(0) 
            ? (amountIn * partnerFeeBps) / BPS_DENOMINATOR 
            : 0;
        uint256 totalFees = protocolFeeAmount + partnerFeeAmount;
        uint256 swapAmount = amountIn - totalFees;

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Send partner fee immediately if applicable
        if (partnerFeeAmount > 0 && partner != address(0)) {
            IERC20(tokenIn).safeTransfer(partner, partnerFeeAmount);
        }

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
            protocolFeeAmount,
            partnerFeeAmount,
            partner
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
     * @notice Withdraw collected protocol fees (owner only)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     * @param recipient Address to receive the tokens
     */
    function withdrawProtocolFees(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner {
        IERC20(token).safeTransfer(recipient, amount);
        emit ProtocolFeesWithdrawn(token, amount, recipient);
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