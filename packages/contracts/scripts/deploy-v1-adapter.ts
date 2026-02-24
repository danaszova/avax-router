import { ethers } from "hardhat";

/**
 * Deploy script for TraderJoe V1 Adapter
 * 
 * TraderJoe V1 addresses on Avalanche mainnet:
 * - Router: 0x60aE616a2155Ee3d9A68541Ba4544862310933d4
 * - Factory: 0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10
 */

const TJ_V1_ROUTER = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const TJ_V1_FACTORY = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";
const DEX_ROUTER_ADDRESS = "0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying TraderJoe V1 Adapter");
  console.log("===============================");
  console.log("Deployer:", deployer.address);
  
  // Deploy TraderJoe V1 Adapter
  console.log("\n1. Deploying TraderJoeV1Adapter...");
  const TraderJoeV1Adapter = await ethers.getContractFactory("TraderJoeV1Adapter");
  const tjV1Adapter = await TraderJoeV1Adapter.deploy(TJ_V1_ROUTER, TJ_V1_FACTORY);
  await tjV1Adapter.waitForDeployment();
  const tjV1AdapterAddress = await tjV1Adapter.getAddress();
  console.log("TraderJoeV1Adapter deployed to:", tjV1AdapterAddress);

  // Register in DexRouter
  console.log("\n2. Registering in DexRouter...");
  const dexRouter = await ethers.getContractAt("DexRouter", DEX_ROUTER_ADDRESS);
  
  // First, remove the old V2 adapter
  try {
    const tx1 = await dexRouter.removeAdapter("TraderJoeV2");
    await tx1.wait();
    console.log("Removed old TraderJoeV2 adapter");
  } catch (err) {
    console.log("Note: Could not remove V2 adapter (may not exist)");
  }
  
  // Register the new V1 adapter
  const tx2 = await dexRouter.registerAdapter("TraderJoeV1", tjV1AdapterAddress);
  await tx2.wait();
  console.log("Registered TraderJoeV1 adapter");

  // Verify registration
  console.log("\n3. Verifying setup...");
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log("Registered DEXes:", registeredDexes);

  // Test quote
  console.log("\n4. Testing quote (0.01 AVAX -> USDC)...");
  const AVAX = "0xB31f66Aa3C1eE3B4Dd11E3A23d8e14D7254C2d6C";
  const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
  const amountIn = ethers.parseEther("0.01");
  
  try {
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(AVAX, USDC, amountIn);
    console.log("Best DEX:", bestDex);
    console.log("Amount out:", ethers.formatUnits(bestAmountOut, 6), "USDC");
  } catch (err) {
    console.log("Quote error:", err);
  }

  console.log("\n=== Deployment Complete ===");
  console.log("TraderJoeV1Adapter:", tjV1AdapterAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });