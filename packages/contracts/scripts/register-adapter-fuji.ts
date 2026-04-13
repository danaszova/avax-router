import { ethers } from "hardhat";

/**
 * Deploy TraderJoeV1Adapter and register with existing DexRouter on Fuji
 * 
 * Fuji testnet addresses:
 * - DexRouter: 0xc4396498B42DE35D38CE47c38e75240a49B5452a
 * - TraderJoe V1 Router: 0x60aE616a2155Ee3d9A68541Ba4544862310933d4 (same as mainnet)
 * - TraderJoe V1 Factory: 0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10 (same as mainnet)
 */

const DEX_ROUTER = "0xc4396498B42DE35D38CE47c38e75240a49B5452a";
const TJ_V1_ROUTER = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";
const TJ_V1_FACTORY = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying and registering TraderJoeV1Adapter on Fuji...");
  console.log("Deployer:", deployer.address);
  
  // Get DexRouter contract
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const dexRouter = DexRouter.attach(DEX_ROUTER);
  
  // Deploy TraderJoe V1 Adapter
  console.log("\n1. Deploying TraderJoeV1Adapter...");
  const TraderJoeV1Adapter = await ethers.getContractFactory("TraderJoeV1Adapter");
  const tjV1Adapter = await TraderJoeV1Adapter.deploy(TJ_V1_ROUTER, TJ_V1_FACTORY);
  await tjV1Adapter.waitForDeployment();
  const tjV1AdapterAddress = await tjV1Adapter.getAddress();
  console.log("TraderJoeV1Adapter deployed to:", tjV1AdapterAddress);
  
  // Register adapter in DexRouter
  console.log("\n2. Registering adapter in DexRouter...");
  const tx = await dexRouter.registerAdapter("TraderJoeV1", tjV1AdapterAddress);
  await tx.wait();
  console.log("Registered TraderJoeV1 adapter");
  
  // Verify registration
  console.log("\n3. Verifying registration...");
  const adapter = await dexRouter.adapters("TraderJoeV1");
  console.log("Adapter address in DexRouter:", adapter);
  
  console.log("\n=== Registration Complete ===");
  console.log("TraderJoeV1Adapter:", tjV1AdapterAddress);
  console.log("DexRouter:", DEX_ROUTER);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Registration failed:", error);
    process.exit(1);
  });