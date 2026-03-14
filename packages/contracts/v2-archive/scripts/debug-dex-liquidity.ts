import { ethers } from "hardhat";

/**
 * Debug DEX Liquidity Script
 * 
 * Investigates why Pangolin, SushiSwap, Lydia show no liquidity
 * by testing factory and router calls directly
 */

// Token addresses
const TOKENS = {
  WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  USDC: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // Bridged USDC
  USDC_NATIVE: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // Native USDC
  USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  JOE: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
  PNG: "0x60781C2586D68229fde47564546784ab3fACA982", // Pangolin token
};

// DEX configurations - let's verify these
const DEX_CONFIGS = {
  TraderJoeV1: {
    router: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    factory: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
  },
  Pangolin: {
    router: "0xE54ca86531E17ef3616d11cA5B4d259Fa0D24756",
    factory: "0xEFA94De7a4656C78De230acaFf18Fb0460f52f5E",
  },
  SushiSwap: {
    router: "0x1B02dA8cB0d097eB8d57A175B8897c0240FaD033",
    factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  },
  Lydia: {
    router: "0x52f0e2440dcc7d2FA2f1c6B8A4BBDa8D4068Dc0b",
    factory: "0x7bc3216293985266d17c4e54fb9Db1C2bA8396BE",
  },
};

// Factory ABI - just getPair
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)"
];

// Router ABI - getAmountsOut
const ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)",
  "function factory() view returns (address)"
];

async function main() {
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("🔍 Debugging DEX Liquidity on Avalanche Mainnet");
  console.log("================================================");
  console.log("Network:", network.chainId === 43114n ? "Avalanche Mainnet" : "Unknown");
  console.log("");
  
  const amountIn = ethers.parseEther("0.001"); // Test amount
  
  // Test each DEX
  for (const [dexName, config] of Object.entries(DEX_CONFIGS)) {
    console.log("\n" + "=".repeat(60));
    console.log(`📊 Testing ${dexName}`);
    console.log("=".repeat(60));
    console.log(`Router: ${config.router}`);
    console.log(`Factory: ${config.factory}`);
    
    // Connect to contracts
    const router = new ethers.Contract(config.router, ROUTER_ABI, ethers.provider);
    const factory = new ethers.Contract(config.factory, FACTORY_ABI, ethers.provider);
    
    // First, verify the router's factory (if it has one)
    try {
      const routerFactory = await router.factory();
      console.log(`\n🔧 Router's factory(): ${routerFactory}`);
      if (routerFactory.toLowerCase() !== config.factory.toLowerCase()) {
        console.log(`   ⚠️ MISMATCH! Config says ${config.factory}`);
      }
    } catch (e: any) {
      console.log(`   Router has no factory() function or error: ${e.message?.slice(0, 50)}`);
    }
    
    // Test pairs
    const pairsToTest = [
      ["WAVAX", "USDC", TOKENS.WAVAX, TOKENS.USDC],
      ["WAVAX", "USDT", TOKENS.WAVAX, TOKENS.USDT],
      ["WAVAX", "JOE", TOKENS.WAVAX, TOKENS.JOE],
      ["WAVAX", "PNG", TOKENS.WAVAX, TOKENS.PNG],
    ];
    
    console.log("\n📋 Checking pairs:");
    
    for (const [nameA, nameB, tokenA, tokenB] of pairsToTest) {
      console.log(`\n   ${nameA}/${nameB}:`);
      
      // Check if pair exists via factory
      try {
        const pairAddress = await factory.getPair(tokenA, tokenB);
        if (pairAddress === ethers.ZeroAddress) {
          console.log(`      ❌ No pair found via factory.getPair()`);
        } else {
          console.log(`      ✅ Pair found: ${pairAddress}`);
          
          // Try to get quote from router
          try {
            const path = [tokenA, tokenB];
            const amounts = await router.getAmountsOut(amountIn, path);
            console.log(`      💰 Quote: ${ethers.formatUnits(amounts[1], nameB === "USDC" || nameB === "USDT" ? 6 : 18)} ${nameB} for 0.001 ${nameA}`);
          } catch (quoteError: any) {
            console.log(`      ⚠️ Pair exists but quote failed: ${quoteError.message?.slice(0, 80)}`);
          }
        }
      } catch (e: any) {
        console.log(`      ❌ Factory call failed: ${e.message?.slice(0, 80)}`);
      }
    }
    
    // Try direct router call without checking factory
    console.log("\n🔧 Direct router quote (WAVAX → USDC):");
    try {
      const path = [TOKENS.WAVAX, TOKENS.USDC];
      const amounts = await router.getAmountsOut(amountIn, path);
      console.log(`   ✅ Direct quote works: ${ethers.formatUnits(amounts[1], 6)} USDC`);
    } catch (e: any) {
      console.log(`   ❌ Direct quote failed: ${e.message?.slice(0, 100)}`);
    }
  }
  
  // Summary
  console.log("\n\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log("\nIf a DEX shows pairs but our adapter fails, the issue is in our adapter.");
  console.log("If a DEX shows no pairs, the factory address or token addresses may be wrong.");
  console.log("\nCommon issues:");
  console.log("1. Some DEXes use different WAVAX addresses");
  console.log("2. Factory addresses might have changed");
  console.log("3. Some DEXes might be deprecated or have migrated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });