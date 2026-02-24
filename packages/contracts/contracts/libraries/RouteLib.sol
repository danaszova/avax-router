// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RouteLib
 * @notice Library for route calculation utilities
 */
library RouteLib {
    /**
     * @notice Calculate the optimal output for a multi-hop route
     * @param amounts Array of amounts at each hop
     * @return finalAmount The final output amount
     */
    function calculateMultiHopOutput(uint256[] memory amounts) internal pure returns (uint256) {
        if (amounts.length == 0) return 0;
        return amounts[amounts.length - 1];
    }

    /**
     * @notice Check if a route is valid (no zero addresses)
     * @param path Array of token addresses in the route
     * @return isValid Whether the route is valid
     */
    function isValidRoute(address[] memory path) internal pure returns (bool) {
        if (path.length < 2) return false;
        
        for (uint256 i = 0; i < path.length; i++) {
            if (path[i] == address(0)) return false;
        }
        
        return true;
    }

    /**
     * @notice Calculate the minimum output with slippage tolerance
     * @param expectedOutput The expected output amount
     * @param slippageBps Slippage tolerance in basis points (e.g., 50 = 0.5%)
     * @return minOutput The minimum acceptable output
     */
    function calculateMinOutput(
        uint256 expectedOutput,
        uint256 slippageBps
    ) internal pure returns (uint256) {
        require(slippageBps <= 10000, "Slippage too high");
        return (expectedOutput * (10000 - slippageBps)) / 10000;
    }

    /**
     * @notice Get the intermediate token for a multi-hop route
     * @param path Array of token addresses
     * @param hopIndex The hop index (0-indexed)
     * @return tokenIn Input token for the hop
     * @return tokenOut Output token for the hop
     */
    function getHopTokens(
        address[] memory path,
        uint256 hopIndex
    ) internal pure returns (address tokenIn, address tokenOut) {
        require(hopIndex < path.length - 1, "Invalid hop index");
        tokenIn = path[hopIndex];
        tokenOut = path[hopIndex + 1];
    }

    /**
     * @notice Calculate the number of hops in a route
     * @param path Array of token addresses
     * @return hops Number of hops
     */
    function getHopCount(address[] memory path) internal pure returns (uint256) {
        if (path.length < 2) return 0;
        return path.length - 1;
    }
}