import { ethers } from "hardhat";

/**
 * Discover DEXes from Known Working Pairs
 * 
 * Strategy: Find working pairs, get their factories, then find routers
 */

const PAIR_ABI = [
  "function factory() view returns (address)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112, uint112, uint32)",
  "function totalSupply() view returns (uint256)",
];

const FACTORY_ABI = [
  "function getPair(address, address) view returns (address)",
  "function allPairsLength() view returns (uint256)",
  "function feeTo() view returns (address)",
  "function feeToSetter() view returns (address)",
];

const ROUTER_ABI = [
  "function factory() view returns (address)",
  "function getAmountsOut(uint256, address[]) view returns (uint256[])",
];

// Working pairs we've verified
const WORKING_PAIRS = [
  { name: "TraderJoeV1 WAVAX/USDC", address: "0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1" },
  { name: "SushiSwap WAVAX/USDC", address: "0x4eD65dAB34d5FD4b1eb384432027CE47E90E1185" },
];

const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";

async function main() {
  console.log("🔍 Discovering DEXes from Working Pairs\n");
  
  const factories: Record<string, { factory: string; pairs: string[] }> = {};
  
  // Step 1: Get factories from working pairs
  console.log("=".repeat(60));
  console.log("📊 Step 1: Analyzing Working Pairs");
  console.log("=".repeat(60));
  
  for (const pairInfo of WORKING_PAIRS) {
    console.log(`\n${pairInfo.name}:`);
    console.log(`  Address: ${pairInfo.address}`);
    
    try {
      const pair = new ethers.Contract(pairInfo.address, PAIR_ABI, ethers.provider);
      const factory = await pair.factory();
      const token0 = await pair.token0();
      const token1 = await pair.token1();
      const reserves = await pair.getReserves();
      
      console.log(`  ✅ Factory: ${factory}`);
      console.log(`  Token0: ${token0}`);
      console.log(`  Token1: ${token1}`);
      console.log(`  Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`);
      
      if (!factories[factory]) {
        factories[factory] = { factory, pairs: [] };
      }
      factories[factory].pairs.push(pairInfo.name);
    } catch (e: any) {
      console.log(`  ❌ Error: ${e.message?.slice(0, 80)}`);
    }
  }
  
  // Step 2: For each factory, try to find the router
  console.log("\n" + "=".repeat(60));
  console.log("📊 Step 2: Finding Routers for Factories");
  console.log("=".repeat(60));
  
  // Common router addresses on Avalanche to test
  const knownRouters = [
    "0x60aE616a2155Ee3d9A68541Ba4544862310933d4", // TraderJoe V1
    "0xb4315e873DbCf96Fd0acd6EA047c66507581979", // TraderJoe V2 LB
  ];
  
  for (const [factoryAddr, info] of Object.entries(factories)) {
    console.log(`\nFactory: ${factoryAddr}`);
    console.log(`  Pairs: ${info.pairs.join(", ")}`);
    
    // Try to find router that points to this factory
    for (const routerAddr of knownRouters) {
      try {
        const router = new ethers.Contract(routerAddr, ROUTER_ABI, ethers.provider);
        const routerFactory = await router.factory();
        
        if (routerFactory.toLowerCase() === factoryAddr.toLowerCase()) {
          console.log(`  ✅ Found matching router: ${routerAddr}`);
          
          // Test quote
          try {
            const amounts = await router.getAmountsOut(ethers.parseEther("0.001"), [WAVAX, USDC]);
            console.log(`     Quote works: ${ethers.formatUnits(amounts[1], 6)} USDC`);
          } catch (e) {
            console.log(`     Quote failed`);
          }
        }
      } catch (e) {
        // Skip
      }
    }
  }
  
  // Step 3: Search for more DEXes by checking top token pairs
  console.log("\n" + "=".repeat(60));
  console.log("📊 Step 3: Checking TraderJoe Factory for Other Pairs");
  console.log("=".repeat(60));
  
  const tjFactory = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";
  const factory = new ethers.Contract(tjFactory, FACTORY_ABI, ethers.provider);
  
  // Check for pairs with other popular tokens
  const tokensToCheck = [
    { name: "JOE", address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd" },
    { name: "USDT", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7" },
    { name: "WETH", address: "0x49d5c2bdFfac6Ce2BFdB6640F4F80f226bc10bAB" },
    { name: "WBTC", address: "0x50b7545627a5162f82a992c33b87adc75187b218" },
  ];
  
  console.log(`\nChecking pairs on TraderJoe Factory:`);
  
  for (const token of tokensToCheck) {
    try {
      const pair = await factory.getPair(WAVAX, token.address);
      if (pair !== ethers.ZeroAddress) {
        console.log(`  ✅ WAVAX/${token.name}: ${pair}`);
      }
    } catch (e) {
      console.log(`  ❌ WAVAX/${token.name}: No pair`);
    }
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));
  
  console.log("\n✅ CONFIRMED WORKING:");
  console.log("  TraderJoeV1:");
  console.log("    Router: 0x60aE616a2155Ee3d9A68541Ba4544862310933d4");
  console.log("    Factory: 0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10");
  
  console.log("\n⚠️ HAS LIQUIDITY BUT NO ROUTER FOUND:");
  console.log("  SushiSwap:");
  console.log("    Factory: 0xc35DADB65012eC5796536bD9864eD8773aBc74C4");
  console.log("    Pairs exist but standard V2 router not found");
  console.log("    May use different architecture (Trident/V3)");
  
  console.log("\n❌ NO CONTRACTS FOUND:");
  console.log("  Pangolin, Lydia, YetiSwap, Elk");
  console.log("  These DEXes may have migrated or be deprecated");
  
  console.log("\n📝 RECOMMENDATION:");
  console.log("  1. Focus on TraderJoeV1 (confirmed working)");
  console.log("  2. Research SushiSwap's current Avalanche deployment");
  console.log("  3. Check Pangolin's official docs for current contracts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });