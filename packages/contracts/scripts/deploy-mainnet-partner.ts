import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Mainnet Deployment Script - Partner System + DEX Adapters
 * 
 * Deploys in order:
 * 1. PartnerRegistry
 * 2. DexRouter (with PartnerRegistry)
 * 3. Register default partner
 * 4. TraderJoeV1Adapter
 * 5. Register adapter in DexRouter
 * 6. Test quote to verify everything works
 * 
 * Usage: npx hardhat run scripts/deploy-mainnet-partner.ts --network avalanche
 */

// TraderJoe V1 addresses on Avalanche mainnet
const TJ_V1_ROUTER = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const TJ_V1_FACTORY = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";

// Token addresses for testing
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("========================================");
  console.log("🚀 MAINNET DEPLOYMENT - Partner System");
  console.log("========================================");
  console.log("Deployer:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "AVAX");
  
  if (balance < ethers.parseEther("0.1")) {
    console.error("❌ ERROR: Need at least 0.1 AVAX for deployment");
    process.exit(1);
  }

  // Confirm mainnet
  const network = await ethers.provider.getNetwork();
  console.log("Network chainId:", network.chainId.toString());
  if (network.chainId.toString() !== "43114") {
    console.error("❌ ERROR: This script is for Avalanche mainnet (43114) only!");
    process.exit(1);
  }
  
  console.log("\n⏳ Starting deployment in 5 seconds... (Ctrl+C to cancel)");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // ============================================
  // 1. Deploy PartnerRegistry
  // ============================================
  console.log("\n📦 Step 1: Deploying PartnerRegistry...");
  const PartnerRegistry = await ethers.getContractFactory("PartnerRegistry");
  const partnerRegistry = await PartnerRegistry.deploy();
  await partnerRegistry.waitForDeployment();
  const partnerRegistryAddress = await partnerRegistry.getAddress();
  console.log("✅ PartnerRegistry deployed to:", partnerRegistryAddress);

  // ============================================
  // 2. Deploy DexRouter with PartnerRegistry
  // ============================================
  console.log("\n📦 Step 2: Deploying DexRouter...");
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const dexRouter = await DexRouter.deploy(partnerRegistryAddress);
  await dexRouter.waitForDeployment();
  const dexRouterAddress = await dexRouter.getAddress();
  console.log("✅ DexRouter deployed to:", dexRouterAddress);

  // ============================================
  // 3. Verify deployment & setup
  // ============================================
  console.log("\n🔍 Step 3: Verifying deployment...");
  const owner = await dexRouter.owner();
  console.log("DexRouter owner:", owner);
  console.log("PartnerRegistry in DexRouter:", await dexRouter.partnerRegistry());

  // ============================================
  // 4. Register default partner
  // ============================================
  console.log("\n👤 Step 4: Registering default partner...");
  const partnerTx = await partnerRegistry.registerPartner("owner", deployer.address);
  await partnerTx.wait();
  console.log("✅ Registered partner 'owner' ->", deployer.address);

  // ============================================
  // 5. Deploy TraderJoeV1Adapter
  // ============================================
  console.log("\n📦 Step 5: Deploying TraderJoeV1Adapter...");
  const TraderJoeV1Adapter = await ethers.getContractFactory("TraderJoeV1Adapter");
  const tjV1Adapter = await TraderJoeV1Adapter.deploy(TJ_V1_ROUTER, TJ_V1_FACTORY);
  await tjV1Adapter.waitForDeployment();
  const tjV1AdapterAddress = await tjV1Adapter.getAddress();
  console.log("✅ TraderJoeV1Adapter deployed to:", tjV1AdapterAddress);

  // ============================================
  // 6. Register adapter in DexRouter
  // ============================================
  console.log("\n🔗 Step 6: Registering adapter in DexRouter...");
  const regTx = await dexRouter.registerAdapter("TraderJoeV1", tjV1AdapterAddress);
  await regTx.wait();
  console.log("✅ Registered TraderJoeV1 adapter");

  // ============================================
  // 7. Verify setup
  // ============================================
  console.log("\n🔍 Step 7: Verifying complete setup...");
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log("Registered DEXes:", registeredDexes);

  // ============================================
  // 8. Test quote (0.01 AVAX -> USDC)
  // ============================================
  console.log("\n🧪 Step 8: Testing quote (0.01 AVAX -> USDC)...");
  const amountIn = ethers.parseEther("0.01");
  
  try {
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(WAVAX, USDC, amountIn);
    console.log("✅ Best DEX:", bestDex);
    console.log("✅ Amount out:", ethers.formatUnits(bestAmountOut, 6), "USDC");
  } catch (err: any) {
    console.log("❌ findBestRoute error:", err?.message || err);
  }

  // Test adapter directly
  try {
    const adapterQuote = await tjV1Adapter.getAmountOut(WAVAX, USDC, amountIn);
    console.log("✅ Direct adapter quote:", ethers.formatUnits(adapterQuote, 6), "USDC");
  } catch (err: any) {
    console.log("❌ Direct adapter error:", err?.message || err);
  }

  // ============================================
  // Summary
  // ============================================
  console.log("\n========================================");
  console.log("🎉 MAINNET DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("PartnerRegistry:", partnerRegistryAddress);
  console.log("DexRouter:", dexRouterAddress);
  console.log("TraderJoeV1Adapter:", tjV1AdapterAddress);
  console.log("Owner:", owner);
  console.log("Default Partner: 'owner' ->", deployer.address);
  
  console.log("\n📝 Update these in .env:");
  console.log(`PARTNER_REGISTRY_ADDRESS=${partnerRegistryAddress}`);
  console.log(`DEX_ROUTER_ADDRESS=${dexRouterAddress}`);
  console.log(`TRADER_JOE_V1_ADAPTER_ADDRESS=${tjV1AdapterAddress}`);

  // Save deployment info
  const fs = require('fs');
  const path = require('path');
  const deploymentInfo = {
    network: "avalanche",
    chainId: 43114,
    partnerRegistry: partnerRegistryAddress,
    dexRouter: dexRouterAddress,
    traderJoeV1Adapter: tjV1AdapterAddress,
    owner: owner,
    defaultPartner: "owner",
    defaultPartnerAddress: deployer.address,
    deployedAt: new Date().toISOString()
  };
  
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, 'mainnet-partner-system.json'), 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployments/mainnet-partner-system.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });