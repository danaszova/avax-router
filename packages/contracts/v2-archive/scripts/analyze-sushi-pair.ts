import { ethers } from "hardhat";

/**
 * Analyze SushiSwap Pair to Find Router
 * 
 * Query the pair contract to find router-related info
 */

const PAIR_ABI = [
  "function factory() view returns (address)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  // Some pairs have these
  "function router() view returns (address)",
  "function masterContract() view returns (address)",
];

const ROUTER_ABI = [
  "function factory() view returns (address)",
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)",
];

// Known SushiSwap pair on Avalanche (found earlier)
const SUSHI_PAIR = "0x4ed65dAB34d5FD4b1eb384432027CE47E90E1185"; // WAVAX/USDC
const SUSHI_FACTORY = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";

// Common router patterns to check
const ROUTER_PATTERNS: Record<string, string> = {};

async function main() {
  console.log("🔍 Analyzing SushiSwap Pair on Avalanche\n");
  
  const pair = new ethers.Contract(SUSHI_PAIR, PAIR_ABI, ethers.provider);
  
  // Get basic pair info
  console.log("=".repeat(60));
  console.log("📊 Pair Information");
  console.log("=".repeat(60));
  console.log(`Pair Address: ${SUSHI_PAIR}`);
  
  try {
    const factory = await pair.factory();
    console.log(`Factory: ${factory}`);
  } catch (e) {}
  
  try {
    const token0 = await pair.token0();
    const token1 = await pair.token1();
    console.log(`Token0: ${token0}`);
    console.log(`Token1: ${token1}`);
  } catch (e) {}
  
  try {
    const reserves = await pair.getReserves();
    console.log(`Reserve0: ${ethers.formatUnits(reserves[0], 6)} USDC`);
    console.log(`Reserve1: ${ethers.formatEther(reserves[1])} WAVAX`);
  } catch (e) {}
  
  try {
    const supply = await pair.totalSupply();
    console.log(`Total Supply: ${ethers.formatEther(supply)} LP tokens`);
  } catch (e) {}
  
  // Try to get router from pair
  console.log("\n" + "=".repeat(60));
  console.log("🔍 Looking for Router");
  console.log("=".repeat(60));
  
  try {
    const router = await pair.router();
    console.log(`✅ Pair has router(): ${router}`);
    
    // Test this router
    const routerContract = new ethers.Contract(router, ROUTER_ABI, ethers.provider);
    const routerFactory = await routerContract.factory();
    console.log(`   Router's factory(): ${routerFactory}`);
    
    if (routerFactory.toLowerCase() === SUSHI_FACTORY.toLowerCase()) {
      console.log(`   🎉 THIS IS THE CORRECT SUSHISWAP ROUTER!`);
    }
  } catch (e: any) {
    console.log(`Pair doesn't have router() function`);
  }
  
  try {
    const master = await pair.masterContract();
    console.log(`Master Contract: ${master}`);
  } catch (e) {}
  
  // Check factory bytecode for router address pattern
  console.log("\n" + "=".repeat(60));
  console.log("🔍 Checking Factory Bytecode");
  console.log("=".repeat(60));
  
  const factoryCode = await ethers.provider.getCode(SUSHI_FACTORY);
  console.log(`Factory code length: ${factoryCode.length} bytes`);
  
  // Look for potential router addresses in the bytecode
  // Router addresses are often stored in factory contracts
  const addressPattern = /0x[a-fA-F0-9]{40}/g;
  const matches = factoryCode.match(addressPattern) || [];
  const uniqueAddresses = [...new Set(matches)].filter(a => a !== "0x0000000000000000000000000000000000000000");
  
  console.log(`\nFound ${uniqueAddresses.length} unique addresses in factory bytecode`);
  console.log("Testing each for router interface...\n");
  
  const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
  const USDC = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";
  const amountIn = ethers.parseEther("0.001");
  const path = [WAVAX, USDC];
  
  for (const addr of uniqueAddresses.slice(0, 10)) { // Test first 10
    // Skip if it's the factory or pair
    if (addr.toLowerCase() === SUSHI_FACTORY.toLowerCase() || 
        addr.toLowerCase() === SUSHI_PAIR.toLowerCase()) {
      continue;
    }
    
    try {
      const router = new ethers.Contract(addr, ROUTER_ABI, ethers.provider);
      const fact = await router.factory();
      
      if (fact.toLowerCase() === SUSHI_FACTORY.toLowerCase()) {
        console.log(`🎉 FOUND ROUTER: ${addr}`);
        console.log(`   Factory matches SushiSwap!`);
        
        try {
          const amounts = await router.getAmountsOut(amountIn, path);
          console.log(`   ✅ Quote works: ${ethers.formatUnits(amounts[1], 6)} USDC for 0.001 WAVAX`);
        } catch (e) {
          console.log(`   ⚠️ Quote failed`);
        }
      }
    } catch (e) {
      // Not a router
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📝 SUMMARY");
  console.log("=".repeat(60));
  console.log("\nSushiSwap on Avalanche may use:");
  console.log("1. A different router than standard UniswapV2");
  console.log("2. Trident or another AMM architecture");
  console.log("3. May have migrated or be deprecated");
  console.log("\nRecommendation: Focus on TraderJoeV1 (working) and research");
  console.log("other DEXes' current contract addresses from their official docs.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });