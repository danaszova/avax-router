import { ethers } from "hardhat";

/**
 * Debug script to check if pairs exist on DEXes
 */

const TOKENS = {
  WAVAX: "0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C",
  USDC: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // Bridged
  USDC_NATIVE: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // Native
  JOE: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
};

const FACTORIES = {
  traderJoeV1: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
  pangolin: "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
  sushiswap: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  lydia: "0x7c6beB0d1ECEf7b9328D9332975Bec7f7A7Acc54",
};

const ROUTERS = {
  traderJoeV1: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
  pangolin: "0xE54ca86531E17ef3616d11cA5B4d259Fa0D24756",
  sushiswap: "0x1B02dA8cB0d097eB8d57A175B8897c0240FaD033",
  lydia: "0x52f0e2440dcc7d2FA2f1c6B8A4BBDa8D4068Dc0b",
};

// Minimal ABI
const FACTORY_ABI = [
  "function getPair(address,address) view returns (address)"
];

const ROUTER_ABI = [
  "function getAmountsOut(uint256,address[]) view returns (uint256[])",
  "function factory() view returns (address)"
];

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("🔍 Debugging DEX Pairs on Avalanche Mainnet");
  console.log("============================================");
  
  const amountIn = ethers.parseEther("0.001"); // 0.001 AVAX
  
  // Test pairs: WAVAX -> JOE, WAVAX -> USDC
  const testPairs = [
    { name: "WAVAX -> JOE", tokenA: TOKENS.WAVAX, tokenB: TOKENS.JOE },
    { name: "WAVAX -> USDC (Bridged)", tokenA: TOKENS.WAVAX, tokenB: TOKENS.USDC },
    { name: "WAVAX -> USDC (Native)", tokenA: TOKENS.WAVAX, tokenB: TOKENS.USDC_NATIVE },
  ];
  
  // First, get actual factory addresses from routers
  console.log("\n📋 Getting Factory Addresses from Routers:");
  for (const [dexName, routerAddr] of Object.entries(ROUTERS)) {
    const router = new ethers.Contract(routerAddr, ROUTER_ABI, signer);
    try {
      const factoryFromRouter = await router.factory();
      const expectedFactory = FACTORIES[dexName as keyof typeof FACTORIES];
      const match = factoryFromRouter.toLowerCase() === expectedFactory.toLowerCase();
      console.log(`   ${dexName}: ${factoryFromRouter} ${match ? '✅' : '❌ (expected: ' + expectedFactory + ')'}`);
    } catch (e: any) {
      console.log(`   ${dexName}: Failed to get factory - ${e.message?.slice(0, 40)}`);
    }
  }
  
  // Try direct router calls
  console.log("\n\n🔥 Trying Direct Router Calls (bypassing factory check):");
  for (const [dexName, routerAddr] of Object.entries(ROUTERS)) {
    console.log(`\n📍 ${dexName.toUpperCase()}`);
    console.log(`   Router: ${routerAddr}`);
    
    const router = new ethers.Contract(routerAddr, ROUTER_ABI, signer);
    
    for (const pair of testPairs) {
      try {
        const amounts = await router.getAmountsOut(amountIn, [pair.tokenA, pair.tokenB]);
        console.log(`   ✅ ${pair.name}: ${ethers.formatUnits(amounts[1], pair.tokenB === TOKENS.USDC_NATIVE ? 6 : 18)} output`);
      } catch (e: any) {
        console.log(`   ❌ ${pair.name}: ${e.message?.slice(0, 60)}`);
      }
    }
  }
  
  // Also check our adapters directly
  console.log("\n\n🔗 Testing Our Adapters");
  console.log("========================");
  
  const DEX_ROUTER_ADDRESS = "0xfb98ae3cbD4564885d58D68CCf8C27566F0F4575";
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const router = DexRouter.attach(DEX_ROUTER_ADDRESS);
  
  const adapters = await router.getRegisteredDexes();
  console.log("Registered DEXes:", adapters);
  
  // Check adapter addresses
  for (const dexName of adapters) {
    const adapterAddr = await router.adapters(dexName);
    console.log(`   ${dexName}: ${adapterAddr}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Debug failed:", error);
    process.exit(1);
  });