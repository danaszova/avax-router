import { ethers } from "hardhat";

/**
 * Remove broken Pangolin adapter from DexRouter
 */

const DEX_ROUTER_ADDRESS = "0x3ff7faad7417130c60b7422de712ead9a7c2e3b5";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Removing Pangolin adapter");
  console.log("Deployer:", deployer.address);
  
  const dexRouter = await ethers.getContractAt("DexRouter", DEX_ROUTER_ADDRESS);
  
  // Remove Pangolin
  try {
    const tx = await dexRouter.removeAdapter("Pangolin");
    await tx.wait();
    console.log("✅ Removed Pangolin adapter");
  } catch (err) {
    console.log("Note: Could not remove Pangolin adapter");
    console.log(err);
  }

  // Verify registration
  console.log("\n=== Current DEXes ===");
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log("Registered DEXes:", registeredDexes);

  // Test quote
  console.log("\n=== Testing Quote ===");
  const AVAX = "0xB31f66Aa3C1eE3B4Dd11E3A23d8e14D7254C2d6C";
  const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
  const amountIn = ethers.parseEther("0.1");
  
  try {
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(AVAX, USDC, amountIn);
    console.log("Best DEX:", bestDex);
    console.log("Amount out:", ethers.formatUnits(bestAmountOut, 6), "USDC");
  } catch (err) {
    console.log("Quote error:", err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });