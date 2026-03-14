import { ethers } from "hardhat";

/**
 * Redeploy adapters with CORRECT WAVAX address
 * 
 * CORRECT WAVAX: 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7
 * This is the address that has liquidity pools on TraderJoe V1
 */

// Existing DexRouter contract
const DEX_ROUTER_ADDRESS = "0xfb98ae3cbD4564885d58D68CCf8C27566F0F4575";

// DEX configurations on Avalanche mainnet
const DEX_CONFIGS = {
  TraderJoeV1: {
    router: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    factory: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
  },
  Pangolin: {
    router: "0xE54ca86531E17ef3616d11cA5B4d259Fa0D24756",
    factory: "0xEFA94De7a4656C78De230acaFf18Fb0460f52f5E",
  },
  SushiSwap: {
    router: "0x1B02dA8cB0d097eB8d57A175B8897c0240FaD033",
    factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  },
  Lydia: {
    router: "0x52f0e2440dcc7d2FA2f1c6B8A4BBDa8D4068Dc0b",
    factory: "0x7bc3216293985266d17c4e54fb9Db1C2bA8396BE",
  },
};

// TraderJoe V2 LBRouter
const TJ_V2_ROUTER = "0xb4315e873DbCf96Fd0acd6EA047c66507581979";
const TJ_V2_FACTORY = "0x5115cABcBb2237c2F1f0467D6d0C6B72B3DDd2E5"; // Will fix checksum

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🔄 Redeploying Adapters with CORRECT WAVAX Address");
  console.log("==================================================");
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("");
  
  // Get DexRouter contract
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const dexRouter = DexRouter.attach(DEX_ROUTER_ADDRESS);
  
  console.log("DexRouter:", DEX_ROUTER_ADDRESS);
  console.log("");
  
  const deployedAdapters: { name: string; address: string }[] = [];
  
  // Deploy UniswapV2Adapter for each V2 DEX
  const UniswapV2Adapter = await ethers.getContractFactory("UniswapV2Adapter");
  
  for (const [name, config] of Object.entries(DEX_CONFIGS)) {
    console.log(`\n📦 Deploying ${name} Adapter...`);
    console.log(`   Router: ${config.router}`);
    console.log(`   Factory: ${config.factory}`);
    
    const adapter = await UniswapV2Adapter.deploy(
      config.router,
      config.factory,
      name
    );
    await adapter.waitForDeployment();
    const adapterAddress = await adapter.getAddress();
    
    console.log(`   ✅ Deployed at: ${adapterAddress}`);
    deployedAdapters.push({ name, address: adapterAddress });
  }
  
  // Skip TraderJoe V2 Adapter for now - factory address needs verification
  console.log(`\n📦 Skipping TraderJoeV2 Adapter (needs factory verification)`);
  // const TraderJoeV2Adapter = await ethers.getContractFactory("TraderJoeV2Adapter");
  // const tjV2Adapter = await TraderJoeV2Adapter.deploy(TJ_V2_ROUTER, TJ_V2_FACTORY);
  // await tjV2Adapter.waitForDeployment();
  // deployedAdapters.push({ name: "TraderJoeV2", address: await tjV2Adapter.getAddress() });
  
  // Skip Platypus Adapter for now - address needs verification
  console.log(`\n📦 Skipping Platypus Adapter (needs address verification)`);
  // const PlatypusAdapter = await ethers.getContractFactory("PlatypusAdapter");
  // const platypusAdapter = await PlatypusAdapter.deploy(PLATYPUS_ROUTER, PLATYPUS_POOL);
  // await platypusAdapter.waitForDeployment();
  // deployedAdapters.push({ name: "Platypus", address: await platypusAdapter.getAddress() });
  
  // Summary
  console.log("\n\n📋 DEPLOYED ADAPTERS SUMMARY");
  console.log("==============================");
  for (const { name, address } of deployedAdapters) {
    console.log(`${name}: ${address}`);
  }
  
  console.log("\n\n📝 NEXT STEPS:");
  console.log("1. Remove old adapters from DexRouter (if needed)");
  console.log("2. Register new adapters with DexRouter");
  console.log("3. Test quotes");
  console.log("4. Update .env with new addresses");
  
  console.log("\n\n🔧 To register adapters, run:");
  console.log("npx hardhat run scripts/register-adapters.ts --network avalanche");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });