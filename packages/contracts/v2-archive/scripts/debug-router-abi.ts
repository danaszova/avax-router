import { ethers } from "hardhat";

/**
 * Debug Router ABI Script
 * 
 * Tests different function signatures to find what each DEX router actually uses
 */

// Token addresses
const TOKENS = {
  WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  USDC: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
};

// DEX router addresses
const ROUTERS = {
  TraderJoeV1: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
  Pangolin: "0xE54ca86531E17ef3616d11cA5B4d259Fa0D24756",
  SushiSwap: "0x1B02dA8cB0d097eB8d57A175B8897c0240FaD033",
  Lydia: "0x52f0e2440dcc7d2FA2f1c6B8A4BBDa8D4068Dc0b",
};

// Different router ABIs to try
const ROUTER_ABIS = {
  // Standard Uniswap V2
  uniswapV2: [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function factory() external view returns (address)",
  ],
  // Some DEXes use calldata instead of memory
  uniswapV2Calldata: [
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  ],
  // Solidly style (StableSwap)
  solidly: [
    "function getAmountOut(uint amountIn, address tokenIn, address tokenOut) external view returns (uint)",
  ],
};

async function main() {
  console.log("🔍 Testing Router Function Signatures\n");
  
  const amountIn = ethers.parseEther("0.001");
  const path = [TOKENS.WAVAX, TOKENS.USDC];
  
  for (const [dexName, routerAddress] of Object.entries(ROUTERS)) {
    console.log("=".repeat(60));
    console.log(`📊 ${dexName} - ${routerAddress}`);
    console.log("=".repeat(60));
    
    // Try Uniswap V2 style with memory
    console.log("\n1️⃣ Trying UniswapV2 style (memory):");
    try {
      const router = new ethers.Contract(routerAddress, ROUTER_ABIS.uniswapV2, ethers.provider);
      
      // Try factory first
      try {
        const factory = await router.factory();
        console.log(`   factory(): ${factory}`);
      } catch (e) {
        console.log(`   factory(): Not available`);
      }
      
      const amounts = await router.getAmountsOut(amountIn, path);
      console.log(`   ✅ getAmountsOut works! Quote: ${ethers.formatUnits(amounts[1], 6)} USDC`);
    } catch (e: any) {
      console.log(`   ❌ Failed: ${e.message?.slice(0, 80)}`);
    }
    
    // Try getting bytecode to see if contract exists
    console.log("\n2️⃣ Checking contract bytecode:");
    try {
      const code = await ethers.provider.getCode(routerAddress);
      if (code === "0x") {
        console.log(`   ❌ No contract at this address!`);
      } else {
        console.log(`   ✅ Contract exists (${code.length} bytes)`);
        
        // Look for common function selectors in bytecode
        const getAmountsOutSelector = ethers.id("getAmountsOut(uint256,address[])").slice(0, 10);
        const getAmountsOutV3Selector = ethers.id("getAmountsOut(uint256,address[],address)").slice(0, 10);
        
        if (code.includes(getAmountsOutSelector.slice(2))) {
          console.log(`   📝 Found getAmountsOut(uint256,address[]) selector`);
        }
      }
    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message?.slice(0, 50)}`);
    }
    
    // Try Pangolin's specific interface (they might have changed)
    console.log("\n3️⃣ Trying Pangolin V2 specific interface:");
    const pangolinAbi = [
      "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
    ];
    try {
      const router = new ethers.Contract(routerAddress, pangolinAbi, ethers.provider);
      const amounts = await router.getAmountsOut(amountIn, path);
      console.log(`   ✅ Works! Quote: ${ethers.formatUnits(amounts[1], 6)} USDC`);
    } catch (e: any) {
      console.log(`   ❌ Failed: ${e.message?.slice(0, 80)}`);
    }
    
    // Try SushiSwap's specific interface
    console.log("\n4️⃣ Trying alternative interfaces:");
    
    // Some routers use different path encoding
    const altAbis = [
      // V3 style
      "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)",
      // Curve style
      "function get_dy(int128 i, int128 j, uint256 dx) external view returns (uint256)",
      // Simple
      "function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) external view returns (uint256 amountOut)",
    ];
    
    for (const abi of altAbis) {
      try {
        const router = new ethers.Contract(routerAddress, [abi], ethers.provider);
        // Just check if function exists by trying to encode
        const fragment = router.interface.getFunction(abi.split("(")[0].replace("function ", ""));
        if (fragment) {
          console.log(`   Found: ${fragment.name}`);
        }
      } catch (e) {
        // Skip
      }
    }
    
    console.log("");
  }
  
  // Check Pangolin's actual deployed contracts
  console.log("\n" + "=".repeat(60));
  console.log("📋 Checking known DEX addresses from documentation:");
  console.log("=".repeat(60));
  
  // Pangolin V2 migrated - check their docs
  console.log("\nPangolin:");
  console.log("  Old Router: 0xE54ca86531E17ef3616d11cA5B4d259Fa0D24756");
  console.log("  New Router (Pangolin V2): May have migrated");
  console.log("  Check: https://docs.pangolin.exchange/");
  
  console.log("\nSushiSwap on Avalanche:");
  console.log("  Router: 0x1B02dA8cB0d097eB8d57A175B8897c0240FaD033");
  console.log("  This is the SushiSwap Trident router - different interface!");
  
  console.log("\nLydia:");
  console.log("  Router: 0x52f0e2440dcc7d2FA2f1c6B8A4BBDa8D4068Dc0b");
  console.log("  May have migrated or changed interfaces");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });