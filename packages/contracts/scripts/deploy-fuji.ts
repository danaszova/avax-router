import { ethers } from "hardhat";

/**
 * Deploy script for Fuji Testnet
 * Note: Using getAddress to properly checksum addresses
 */
const getAddr = (hex: string) => ethers.getAddress(hex);

// Raw hex addresses (will be checksummed by getAddr)
const FUJI_RAW = {
  // WAVAX
  WAVAX: "0xd00ae08403b9bbb9124bb305c09058e32c39a48c",
  
  // Trader Joe V2 (Liquidity Book)
  traderJoeV2Router: "0x8644b5ca4227f3e2a6d393acae870693f6a6ea25",
  traderJoeV2Factory: "0x37b97e3ed7f8dd4aa01ead0b8add6015cc0f86c7",
  
  // Trader Joe V1 / Pangolin (same on Fuji)
  traderJoeV1Router: "0x2d99abd9008dc933ff5c0cd271b88309593ab921",
  traderJoeV1Factory: "0x7c5a4d0db52476b5cc15c78c1b24d0c1e24dd629",
  
  // Pangolin (Uniswap V2 fork)
  pangolinRouter: "0x2d99abd9008dc933ff5c0cd271b88309593ab921",
  pangolinFactory: "0x7c5a4d0db52476b5cc15c78c1b24d0c1e24dd629",
};

// Get checksummed addresses
const FUJI_ADDRESSES = {
  WAVAX: getAddr(FUJI_RAW.WAVAX),
  traderJoeV2Router: getAddr(FUJI_RAW.traderJoeV2Router),
  traderJoeV2Factory: getAddr(FUJI_RAW.traderJoeV2Factory),
  traderJoeV1Router: getAddr(FUJI_RAW.traderJoeV1Router),
  traderJoeV1Factory: getAddr(FUJI_RAW.traderJoeV1Factory),
  pangolinRouter: getAddr(FUJI_RAW.pangolinRouter),
  pangolinFactory: getAddr(FUJI_RAW.pangolinFactory),
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("🚀 Deploying to Fuji Testnet");
  console.log("============================");
  console.log("Deployer account:", deployer.address);
  console.log("Network chain ID:", network.chainId.toString());
  
  // Verify we're on Fuji (chainId 43113)
  if (network.chainId !== 43113n) {
    console.error("❌ Not on Fuji testnet! Chain ID should be 43113");
    process.exit(1);
  }
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX");
  
  if (balance < ethers.parseEther("0.1")) {
    console.error("❌ Insufficient balance. Get test AVAX from faucet: https://faucet.avax.network/");
    process.exit(1);
  }
  
  const deployedAddresses: Record<string, string> = {};
  
  // 1. Deploy DexRouter
  console.log("\n1. Deploying DexRouter...");
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const dexRouter = await DexRouter.deploy();
  await dexRouter.waitForDeployment();
  const dexRouterAddress = await dexRouter.getAddress();
  deployedAddresses.DexRouter = dexRouterAddress;
  console.log("✅ DexRouter deployed to:", dexRouterAddress);
  
  // 2. Deploy TraderJoe V2 Adapter
  console.log("\n2. Deploying TraderJoe V2 Adapter...");
  const TraderJoeV2Adapter = await ethers.getContractFactory("TraderJoeV2Adapter");
  const tjV2Adapter = await TraderJoeV2Adapter.deploy(
    FUJI_ADDRESSES.traderJoeV2Router,
    FUJI_ADDRESSES.traderJoeV2Factory
  );
  await tjV2Adapter.waitForDeployment();
  const tjV2Address = await tjV2Adapter.getAddress();
  deployedAddresses.TraderJoeV2Adapter = tjV2Address;
  console.log("✅ TraderJoe V2 Adapter deployed to:", tjV2Address);
  
  // 3. Deploy TraderJoe V1 Adapter (using generic V2 adapter)
  console.log("\n3. Deploying TraderJoe V1 Adapter...");
  const UniswapV2Adapter = await ethers.getContractFactory("UniswapV2Adapter");
  const tjV1Adapter = await UniswapV2Adapter.deploy(
    FUJI_ADDRESSES.traderJoeV1Router,
    FUJI_ADDRESSES.traderJoeV1Factory,
    "TraderJoe V1"
  );
  await tjV1Adapter.waitForDeployment();
  const tjV1Address = await tjV1Adapter.getAddress();
  deployedAddresses.TraderJoeV1Adapter = tjV1Address;
  console.log("✅ TraderJoe V1 Adapter deployed to:", tjV1Address);
  
  // 4. Deploy Pangolin Adapter
  console.log("\n4. Deploying Pangolin Adapter...");
  const pangolinAdapter = await UniswapV2Adapter.deploy(
    FUJI_ADDRESSES.pangolinRouter,
    FUJI_ADDRESSES.pangolinFactory,
    "Pangolin"
  );
  await pangolinAdapter.waitForDeployment();
  const pangolinAddress = await pangolinAdapter.getAddress();
  deployedAddresses.PangolinAdapter = pangolinAddress;
  console.log("✅ Pangolin Adapter deployed to:", pangolinAddress);
  
  // 5. Register all adapters
  console.log("\n5. Registering all adapters...");
  
  let tx = await dexRouter.registerAdapter("TraderJoeV2", tjV2Address);
  await tx.wait();
  console.log("   ✅ Registered TraderJoe V2");
  
  tx = await dexRouter.registerAdapter("TraderJoeV1", tjV1Address);
  await tx.wait();
  console.log("   ✅ Registered TraderJoe V1");
  
  tx = await dexRouter.registerAdapter("Pangolin", pangolinAddress);
  await tx.wait();
  console.log("   ✅ Registered Pangolin");
  
  // 6. Verify registration
  console.log("\n6. Verifying setup...");
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log("   ✅ Registered DEXes:", registeredDexes);
  
  // Print summary
  console.log("\n");
  console.log("🎉 FUJI DEPLOYMENT COMPLETE!");
  console.log("============================");
  console.log("Network: Fuji Testnet (43113)");
  console.log("");
  console.log("Contract Addresses:");
  console.log("  DexRouter:            ", deployedAddresses.DexRouter);
  console.log("  TraderJoe V2 Adapter: ", deployedAddresses.TraderJoeV2Adapter);
  console.log("  TraderJoe V1 Adapter: ", deployedAddresses.TraderJoeV1Adapter);
  console.log("  Pangolin Adapter:     ", deployedAddresses.PangolinAdapter);
  console.log("");
  console.log("Add to your .env file:");
  console.log(`DEX_ROUTER_ADDRESS=${deployedAddresses.DexRouter}`);
  console.log("");
  console.log("View on Snowtrace:");
  console.log(`  https://testnet.snowtrace.io/address/${deployedAddresses.DexRouter}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });