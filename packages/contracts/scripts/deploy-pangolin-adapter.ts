import { ethers } from "hardhat";

/**
 * Deploy Pangolin V2 Adapter and register with existing DexRouter
 * 
 * Pangolin V2 addresses on Avalanche mainnet (from official SDK):
 * https://github.com/pangolindex/sdk/blob/master/src/chains.ts
 * 
 * - Router:  0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106
 * - Factory: 0xefa94DE7a4656D787667C749f7E1223D71E9FD88
 * 
 * Existing DexRouter: 0x81308B8e4C72E5aA042ADA30f9b29729c5a43098
 */

const PANGOLIN_ROUTER = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
const PANGOLIN_FACTORY = "0xefa94DE7a4656D787667C749f7E1223D71E9FD88";

// Existing deployed contracts
const DEX_ROUTER_ADDRESS = "0x81308B8e4C72E5aA042ADA30f9b29729c5a43098";

// Token addresses
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
const USDT = "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7";
const PNG = "0x60781C2586D68229fde47564546784ab3fACA982";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("========================================");
  console.log("Deploying Pangolin V2 Adapter");
  console.log("========================================");
  console.log("Deployer:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "AVAX");
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("ERROR: Need at least 0.01 AVAX for deployment");
    process.exit(1);
  }

  // 1. Verify Pangolin contracts exist on-chain
  console.log("\n1. Verifying Pangolin contracts...");
  
  const routerCode = await ethers.provider.getCode(PANGOLIN_ROUTER);
  const factoryCode = await ethers.provider.getCode(PANGOLIN_FACTORY);
  
  if (routerCode === "0x") {
    console.error("ERROR: Pangolin router not found at", PANGOLIN_ROUTER);
    process.exit(1);
  }
  console.log("✅ Pangolin Router exists at:", PANGOLIN_ROUTER);
  
  if (factoryCode === "0x") {
    console.error("ERROR: Pangolin factory not found at", PANGOLIN_FACTORY);
    process.exit(1);
  }
  console.log("✅ Pangolin Factory exists at:", PANGOLIN_FACTORY);

  // 2. Deploy PangolinV2Adapter
  console.log("\n2. Deploying PangolinV2Adapter...");
  const PangolinV2Adapter = await ethers.getContractFactory("PangolinV2Adapter");
  const pangolinAdapter = await PangolinV2Adapter.deploy(PANGOLIN_ROUTER, PANGOLIN_FACTORY);
  await pangolinAdapter.waitForDeployment();
  const pangolinAdapterAddress = await pangolinAdapter.getAddress();
  console.log("✅ PangolinV2Adapter deployed to:", pangolinAdapterAddress);

  // 3. Verify adapter works (test quote)
  console.log("\n3. Testing adapter quote...");
  const amountIn = ethers.parseEther("0.001");
  
  try {
    const quote = await pangolinAdapter.getAmountOut(WAVAX, USDC, amountIn);
    console.log("✅ Pangolin quote: 0.001 AVAX ->", ethers.formatUnits(quote, 6), "USDC");
  } catch (err: any) {
    console.log("⚠️ Quote test failed:", err.message?.slice(0, 100));
  }

  // 4. Check WAVAX/PNG pair
  try {
    const hasPool = await pangolinAdapter.hasPool(WAVAX, PNG);
    console.log("WAVAX/PNG pool exists:", hasPool ? "✅ Yes" : "❌ No");
  } catch (err: any) {
    console.log("⚠️ Pool check failed:", err.message?.slice(0, 100));
  }

  // 5. Register adapter with existing DexRouter
  console.log("\n4. Registering with DexRouter...");
  const dexRouter = await ethers.getContractAt("DexRouter", DEX_ROUTER_ADDRESS);
  
  try {
    const tx = await dexRouter.registerAdapter("Pangolin V2", pangolinAdapterAddress);
    await tx.wait();
    console.log("✅ Registered Pangolin V2 adapter with DexRouter");
  } catch (err: any) {
    console.log("⚠️ Registration failed (may already be registered):", err.message?.slice(0, 100));
  }

  // 6. Verify best route now compares both DEXes
  console.log("\n5. Testing findBestRoute with 2 DEXes...");
  try {
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(WAVAX, USDC, amountIn);
    console.log("✅ Best DEX:", bestDex);
    console.log("✅ Best amount:", ethers.formatUnits(bestAmountOut, 6), "USDC");
  } catch (err: any) {
    console.log("⚠️ Best route test failed:", err.message?.slice(0, 100));
  }

  console.log("\n========================================");
  console.log("=== DEPLOYMENT COMPLETE ===");
  console.log("========================================");
  console.log("PangolinV2Adapter:", pangolinAdapterAddress);
  console.log("DexRouter:", DEX_ROUTER_ADDRESS);
  console.log("\n🎉 We now have 2 DEXes: TraderJoe V1 + Pangolin V2!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
