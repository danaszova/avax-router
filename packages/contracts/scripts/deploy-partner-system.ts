import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying PartnerRegistry and DexRouter with partner system...");
  console.log("Deployer address:", deployer.address);

  // Get network
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Deploy PartnerRegistry first
  console.log("\n1. Deploying PartnerRegistry...");
  const PartnerRegistry = await ethers.getContractFactory("PartnerRegistry");
  const partnerRegistry = await PartnerRegistry.deploy();
  await partnerRegistry.waitForDeployment();
  const partnerRegistryAddress = await partnerRegistry.getAddress();
  console.log("PartnerRegistry deployed to:", partnerRegistryAddress);

  // Deploy DexRouter with PartnerRegistry address
  console.log("\n2. Deploying DexRouter with PartnerRegistry address...");
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const dexRouter = await DexRouter.deploy(partnerRegistryAddress);
  await dexRouter.waitForDeployment();
  const dexRouterAddress = await dexRouter.getAddress();
  console.log("DexRouter deployed to:", dexRouterAddress);

  // Verify deployment
  console.log("\n3. Verifying deployment...");
  const owner = await dexRouter.owner();
  console.log("DexRouter owner:", owner);
  console.log("PartnerRegistry address in DexRouter:", await dexRouter.partnerRegistry());

  // Register deployer as default partner
  console.log("\n4. Registering deployer as default partner 'owner'...");
  const tx = await partnerRegistry.registerPartner("owner", deployer.address);
  await tx.wait();
  console.log("Registered partner 'owner' ->", deployer.address);

  console.log("\n=== Deployment Complete ===");
  console.log("PartnerRegistry:", partnerRegistryAddress);
  console.log("DexRouter:", dexRouterAddress);
  console.log("Owner (gets default partner fees):", owner);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    partnerRegistry: partnerRegistryAddress,
    dexRouter: dexRouterAddress,
    owner: owner,
    defaultPartner: "owner",
    defaultPartnerAddress: deployer.address,
    deployedAt: new Date().toISOString()
  };
  
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '../deployments', `partner-system-${network.name}.json`);
  
  // Ensure deployments directory exists
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentPath}`);
  
  console.log("\n=== Add to your .env file ===");
  console.log(`PARTNER_REGISTRY_ADDRESS=${partnerRegistryAddress}`);
  console.log(`DEX_ROUTER_ADDRESS=${dexRouterAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });