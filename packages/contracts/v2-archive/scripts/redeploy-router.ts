import { ethers } from "hardhat";

/**
 * Redeploy DexRouter with CORRECT WAVAX address
 * 
 * The old router has wrong WAVAX hardcoded
 */

// Newly deployed adapters with CORRECT WAVAX address
const ADAPTERS = {
  "TraderJoeV1": "0x23682D6f8539497435BdC2Cfa5BC6B14d278962B",
  "Pangolin": "0x8cC366b4Ea18a35CaCbfEC0a52A7f08D1676A49E",
  "SushiSwap": "0xD502FD801C6E73B4CF15F6839f1F01285b970Ea7",
  "Lydia": "0xD58382ECA2Ef882F23C59fb1c960B1237e2a20f5",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🔄 Redeploying DexRouter with CORRECT WAVAX");
  console.log("============================================");
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("");
  
  // Deploy new DexRouter
  console.log("📦 Deploying DexRouter...");
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const router = await DexRouter.deploy();
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  
  console.log(`   ✅ DexRouter deployed at: ${routerAddress}`);
  console.log("");
  
  // Register adapters
  console.log("📝 Registering adapters...");
  for (const [name, address] of Object.entries(ADAPTERS)) {
    console.log(`   Registering ${name}...`);
    const tx = await router.registerAdapter(name, address);
    await tx.wait();
    console.log(`   ✅ ${name} registered`);
  }
  
  // Verify
  console.log("\n📋 Registered DEXes:");
  const dexes = await router.getRegisteredDexes();
  for (const dex of dexes) {
    const adapter = await router.adapters(dex);
    console.log(`   - ${dex}: ${adapter}`);
  }
  
  console.log("\n\n✅ NEW DEXROUTER DEPLOYED!");
  console.log("==========================");
  console.log(`   Address: ${routerAddress}`);
  console.log(`   WAVAX: 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7`);
  console.log("");
  console.log("📝 Update your .env and frontend with the new router address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });