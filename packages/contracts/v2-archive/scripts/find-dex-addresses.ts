import { ethers } from "hardhat";

/**
 * Find Correct DEX Addresses on Avalanche
 * 
 * Uses factory.getPair() with known working pairs to discover
 * the correct factory and router addresses
 */

// Known pair addresses from Snowtrace (these have liquidity)
const KNOWN_PAIRS = {
  Pangolin: {
    // WAVAX/USDC pair on Pangolin (from Snowtrace)
    WAVAX_USDC: "0x1A43b535B3591c5574F201AcE6a56A7360303B49",
  },
  SushiSwap: {
    // We found these pairs in the earlier debug
    WAVAX_USDC: "0x4ed65dAB34d5FD4b1eb384432027CE47E90E1185",
    WAVAX_USDT: "0x7e5E4b677c2a682B6d2e95Ae3ec07ae1Ea7D3aB5",
    WAVAX_JOE: "0xb73c30C2741B8C62730B58B10CeAa55bdDdA7327",
  },
};

// Known router addresses to test
const KNOWN_ROUTERS = {
  SushiSwapV1: "0x1B02dA8cB0d097eB8d57A175B8897c0240FaD033",
  SushiSwapV2: "0x8e8bd38d7e9b19f0bb7a244e8a3935f8b5d9e4a0", // Placeholder - need to verify
  PangolinV1: "0xE54ca86531E17ef3616d11cA5B4d259Fa0D24756",
  PangolinV2: "0x2f7a8cB58d0c6B49D2f69D7937f5e9c2D7bE6E0d", // Placeholder - need to verify
};

// Pair ABI to get factory
const PAIR_ABI = [
  "function factory() view returns (address)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
];

// Factory ABI
const FACTORY_ABI = [
  "function getPair(address, address) view returns (address)",
  "function router() view returns (address)", // Some factories have this
];

async function main() {
  console.log("🔍 Finding Correct DEX Addresses on Avalanche\n");
  
  // Test SushiSwap pairs we found
  console.log("=".repeat(60));
  console.log("📊 SushiSwap");
  console.log("=".repeat(60));
  
  const sushiPair = new ethers.Contract(KNOWN_PAIRS.SushiSwap.WAVAX_USDC, PAIR_ABI, ethers.provider);
  
  try {
    const factory = await sushiPair.factory();
    console.log(`\n✅ Factory from pair: ${factory}`);
    
    // Connect to factory
    const factoryContract = new ethers.Contract(factory, FACTORY_ABI, ethers.provider);
    
    // Try to get router if factory has that function
    try {
      const router = await factoryContract.router();
      console.log(`✅ Router from factory: ${router}`);
    } catch (e) {
      console.log(`Factory doesn't have router() function`);
    }
    
    // Verify factory can get the pair
    const token0 = await sushiPair.token0();
    const token1 = await sushiPair.token1();
    const pairFromFactory = await factoryContract.getPair(token0, token1);
    console.log(`\nVerification:`);
    console.log(`  Token0: ${token0}`);
    console.log(`  Token1: ${token1}`);
    console.log(`  Pair from factory: ${pairFromFactory}`);
    console.log(`  Original pair: ${KNOWN_PAIRS.SushiSwap.WAVAX_USDC}`);
    console.log(`  Match: ${pairFromFactory.toLowerCase() === KNOWN_PAIRS.SushiSwap.WAVAX_USDC.toLowerCase() ? "✅" : "❌"}`);
    
  } catch (e: any) {
    console.log(`❌ Error: ${e.message?.slice(0, 100)}`);
  }
  
  // Test Pangolin pairs
  console.log("\n" + "=".repeat(60));
  console.log("📊 Pangolin");
  console.log("=".repeat(60));
  
  const pangolinPair = new ethers.Contract(KNOWN_PAIRS.Pangolin.WAVAX_USDC, PAIR_ABI, ethers.provider);
  
  try {
    const factory = await pangolinPair.factory();
    console.log(`\n✅ Factory from pair: ${factory}`);
    
    const factoryContract = new ethers.Contract(factory, FACTORY_ABI, ethers.provider);
    
    try {
      const router = await factoryContract.router();
      console.log(`✅ Router from factory: ${router}`);
    } catch (e) {
      console.log(`Factory doesn't have router() function`);
    }
    
    const token0 = await pangolinPair.token0();
    const token1 = await pangolinPair.token1();
    const pairFromFactory = await factoryContract.getPair(token0, token1);
    console.log(`\nVerification:`);
    console.log(`  Token0: ${token0}`);
    console.log(`  Token1: ${token1}`);
    console.log(`  Pair from factory: ${pairFromFactory}`);
    console.log(`  Original pair: ${KNOWN_PAIRS.Pangolin.WAVAX_USDC}`);
    console.log(`  Match: ${pairFromFactory.toLowerCase() === KNOWN_PAIRS.Pangolin.WAVAX_USDC.toLowerCase() ? "✅" : "❌"}`);
    
  } catch (e: any) {
    console.log(`❌ Error: ${e.message?.slice(0, 100)}`);
  }
  
  // Try known factory addresses from documentation
  console.log("\n" + "=".repeat(60));
  console.log("📋 Testing Known Factory Addresses");
  console.log("=".repeat(60));
  
  const knownFactories = {
    // From various sources
    PangolinV1: "0xEFA94De7a4656C78De230acaFf18Fb0460f52f5E",
    PangolinV2: "0x666ed4cB30a287507bDA3835E5a19DaD2544F0B3",
    SushiSwap: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    LydiaV1: "0x7bc3216293985266d17c4e54fb9Db1C2bA8396BE",
    LydiaV2: "0x3255F9B8f93B96b7A5b36eA4D93D95979a2BEEF0",
  };
  
  const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
  const USDC = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";
  
  for (const [name, address] of Object.entries(knownFactories)) {
    console.log(`\n${name} Factory: ${address}`);
    
    // Check if contract exists
    const code = await ethers.provider.getCode(address);
    if (code === "0x") {
      console.log(`  ❌ No contract at this address`);
      continue;
    }
    console.log(`  ✅ Contract exists`);
    
    // Try to get WAVAX/USDC pair
    try {
      const factory = new ethers.Contract(address, FACTORY_ABI, ethers.provider);
      const pair = await factory.getPair(WAVAX, USDC);
      if (pair !== ethers.ZeroAddress) {
        console.log(`  ✅ WAVAX/USDC pair: ${pair}`);
      } else {
        console.log(`  ❌ No WAVAX/USDC pair`);
      }
    } catch (e: any) {
      console.log(`  ❌ Error: ${e.message?.slice(0, 60)}`);
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📝 SUMMARY");
  console.log("=".repeat(60));
  console.log("\nIf we found working factories, we need to:");
  console.log("1. Find the correct router for each factory");
  console.log("2. Update our adapter configurations");
  console.log("3. Redeploy adapters with correct addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });