import { ethers } from "hardhat";

/**
 * Find Pangolin's Working Contracts
 */

const ROUTER_ABI = [
  "function factory() view returns (address)",
  "function getAmountsOut(uint256, address[]) view returns (uint256[])",
  "function WETH() view returns (address)",
];

const FACTORY_ABI = [
  "function getPair(address, address) view returns (address)",
  "function allPairsLength() view returns (uint256)",
];

const PAIR_ABI = [
  "function factory() view returns (address)",
  "function getReserves() view returns (uint112, uint112, uint32)",
];

const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";
const PNG = "0x60781C2586D68229fde47564546784ab3fACA982";

async function main() {
  console.log("🔍 Searching for Pangolin Contracts on Avalanche\n");
  
  // Convert addresses inside function to avoid module-level issues
  const PANGOLIN_ROUTERS = [
    "0xE54Ca86531e17Ef3616d11Ca5b4d259Fa0d24756",
    "0x9D9Bcf22B8b08c9045Bd220AA08e227396914b92",
    "0x2f77cEC2377eA84B2792bDDDa36E536f50b6C633",
    "0x1D6a14b5AA10F4Af97384C26E6F8c2b64a7D7d0C",
  ];

  const PANGOLIN_FACTORIES = [
    "0xefa94DE7a4656C78d211230a9760b5809DF662e0",
  ];
  
  // Test each router
  console.log("=".repeat(60));
  console.log("📊 Testing Pangolin Router Addresses");
  console.log("=".repeat(60));
  
  for (const routerAddr of PANGOLIN_ROUTERS) {
    console.log(`\nRouter: ${routerAddr}`);
    
    try {
      const code = await ethers.provider.getCode(routerAddr);
      if (code === "0x") {
        console.log(`  ❌ No contract`);
        continue;
      }
      
      console.log(`  ✅ Contract exists (${code.length} bytes)`);
      
      const router = new ethers.Contract(routerAddr, ROUTER_ABI, ethers.provider);
      
      try {
        const factory = await router.factory();
        console.log(`  Factory: ${factory}`);
        
        // Try quote
        try {
          const amounts = await router.getAmountsOut(ethers.parseEther("0.001"), [WAVAX, USDC]);
          console.log(`  ✅ QUOTE WORKS: ${ethers.formatUnits(amounts[1], 6)} USDC`);
        } catch (e) {
          console.log(`  ⚠️ Quote failed`);
        }
      } catch (e) {
        console.log(`  Not a standard V2 router`);
      }
    } catch (e: any) {
      console.log(`  ❌ Error: ${e.message?.slice(0, 60)}`);
    }
  }
  
  // Test factories
  console.log("\n" + "=".repeat(60));
  console.log("📊 Testing Pangolin Factory Addresses");
  console.log("=".repeat(60));
  
  for (const factoryAddr of PANGOLIN_FACTORIES) {
    console.log(`\nFactory: ${factoryAddr}`);
    
    try {
      const code = await ethers.provider.getCode(factoryAddr);
      if (code === "0x") {
        console.log(`  ❌ No contract`);
        continue;
      }
      
      console.log(`  ✅ Contract exists (${code.length} bytes)`);
      
      const factory = new ethers.Contract(factoryAddr, FACTORY_ABI, ethers.provider);
      
      try {
        const pairLength = await factory.allPairsLength();
        console.log(`  Total pairs: ${pairLength.toString()}`);
        
        // Check for WAVAX/USDC pair
        try {
          const pair = await factory.getPair(WAVAX, USDC);
          if (pair !== ethers.ZeroAddress) {
            console.log(`  ✅ WAVAX/USDC pair: ${pair}`);
            
            // Check reserves
            const pairContract = new ethers.Contract(pair, PAIR_ABI, ethers.provider);
            const reserves = await pairContract.getReserves();
            console.log(`     Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`);
          }
        } catch (e) {
          console.log(`  No WAVAX/USDC pair`);
        }
      } catch (e) {
        console.log(`  Not a standard V2 factory`);
      }
    } catch (e: any) {
      console.log(`  ❌ Error: ${e.message?.slice(0, 60)}`);
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log("\nIf no Pangolin contracts found, they may have:");
  console.log("1. Migrated to new addresses");
  console.log("2. Changed to V3 architecture");
  console.log("3. Be deprecated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });