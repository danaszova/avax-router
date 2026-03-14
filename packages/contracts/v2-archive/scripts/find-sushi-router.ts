import { ethers } from "hardhat";

/**
 * Find SushiSwap Router on Avalanche
 * 
 * Test various known SushiSwap router addresses
 */

const ROUTER_ABI = [
  "function factory() view returns (address)",
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)",
  "function WETH() view returns (address)",
];

// Possible SushiSwap router addresses
const ROUTERS_TO_TEST = [
  "0x1B02dA8cB0d097eB8d57A175B8897c0240FaD033", // Common SushiSwap router
  "0x14F6481D7F54288D4577d7c0292939023b226801", // Alternative
  "0x9B3336186a38E24e8fC0d5191Ac7A0b78C4A7a57", // Alternative
  "0xBe6F657e29856E5c2aD77D37E7843B2f3870B7EC", // Alternative
  "0x60aE616a2155Ee3d9A68541Ba4544862310933d4", // TraderJoe (for comparison)
];

const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";
const EXPECTED_FACTORY = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"; // SushiSwap factory

async function main() {
  console.log("🔍 Finding SushiSwap Router on Avalanche\n");
  console.log(`Expected Factory: ${EXPECTED_FACTORY}\n`);
  
  const amountIn = ethers.parseEther("0.001");
  const path = [WAVAX, USDC];
  
  for (const routerAddress of ROUTERS_TO_TEST) {
    console.log("=".repeat(60));
    console.log(`Testing Router: ${routerAddress}`);
    console.log("=".repeat(60));
    
    // Check if contract exists
    const code = await ethers.provider.getCode(routerAddress);
    if (code === "0x") {
      console.log("❌ No contract at this address\n");
      continue;
    }
    
    console.log(`✅ Contract exists (${code.length} bytes)`);
    
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, ethers.provider);
    
    // Check factory
    try {
      const factory = await router.factory();
      console.log(`   factory(): ${factory}`);
      
      if (factory.toLowerCase() === EXPECTED_FACTORY.toLowerCase()) {
        console.log(`   🎉 FACTORY MATCHES SUSHISWAP!`);
      } else if (factory.toLowerCase() === "0x9ad6c38be94206ca50bb0d90783181662f0cfa10") {
        console.log(`   ℹ️ This is TraderJoe's factory`);
      }
    } catch (e: any) {
      console.log(`   factory(): Error - ${e.message?.slice(0, 50)}`);
    }
    
    // Check WETH (WAVAX)
    try {
      const weth = await router.WETH();
      console.log(`   WETH(): ${weth}`);
    } catch (e: any) {
      console.log(`   WETH(): Not available`);
    }
    
    // Try getAmountsOut
    try {
      const amounts = await router.getAmountsOut(amountIn, path);
      console.log(`   ✅ getAmountsOut: ${ethers.formatUnits(amounts[1], 6)} USDC for 0.001 WAVAX`);
    } catch (e: any) {
      console.log(`   ❌ getAmountsOut failed: ${e.message?.slice(0, 60)}`);
    }
    
    console.log("");
  }
  
  console.log("=".repeat(60));
  console.log("📝 RESULT");
  console.log("=".repeat(60));
  console.log("\nThe router that matches SushiSwap factory is the correct one.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });