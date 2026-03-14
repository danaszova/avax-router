import { ethers } from "hardhat";

/**
 * Deploy Adapters to Existing DexRouter on Mainnet
 * DexRouter already deployed at: 0xfb98ae3cbD4564885d58D68CCf8C27566F0F4575
 */

const DEX_ROUTER_ADDRESS = "0xfb98ae3cbD4564885d58D68CCf8C27566F0F4575";

// Helper to get checksummed address
const getAddr = (hex: string) => ethers.getAddress(hex);

// Raw hex addresses (will be checksummed)
const MAINNET_RAW = {
  // Trader Joe V2 (Liquidity Book)
  traderJoeV2Router: "0xb4315e873dbcf96ffd0acd6ea047c66507581979",
  traderJoeV2Factory: "0x5e6420766f31aa7710473b3e7feb23a3e9b5b99a",
  
  // Trader Joe V1 (Uniswap V2 fork)
  traderJoeV1Router: "0x60ae616a2155ee3d9a68541ba4544862310933d4",
  traderJoeV1Factory: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
  
  // Pangolin (Uniswap V2 fork)
  pangolinRouter: "0xe54ca86531e17ef3616d11ca5b4d259fa0d24756",
  pangolinFactory: "0xefa94de7a4656d787667c749f7e1223d71e9fd88",
  
  // SushiSwap (Uniswap V2 fork)
  sushiswapRouter: "0x1b02da8cb0d097eb8d57a175b8897c0240fad033",
  sushiswapFactory: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
  
  // Lydia (Uniswap V2 fork)
  lydiaRouter: "0x52f0e2440dcc7d2fa2f1c6b8a4bbda8d4068dc0b",
  lydiaFactory: "0x7c6beb0d1ecef7b9328d9332975bec7f7a7acc54",
  
  // Platypus
  platypusRouter: "0x09c31ab9b9476b86ddfc929244620dfb5b2b0da6",
  platypusPool: "0x66357dcace80431aee0a7507e4636e79e047bbe5",
};

// Get checksummed addresses
const MAINNET = {
  traderJoeV2Router: getAddr(MAINNET_RAW.traderJoeV2Router),
  traderJoeV2Factory: getAddr(MAINNET_RAW.traderJoeV2Factory),
  traderJoeV1Router: getAddr(MAINNET_RAW.traderJoeV1Router),
  traderJoeV1Factory: getAddr(MAINNET_RAW.traderJoeV1Factory),
  pangolinRouter: getAddr(MAINNET_RAW.pangolinRouter),
  pangolinFactory: getAddr(MAINNET_RAW.pangolinFactory),
  sushiswapRouter: getAddr(MAINNET_RAW.sushiswapRouter),
  sushiswapFactory: getAddr(MAINNET_RAW.sushiswapFactory),
  lydiaRouter: getAddr(MAINNET_RAW.lydiaRouter),
  lydiaFactory: getAddr(MAINNET_RAW.lydiaFactory),
  platypusRouter: getAddr(MAINNET_RAW.platypusRouter),
  platypusPool: getAddr(MAINNET_RAW.platypusPool),
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("🚀 Deploying Adapters to Avalanche Mainnet");
  console.log("==========================================");
  console.log("Deployer account:", deployer.address);
  console.log("DexRouter:", DEX_ROUTER_ADDRESS);
  console.log("Network chain ID:", network.chainId.toString());
  
  // Verify we're on mainnet (chainId 43114)
  if (network.chainId !== 43114n) {
    console.error("❌ Not on Avalanche mainnet! Chain ID should be 43114");
    process.exit(1);
  }
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX");
  
  // Get DexRouter contract
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const dexRouter = DexRouter.attach(DEX_ROUTER_ADDRESS);
  
  const deployedAddresses: Record<string, string> = {
    DexRouter: DEX_ROUTER_ADDRESS,
  };
  
  // 1. Deploy TraderJoe V2 Adapter
  console.log("\n1. Deploying TraderJoe V2 Adapter...");
  const TraderJoeV2Adapter = await ethers.getContractFactory("TraderJoeV2Adapter");
  const tjV2Adapter = await TraderJoeV2Adapter.deploy(
    MAINNET.traderJoeV2Router,
    MAINNET.traderJoeV2Factory
  );
  await tjV2Adapter.waitForDeployment();
  const tjV2Address = await tjV2Adapter.getAddress();
  deployedAddresses.TraderJoeV2Adapter = tjV2Address;
  console.log("✅ TraderJoe V2 Adapter deployed to:", tjV2Address);
  
  // 2. Deploy TraderJoe V1 Adapter (using generic V2 adapter)
  console.log("\n2. Deploying TraderJoe V1 Adapter...");
  const UniswapV2Adapter = await ethers.getContractFactory("UniswapV2Adapter");
  const tjV1Adapter = await UniswapV2Adapter.deploy(
    MAINNET.traderJoeV1Router,
    MAINNET.traderJoeV1Factory,
    "TraderJoe V1"
  );
  await tjV1Adapter.waitForDeployment();
  const tjV1Address = await tjV1Adapter.getAddress();
  deployedAddresses.TraderJoeV1Adapter = tjV1Address;
  console.log("✅ TraderJoe V1 Adapter deployed to:", tjV1Address);
  
  // 3. Deploy Pangolin Adapter
  console.log("\n3. Deploying Pangolin Adapter...");
  const pangolinAdapter = await UniswapV2Adapter.deploy(
    MAINNET.pangolinRouter,
    MAINNET.pangolinFactory,
    "Pangolin"
  );
  await pangolinAdapter.waitForDeployment();
  const pangolinAddress = await pangolinAdapter.getAddress();
  deployedAddresses.PangolinAdapter = pangolinAddress;
  console.log("✅ Pangolin Adapter deployed to:", pangolinAddress);
  
  // 4. Deploy SushiSwap Adapter
  console.log("\n4. Deploying SushiSwap Adapter...");
  const sushiswapAdapter = await UniswapV2Adapter.deploy(
    MAINNET.sushiswapRouter,
    MAINNET.sushiswapFactory,
    "SushiSwap"
  );
  await sushiswapAdapter.waitForDeployment();
  const sushiAddress = await sushiswapAdapter.getAddress();
  deployedAddresses.SushiSwapAdapter = sushiAddress;
  console.log("✅ SushiSwap Adapter deployed to:", sushiAddress);
  
  // 5. Deploy Lydia Adapter
  console.log("\n5. Deploying Lydia Adapter...");
  const lydiaAdapter = await UniswapV2Adapter.deploy(
    MAINNET.lydiaRouter,
    MAINNET.lydiaFactory,
    "Lydia"
  );
  await lydiaAdapter.waitForDeployment();
  const lydiaAddress = await lydiaAdapter.getAddress();
  deployedAddresses.LydiaAdapter = lydiaAddress;
  console.log("✅ Lydia Adapter deployed to:", lydiaAddress);
  
  // 6. Deploy Platypus Adapter
  console.log("\n6. Deploying Platypus Adapter...");
  const PlatypusAdapter = await ethers.getContractFactory("PlatypusAdapter");
  const platypusAdapter = await PlatypusAdapter.deploy(
    MAINNET.platypusRouter,
    MAINNET.platypusPool
  );
  await platypusAdapter.waitForDeployment();
  const platypusAddress = await platypusAdapter.getAddress();
  deployedAddresses.PlatypusAdapter = platypusAddress;
  console.log("✅ Platypus Adapter deployed to:", platypusAddress);
  
  // 7. Register all adapters
  console.log("\n7. Registering all adapters...");
  
  let tx = await dexRouter.registerAdapter("TraderJoeV2", tjV2Address);
  await tx.wait();
  console.log("   ✅ Registered TraderJoe V2");
  
  tx = await dexRouter.registerAdapter("TraderJoeV1", tjV1Address);
  await tx.wait();
  console.log("   ✅ Registered TraderJoe V1");
  
  tx = await dexRouter.registerAdapter("Pangolin", pangolinAddress);
  await tx.wait();
  console.log("   ✅ Registered Pangolin");
  
  tx = await dexRouter.registerAdapter("SushiSwap", sushiAddress);
  await tx.wait();
  console.log("   ✅ Registered SushiSwap");
  
  tx = await dexRouter.registerAdapter("Lydia", lydiaAddress);
  await tx.wait();
  console.log("   ✅ Registered Lydia");
  
  tx = await dexRouter.registerAdapter("Platypus", platypusAddress);
  await tx.wait();
  console.log("   ✅ Registered Platypus");
  
  // 8. Verify registration
  console.log("\n8. Verifying setup...");
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log("   ✅ Registered DEXes:", registeredDexes);
  
  // Print summary
  console.log("\n");
  console.log("🎉 MAINNET DEPLOYMENT COMPLETE!");
  console.log("===============================");
  console.log("Network: Avalanche Mainnet (43114)");
  console.log("");
  console.log("Contract Addresses:");
  console.log("  DexRouter:            ", deployedAddresses.DexRouter);
  console.log("  TraderJoe V2 Adapter: ", deployedAddresses.TraderJoeV2Adapter);
  console.log("  TraderJoe V1 Adapter: ", deployedAddresses.TraderJoeV1Adapter);
  console.log("  Pangolin Adapter:     ", deployedAddresses.PangolinAdapter);
  console.log("  SushiSwap Adapter:    ", deployedAddresses.SushiSwapAdapter);
  console.log("  Lydia Adapter:        ", deployedAddresses.LydiaAdapter);
  console.log("  Platypus Adapter:     ", deployedAddresses.PlatypusAdapter);
  console.log("");
  console.log("View on Snowtrace:");
  console.log(`  https://snowtrace.io/address/${deployedAddresses.DexRouter}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });