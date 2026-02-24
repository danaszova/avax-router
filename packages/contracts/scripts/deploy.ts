import { ethers } from "hardhat";
import hre from "hardhat";

/**
 * Deploy script for Avalanche DEX Router
 * 
 * Mainnet addresses:
 * - Trader Joe LB Router: 0xb4315e873dBcf96Ffd0acd6EA047C66507581979
 * - Trader Joe Factory: 0x5E6420766F31aA7710473b3e7fEB23a3e9b5b99A
 * - Pangolin Router: 0xE54Ca86531e17Ef3616d11Ca5b4d259Fa0d24756
 * - Pangolin Factory: 0xefa94DE7a4656D787667C749f7E1223D71E9FD88
 * 
 * Testnet (Fuji) addresses:
 * - Trader Joe LB Router: 0x8644b5ca4227F3e2a6d393AcAE870693F6a6ea25
 * - Trader Joe Factory: 0x37b97E3Ed7F8DD4aa01EAd0B8AdD6015CC0f86C7
 * - Pangolin Router: 0x2D99ABD9008Dc933ff5c0CD271B88309593aB921
 * - Pangolin Factory: 0x7c5a4D0dB52476B5Cc15C78C1B24d0c1E24dD629
 */

const MAINNET_ADDRESSES = {
  traderJoeRouter: "0xb4315e873dbcf96ffd0acd6ea047c66507581979",
  traderJoeFactory: "0x5e6420766f31aa7710473b3e7feb23a3e9b5b99a",
  pangolinRouter: "0xe54ca86531e17ef3616d11ca5b4d259fa0d24756",
  pangolinFactory: "0xefa94de7a4656d787667c749f7e1223d71e9fd88",
};

const TESTNET_ADDRESSES = {
  traderJoeRouter: "0x8644b5ca4227f3e2a6d393acae870693f6a6ea25",
  traderJoeFactory: "0x37b97e3ed7f8dd4aa01ead0b8add6015cc0f86c7",
  pangolinRouter: "0x2d99abd9008dc933ff5c0cd271b88309593ab921",
  pangolinFactory: "0x7c5a4d0db52476b5cc15c78c1b24d0c1e24dd629",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Network chain ID:", network.chainId);
  
  // Select addresses based on network
  const isMainnet = network.chainId === 43114n;
  const addresses = isMainnet ? MAINNET_ADDRESSES : TESTNET_ADDRESSES;
  
  console.log(`Using ${isMainnet ? 'mainnet' : 'testnet'} addresses`);
  
  // DexRouter already deployed
  const dexRouterAddress = "0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5";
  console.log("\n1. Using existing DexRouter:", dexRouterAddress);
  const dexRouter = await ethers.getContractAt("DexRouter", dexRouterAddress);
  
  // Deploy Trader Joe V2 Adapter
  console.log("\n2. Deploying TraderJoe V2 Adapter...");
  const TraderJoeV2Adapter = await ethers.getContractFactory("TraderJoeV2Adapter");
  const tjAdapter = await TraderJoeV2Adapter.deploy(
    addresses.traderJoeRouter,
    addresses.traderJoeFactory
  );
  await tjAdapter.waitForDeployment();
  const tjAdapterAddress = await tjAdapter.getAddress();
  console.log("TraderJoe V2 Adapter deployed to:", tjAdapterAddress);
  
  // Deploy Pangolin Adapter
  console.log("\n3. Deploying Pangolin Adapter...");
  const PangolinAdapter = await ethers.getContractFactory("PangolinAdapter");
  const pangolinAdapter = await PangolinAdapter.deploy(
    addresses.pangolinRouter,
    addresses.pangolinFactory
  );
  await pangolinAdapter.waitForDeployment();
  const pangolinAdapterAddress = await pangolinAdapter.getAddress();
  console.log("Pangolin Adapter deployed to:", pangolinAdapterAddress);
  
  // Register adapters
  console.log("\n4. Registering adapters...");
  
  let tx = await dexRouter.registerAdapter("TraderJoeV2", tjAdapterAddress);
  await tx.wait();
  console.log("Registered TraderJoe V2 adapter");
  
  tx = await dexRouter.registerAdapter("Pangolin", pangolinAdapterAddress);
  await tx.wait();
  console.log("Registered Pangolin adapter");
  
  // Verify registration
  console.log("\n5. Verifying setup...");
  const registeredDexes = await dexRouter.getRegisteredDexes();
  console.log("Registered DEXes:", registeredDexes);
  
  // Print summary
  console.log("\n=== Deployment Summary ===");
  console.log("DexRouter:", dexRouterAddress);
  console.log("TraderJoe V2 Adapter:", tjAdapterAddress);
  console.log("Pangolin Adapter:", pangolinAdapterAddress);
  console.log("\nSave these addresses for your .env file:");
  console.log(`DEX_ROUTER_ADDRESS=${dexRouterAddress}`);
  console.log(`TRADER_JOE_ADAPTER_ADDRESS=${tjAdapterAddress}`);
  console.log(`PANGOLIN_ADAPTER_ADDRESS=${pangolinAdapterAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });