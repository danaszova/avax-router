// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IWAVAX
 * @notice Interface for Wrapped AVAX (WAVAX) contract
 */
interface IWAVAX {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}