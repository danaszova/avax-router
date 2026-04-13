import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const DEX_ROUTER = "0x81308B8e4C72E5aA042ADA30f9b29729c5a43098";
const TJ_ADAPTER = "0x108831f20954211336704eaE0483e887a7bfd3A1";

const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";

async function main() {
  console.log("🔍 Verifying Mainnet Quotes...\n");

  const dexRouter = await ethers.getContractAt("DexRouter", DEX_ROUTER);
  const adapter = await ethers.getContractAt("TraderJoeV1Adapter", TJ_ADAPTER);

  // Verify setup
  console.log("✅ DexRouter owner:", await dexRouter.owner());
  console.log("✅ PartnerRegistry:", await dexRouter.partnerRegistry());
  console.log("✅ TraderJoeV1 adapter:", await dexRouter.adapters("TraderJoeV1"));

  // Test quotes
  const amountIn = ethers.parseEther("0.01");
  console.log("\n🧪 Testing 0.01 AVAX -> USDC...");
  
  try {
    const out = await adapter.getAmountOut(WAVAX, USDC, amountIn);
    console.log("✅ Direct adapter quote:", ethers.formatUnits(out, 6), "USDC");
  } catch (e: any) {
    console.log("❌ Direct adapter error:", e?.message?.substring(0, 150));
  }

  try {
    const [bestDex, bestAmountOut] = await dexRouter.findBestRoute(WAVAX, USDC, amountIn);
    console.log("✅ findBestRoute:", bestDex, "->", ethers.formatUnits(bestAmountOut, 6), "USDC");
  } catch (e: any) {
    console.log("❌ findBestRoute error:", e?.message?.substring(0, 150));
  }

  // Test with USDC -> WAVAX too
  console.log("\n🧪 Testing 1 USDC -> AVAX...");
  const usdcAmount = ethers.parseUnits("1", 6);
  try {
    const out = await adapter.getAmountOut(USDC, WAVAX, usdcAmount);
    console.log("✅ Direct adapter quote:", ethers.formatEther(out), "AVAX");
  } catch (e: any) {
    console.log("❌ USDC->AVAX error:", e?.message?.substring(0, 150));
  }

  console.log("\n🎉 Verification complete!");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });