// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../interfaces/IDexAdapter.sol";
import "../interfaces/traderjoe/ILBRouter.sol";
import "../interfaces/traderjoe/ILBPair.sol";

/**
 * @title TraderJoeV2Adapter
 * @notice Adapter for Trader Joe V2 (LB) DEX on Avalanche
 * @dev Implements IDexAdapter for Trader Joe Liquidity Book
 */
contract TraderJoeV2Adapter is IDexAdapter {
    using SafeERC20 for IERC20;

    // Trader Joe V2 Router address on Avalanche
    ILBRouter public immutable router;
    
    // Trader Joe V2 Factory address
    address public immutable factory;

    // Common tokens for multi-hop routing
    address public constant WAVAX = 0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C;
    address public constant USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address public constant USDT = 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7;

    /**
     * @notice Constructor
     * @param _router Trader Joe V2 Router address
     * @param _factory Trader Joe V2 Factory address
     */
    constructor(ILBRouter _router, address _factory) {
        router = _router;
        factory = _factory;
    }

    /**
     * @notice Get the DEX name
     * @return Name of the DEX
     */
    function dexName() external pure override returns (string memory) {
        return "TraderJoe V2";
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
        ILBPair pair = _getPair(tokenIn, tokenOut);
        
        if (address(pair) != address(0)) {
            return _getQuoteFromPair(pair, tokenIn, amountIn);
        }
        
        // Try multi-hop through WAVAX
        if (tokenIn != WAVAX && tokenOut != WAVAX) {
            ILBPair pair1 = _getPair(tokenIn, WAVAX);
            ILBPair pair2 = _getPair(WAVAX, tokenOut);
            
            if (address(pair1) != address(0) && address(pair2) != address(0)) {
                uint256 intermediateAmount = _getQuoteFromPair(pair1, tokenIn, amountIn);
                if (intermediateAmount > 0) {
                    return _getQuoteFromPair(pair2, WAVAX, intermediateAmount);
                }
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
        ILBPair pair = _getPair(tokenIn, tokenOut);
        
        if (address(pair) != address(0)) {
            amountOut = _executeSwap(pair, tokenIn, amountIn, minAmountOut, recipient);
        } else {
            // Multi-hop through WAVAX
            amountOut = _executeMultiHopSwap(tokenIn, tokenOut, amountIn, minAmountOut, recipient);
        }
        
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
        return address(_getPair(tokenIn, tokenOut)) != address(0);
    }

    /**
     * @notice Get LB pair for token pair
     * @param tokenA First token
     * @param tokenB Second token
     * @return pair The LB pair contract
     */
    function _getPair(address tokenA, address tokenB) internal view returns (ILBPair pair) {
        // Get all available bin steps for the pair
        uint16[] memory binSteps = new uint16[](5);
        binSteps[0] = 1;  // 0.01%
        binSteps[1] = 5;  // 0.05%
        binSteps[2] = 10; // 0.10%
        binSteps[3] = 20; // 0.20%
        binSteps[4] = 50; // 0.50%
        
        for (uint256 i = 0; i < binSteps.length; i++) {
            try router.getLBPair(IERC20(tokenA), IERC20(tokenB), binSteps[i]) returns (ILBPair foundPair) {
                if (address(foundPair) != address(0)) {
                    return foundPair;
                }
            } catch {
                continue;
            }
        }
        
        return ILBPair(address(0));
    }

    /**
     * @notice Get quote from a specific pair
     * @param pair The LB pair
     * @param tokenIn Input token
     * @param amountIn Input amount
     * @return amountOut Output amount
     */
    function _getQuoteFromPair(
        ILBPair pair,
        address tokenIn,
        uint256 amountIn
    ) internal view returns (uint256) {
        try pair.getSwapIn(IERC20(tokenIn), amountIn) returns (uint256 amountOut, uint256 feesIn, uint256 feesOutOfBin) {
            return amountOut;
        } catch {
            return 0;
        }
    }

    /**
     * @notice Execute a direct swap on a pair
     */
    function _executeSwap(
        ILBPair pair,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) internal returns (uint256) {
        // Prepare swap parameters
        ILBRouter.LBSwapExactInParams memory params = ILBRouter.LBSwapExactInParams({
            amountIn: amountIn,
            amountOutMin: minAmountOut,
            pairBinSteps: new uint256[](1),
            tokenPath: new IERC20[](2),
            to: recipient,
            deadline: block.timestamp + 300 // 5 minutes
        });
        
        params.pairBinSteps[0] = uint256(pair.getBinStep());
        params.tokenPath[0] = IERC20(tokenIn);
        params.tokenPath[1] = IERC20(tokenIn == address(pair.getTokenX()) ? address(pair.getTokenY()) : address(pair.getTokenX()));
        
        return router.swapExactTokensForTokens(params);
    }

    /**
     * @notice Execute a multi-hop swap through WAVAX
     */
    function _executeMultiHopSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) internal returns (uint256) {
        // Find best intermediate token
        address intermediate = _findBestIntermediate(tokenIn, tokenOut);
        require(intermediate != address(0), "No route found");
        
        // Get pairs
        ILBPair pair1 = _getPair(tokenIn, intermediate);
        ILBPair pair2 = _getPair(intermediate, tokenOut);
        require(address(pair1) != address(0) && address(pair2) != address(0), "Pairs not found");
        
        // Prepare multi-hop swap
        ILBRouter.LBSwapExactInParams memory params = ILBRouter.LBSwapExactInParams({
            amountIn: amountIn,
            amountOutMin: minAmountOut,
            pairBinSteps: new uint256[](2),
            tokenPath: new IERC20[](3),
            to: recipient,
            deadline: block.timestamp + 300
        });
        
        params.pairBinSteps[0] = uint256(pair1.getBinStep());
        params.pairBinSteps[1] = uint256(pair2.getBinStep());
        params.tokenPath[0] = IERC20(tokenIn);
        params.tokenPath[1] = IERC20(intermediate);
        params.tokenPath[2] = IERC20(tokenOut);
        
        return router.swapExactTokensForTokens(params);
    }

    /**
     * @notice Find the best intermediate token for multi-hop routing
     */
    function _findBestIntermediate(
        address tokenIn,
        address tokenOut
    ) internal view returns (address) {
        address[] memory intermediates = new address[](3);
        intermediates[0] = WAVAX;
        intermediates[1] = USDC;
        intermediates[2] = USDT;
        
        uint256 bestAmount = 0;
        address bestIntermediate = address(0);
        
        for (uint256 i = 0; i < intermediates.length; i++) {
            if (tokenIn == intermediates[i] || tokenOut == intermediates[i]) continue;
            
            ILBPair pair1 = _getPair(tokenIn, intermediates[i]);
            ILBPair pair2 = _getPair(intermediates[i], tokenOut);
            
            if (address(pair1) != address(0) && address(pair2) != address(0)) {
                uint256 intermediateAmount = _getQuoteFromPair(pair1, tokenIn, 1e18);
                if (intermediateAmount > 0) {
                    uint256 finalAmount = _getQuoteFromPair(pair2, intermediates[i], intermediateAmount);
                    if (finalAmount > bestAmount) {
                        bestAmount = finalAmount;
                        bestIntermediate = intermediates[i];
                    }
                }
            }
        }
        
        return bestIntermediate;
    }
}