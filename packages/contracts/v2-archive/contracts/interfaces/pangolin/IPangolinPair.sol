// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPangolinPair
 * @notice Interface for Pangolin Pair (Uniswap V2 compatible)
 */
interface IPangolinPair {
    /**
     * @notice Returns the name of the token
     */
    function name() external pure returns (string memory);

    /**
     * @notice Returns the symbol of the token
     */
    function symbol() external pure returns (string memory);

    /**
     * @notice Returns the decimals of the token
     */
    function decimals() external pure returns (uint8);

    /**
     * @notice Returns the total supply
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Returns the balance of an address
     */
    function balanceOf(address owner) external view returns (uint256);

    /**
     * @notice Returns the allowance
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @notice Approve spending
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @notice Transfer tokens
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @notice Transfer from
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);

    /**
     * @notice Returns the factory address
     */
    function factory() external view returns (address);

    /**
     * @notice Returns token0
     */
    function token0() external view returns (address);

    /**
     * @notice Returns token1
     */
    function token1() external view returns (address);

    /**
     * @notice Returns reserves
     */
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);

    /**
     * @notice Returns price0CumulativeLast
     */
    function price0CumulativeLast() external view returns (uint256);

    /**
     * @notice Returns price1CumulativeLast
     */
    function price1CumulativeLast() external view returns (uint256);

    /**
     * @notice Returns kLast
     */
    function kLast() external view returns (uint256);

    /**
     * @notice Mint liquidity tokens
     */
    function mint(address to) external returns (uint256 liquidity);

    /**
     * @notice Burn liquidity tokens
     */
    function burn(address to) external returns (uint256 amount0, uint256 amount1);

    /**
     * @notice Swap tokens
     */
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external;

    /**
     * @notice Skim
     */
    function skim(address to) external;

    /**
     * @notice Sync
     */
    function sync() external;
}