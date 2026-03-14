import { ethers } from "hardhat";

/**
 * Register newly deployed adapters with DexRouter
 */

const DEX_ROUTER_ADDRESS = "0xfb98ae3cbD4564885d58D68CCf8C27566F0F4575";

// Newly deployed adapters with CORRECT WAVAX address
const NEW_ADAPTERS = {
  "TraderJoeV1": "0x23682D6f8539497435BdC2Cfa5BC6B14d278962B",
  "Pangolin": "0x8cC366b4Ea18a35CaCbfEC0a52A7f08D1676A49E",
  "SushiSwap": "0xD502FD801C6E73B4CF15F6839f1F01285b970Ea7",
  "Lydia": "0xD58382ECA2Ef882F23C59fb1c960B1237e2a20f5",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Registering New Adapters with DexRouter");
  console.log("==========================================");
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("");
  
  // Get DexRouter contract
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const dexRouter = DexRouter.attach(DEX_ROUTER_ADDRESS);
  
  console.log("DexRouter:", DEX_ROUTER_ADDRESS);
  console.log("");
  
  // First, check current registered DEXes
  console.log("📋 Current registered DEXes:");
  try {
    const currentDexes = await dexRouter.getRegisteredDexes();
    for (const dex of currentDexes) {
      console.log(`   - ${dex}`);
    }
  } catch (e) {
    console.log("   (none or error reading)");
  }
  console.log("");
  
  // Register new adapters
  for (const [name, address] of Object.entries(NEW_ADAPTERS)) {
    console.log(`\n📦 Registering ${name}...`);
    console.log(`   Adapter: ${address}`);
    
    try {
      // Check if already registered
      const existingAdapter = await dexRouter.adapters(name);
      if (existingAdapter !== ethers.ZeroAddress) {
        console.log(`   ⚠️  Already registered at ${existingAdapter}`);
        console.log(`   Removing old adapter first...`);
        
        const removeTx = await dexRouter.removeAdapter(name);
        await removeTx.wait();
        console.log(`   ✅ Removed old adapter`);
      }
      
      // Register new adapter
      const tx = await dexRouter.registerAdapter(name, address);
      await tx.wait();
      console.log(`   ✅ Registered successfully`);
    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message}`);
    }
  }
  
  // Verify registration
  console.log("\n\n📋 Final registered DEXes:");
  const finalDexes = await dexRouter.getRegisteredDexes();
  for (const dex of finalDexes) {
    const adapter = await dexRouter.adapters(dex);
    console.log(`   - ${dex}: ${adapter}`);
  }
  
  console.log("\n✅ Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });