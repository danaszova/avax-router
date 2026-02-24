// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IDexAdapter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockDexAdapter is IDexAdapter {
    using SafeERC20 for IERC20;

    uint256 public rate = 1e18; // 1:1 by default
    bool public shouldFail = false;

    constructor() {}

    function dexName() external pure override returns (string memory) {
        return "MockDex";
    }

    function setRate(uint256 _rate) external {
        rate = _rate;
    }

    function setShouldFail(bool _shouldFail) external {
        shouldFail = _shouldFail;
    }

    function getAmountOut(
        address,
        address,
        uint256 amountIn
    ) external view override returns (uint256 amountOut) {
        require(!shouldFail, "MockDexAdapter: Simulated failure");
        return (amountIn * rate) / 1e18;
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external override returns (uint256 amountOut) {
        require(!shouldFail, "MockDexAdapter: Simulated failure");
        
        // Calculate output based on rate
        amountOut = (amountIn * rate) / 1e18;
        require(amountOut >= minAmountOut, "MockDexAdapter: Insufficient output");

        // Transfer tokens
        // Check allowance first (DexRouter should have approved this adapter)
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Mock sending output tokens to recipient (assumes this contract has enough tokens)
        // In a real test, we would mint tokens to this adapter first
        IERC20(tokenOut).safeTransfer(recipient, amountOut);
    }

    function hasPool(address, address) external pure override returns (bool) {
        return true;
    }
}
