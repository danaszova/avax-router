import { ethers } from "hardhat";

/**
 * Discover Correct DEX Addresses on Avalanche
 * 
 * This script finds the correct router/factory addresses
 */

const ROUTER_ABI = [
  "function factory() view returns (address)",
  "function getAmountsOut(uint256, address[]) view returns (uint256[])",
  "function WETH() view returns (address)",
];

// Token addresses
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";

// Router addresses to test (will be checksummed automatically)
const ROUTERS_TO_TEST: Record<string, string> = {
  // TraderJoe
  TraderJoeV1: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
  TraderJoeV2_LB: "0xb4315e873DbCf96Fd0acd6EA047c66507581979",
  
  // Pangolin - trying multiple known addresses
  PangolinV1: ethers.getAddress("0xe54ca86531e17ef3616d11ca5b4d259fa0d24756"),
  PangolinV2: ethers.getAddress("0x9d9bcf22b8b08c9045bd220aa08e227396914b92"),
  
  // SushiSwap
  SushiSwap: ethers.getAddress("0x1b02da8cb0d097eb8d57a175b8897c0240fad033"),
  
  // Lydia
  Lydia: ethers.getAddress("0x52f0e2440dcc7d2fa2f1c6b8a4bbda8d4068dc0b"),
  
  // YetiSwap
  YetiSwap: ethers.getAddress("0x0060f75e6d410c93ed09bbc82b0f22b726536517"),
  
  // Elk
  Elk: ethers.getAddress("0x0e8a12c54dc7a532f20deb28f8e0360aeedcd2b3"),
};

async function main() {
  console.log("🔍 Discovering DEX Addresses on Avalanche Mainnet\n");
  
  const results: Record<string, { factory: string; router: string; working: boolean; quote?: string }> = {};
  
  // Test each router
  console.log("=".repeat(60));
  console.log("📊 Testing Router Addresses");
  console.log("=".repeat(60));
  
  for (const [name, routerAddress] of Object.entries(ROUTERS_TO_TEST)) {
    console.log(`\n${name}: ${routerAddress}`);
    
    try {
      const code = await ethers.provider.getCode(routerAddress);
      if (code === "0x") {
        console.log(`  ❌ No contract at this address`);
        results[name] = { factory: "", router: routerAddress, working: false };
        continue;
      }
      
      console.log(`  ✅ Contract exists (${code.length} bytes)`);
      
      const router = new ethers.Contract(routerAddress, ROUTER_ABI, ethers.provider);
      
      let factory = "";
      try {
        factory = await router.factory();
        console.log(`  Factory: ${factory}`);
      } catch (e) {
        console.log(`  Factory: Not available (might not be V2 style)`);
      }
      
      // Try a quote
      const amountIn = ethers.parseEther("0.001");
      const path = [WAVAX, USDC];
      
      try {
        const amounts = await router.getAmountsOut(amountIn, path);
        const quote = ethers.formatUnits(amounts[1], 6);
        console.log(`  ✅ Quote works: ${quote} USDC for 0.001 WAVAX`);
        
        results[name] = {
          factory,
          router: routerAddress,
          working: true,
          quote
        };
      } catch (e: any) {
        console.log(`  ⚠️ Quote failed: ${e.message?.slice(0, 60)}`);
        results[name] = {
          factory,
          router: routerAddress,
          working: false
        };
      }
    } catch (e: any) {
      console.log(`  ❌ Error: ${e.message?.slice(0, 80)}`);
      results[name] = { factory: "", router: routerAddress, working: false };
    }
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  
  const workingDexes = Object.entries(results).filter(([_, v]) => v.working);
  const brokenDexes = Object.entries(results).filter(([_, v]) => !v.working);
  
  console.log("\n✅ WORKING DEXes:");
  if (workingDexes.length === 0) {
    console.log("  None found!");
  } else {
    for (const [name, info] of workingDexes) {
      console.log(`  ${name}:`);
      console.log(`    Router: ${info.router}`);
      console.log(`    Factory: ${info.factory}`);
      console.log(`    Quote: ${info.quote} USDC`);
    }
  }
  
  console.log("\n❌ NOT WORKING:");
  for (const [name, info] of brokenDexes) {
    console.log(`  ${name}: ${info.router}`);
  }
  
  // Output config for copy-paste
  if (workingDexes.length > 0) {
    console.log("\n" + "=".repeat(60));
    console.log("📋 CONFIG FOR DEPLOYMENT");
    console.log("=".repeat(60));
    console.log("\nconst DEX_CONFIGS = {");
    for (const [name, info] of workingDexes) {
      console.log(`  ${name}: {`);
      console.log(`    router: "${info.router}",`);
      console.log(`    factory: "${info.factory}",`);
      console.log(`  },`);
    }
    console.log("};");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });