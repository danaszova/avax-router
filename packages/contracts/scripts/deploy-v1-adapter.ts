import { ethers } from "hardhat";

/**
 * Deploy script for Fresh V1 Contracts (Uncompromised)
 * 
 * TraderJoe V1 addresses on Avalanche mainnet:
 * - Router: 0x60aE616a2155Ee3d9A68541Ba4544862310933d4
 * - Factory: 0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10
 * 
 * CORRECT WAVAX: 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7
 */

const TJ_V1_ROUTER = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const TJ_V1_FACTORY = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";

// CORRECT WAVAX address (verified on-chain)
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("========================================");
  console.log("Deploying FRESH V1 Contracts");
  console.log("========================================");
  console.log("Deployer:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "AVAX");
  
  if (balance < ethers.parseEther("0.1")) {
    console.error("ERROR: Need at least 0.1 AVAX for deployment");
    process.exit(1);
  }

  // 1. Deploy DexRouter
  console.log("\n1. Deploying DexRouter...");
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const dexRouter = await DexRouter.deploy();
  await dexRouter.waitForDeployment();
  const dexRouterAddress = await dexRouter.getAddress();
  console.log("DexRouter deployed to:", dexRouterAddress);

  // 2. Deploy TraderJoe V1 Adapter
  console.log("\n2. Deploying TraderJoeV1Adapter...");
  const TraderJoeV1Adapter = await ethers.getContractFactory("TraderJoeV1Adapter");
  const tjV1Adapter = await TraderJoeV1Adapter.deploy(TJ_V1_ROUTER, TJ_V1_FACTORY);
  await tjV1Adapter.waitForDeployment();
  const tjV1AdapterAddress = await tjV1Adapter.getAddress();
  console.log("TraderJoeV1Adapter deployed to:", tjV1AdapterAddress);

  // 3. Register adapter in DexRouter
  console.log("\n3. Registering adapter in DexRouter...");
  const tx1 = await dexRouter.registerAdapter("TraderJoeV1", tjV1AdapterAddress);
  await tx1.wait();
  console.log("Registered TraderJoeV1 adapter");

  // 4. Verify registration
  console.log("\n4. Verifying setup...");
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log("Registered DEXes:", registeredDexes);

  // 5. Test quote with CORRECT WAVAX address
  console.log("\n5. Testing quote (0.01 AVAX -> USDC)...");
  const amountIn = ethers.parseEther("0.01");
  
  try {
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(WAVAX, USDC, amountIn);
    console.log("✅ Best DEX:", bestDex);
    console.log("✅ Amount out:", ethers.formatUnits(bestAmountOut, 6), "USDC");
  } catch (err) {
    console.log("❌ Quote error:", err);
  }

  // 6. Test adapter directly
  console.log("\n6. Testing adapter directly...");
  try {
    const adapterQuote = await tjV1Adapter.getAmountOut(WAVAX, USDC, amountIn);
    console.log("✅ Direct adapter quote:", ethers.formatUnits(adapterQuote, 6), "USDC");
  } catch (err) {
    console.log("❌ Direct adapter error:", err);
  }

  console.log("\n========================================");
  console.log("=== DEPLOYMENT COMPLETE ===");
  console.log("========================================");
  console.log("DexRouter:", dexRouterAddress);
  console.log("TraderJoeV1Adapter:", tjV1AdapterAddress);
  console.log("\nUpdate these addresses in:");
  console.log("- packages/api/src/services/dex-apis.ts");
  console.log("- packages/api/src/services/router.ts");
  console.log("- packages/widget/src/utils/constants.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
