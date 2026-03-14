import { ethers } from "hardhat";

/**
 * Test Swap Script for Avalanche Mainnet
 * 
 * Tests the DexRouter with a small AVAX -> USDC swap
 * Amount: 0.001 AVAX (~$0.05)
 */

// NEW DexRouter with CORRECT WAVAX address
const DEX_ROUTER_ADDRESS = "0x919383A49341f1EeccB6F3Da14d7497e481869d9";

// Mainnet token addresses
// CORRECT WAVAX: 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7 (has liquidity on TraderJoe V1)
const TOKENS = {
  WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  // Native USDC (Circle) - newer, less liquidity on some DEXes
  USDC_NATIVE: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  // Bridged USDC (from Ethereum) - more liquidity on older DEXes
  USDC: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
  USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  // JOE token for testing
  JOE: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
};

const getAddr = (hex: string) => ethers.getAddress(hex);

async function main() {
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("🧪 Testing DexRouter on Avalanche Mainnet");
  console.log("==========================================");
  console.log("Signer:", signer.address);
  console.log("Network:", network.chainId === 43114n ? "Avalanche Mainnet" : "Unknown");
  console.log("DexRouter:", DEX_ROUTER_ADDRESS);
  
  // Check AVAX balance
  const avaxBalance = await ethers.provider.getBalance(signer.address);
  console.log("\n💰 AVAX Balance:", ethers.formatEther(avaxBalance), "AVAX");
  
  if (avaxBalance < ethers.parseEther("0.01")) {
    console.error("❌ Need at least 0.01 AVAX for testing");
    process.exit(1);
  }
  
  // Connect to DexRouter
  const DexRouter = await ethers.getContractFactory("DexRouter");
  const router = DexRouter.attach(DEX_ROUTER_ADDRESS);
  
  // Get registered DEXes
  console.log("\n📋 Registered DEXes:");
  const dexes = await router.getRegisteredDexes();
  for (const dex of dexes) {
    console.log(`   - ${dex}`);
  }
  
  // Test parameters
  const amountIn = ethers.parseEther("0.001"); // 0.001 AVAX
  const tokenIn = TOKENS.WAVAX;
  const tokenOut = TOKENS.JOE; // Use JOE token - guaranteed liquidity on TraderJoe
  
  console.log("\n🔍 Getting quotes from all DEXes...");
  console.log(`   Input: ${ethers.formatEther(amountIn)} AVAX`);
  console.log(`   Path: WAVAX -> JOE`);
  
  // Get quotes from each DEX
  const quotes: { dex: string; amountOut: bigint }[] = [];
  
  for (const dexName of dexes) {
    try {
      // getQuote(dexName, tokenIn, tokenOut, amountIn)
      const quote = await router.getQuote.staticCall(dexName, tokenIn, tokenOut, amountIn);
      const formattedAmount = ethers.formatUnits(quote, 18); // JOE has 18 decimals
      console.log(`   ${dexName}: ${formattedAmount} JOE`);
      quotes.push({ dex: dexName, amountOut: quote });
    } catch (error: any) {
      console.log(`   ${dexName}: No liquidity or error - ${error.message?.slice(0, 60) || error}`);
    }
  }
  
  if (quotes.length === 0) {
    console.error("❌ No quotes available from any DEX");
    process.exit(1);
  }
  
  // Find best quote
  const bestQuote = quotes.reduce((best, current) => 
    current.amountOut > best.amountOut ? current : best
  );
  
  console.log(`\n🏆 Best DEX: ${bestQuote.dex}`);
  console.log(`   Amount Out: ${ethers.formatUnits(bestQuote.amountOut, 18)} JOE`);
  
  // Check JOE balance before
  const joe = await ethers.getContractAt("ERC20", TOKENS.JOE);
  const joeBalanceBefore = await joe.balanceOf(signer.address);
  console.log(`\n💵 JOE Balance Before: ${ethers.formatUnits(joeBalanceBefore, 18)} JOE`);
  
  // Execute swap
  console.log("\n🔄 Executing swap...");
  console.log(`   From: ${ethers.formatEther(amountIn)} AVAX`);
  console.log(`   Expected: ~${ethers.formatUnits(bestQuote.amountOut, 18)} JOE`);
  console.log(`   Via: ${bestQuote.dex}`);
  
  // Set minimum output with 0.5% slippage tolerance
  const minOutput = (bestQuote.amountOut * 995n) / 1000n;
  console.log(`   Min Output (0.5% slippage): ${ethers.formatUnits(minOutput, 18)} JOE`);
  
  // Deadline: 5 minutes from now
  const deadline = Math.floor(Date.now() / 1000) + 300;
  
  try {
    // Call swapAVAXForTokens (native AVAX swap) - automatically finds best route
    // function swapAVAXForTokens(address tokenOut, uint256 minAmountOut, address recipient)
    const tx = await router.swapAVAXForTokens(
      tokenOut,
      minOutput,
      signer.address,
      { value: amountIn }
    );
    
    console.log(`\n📝 Transaction sent: ${tx.hash}`);
    console.log("   Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
    
    // Check JOE balance after
    const joeBalanceAfter = await joe.balanceOf(signer.address);
    const received = joeBalanceAfter - joeBalanceBefore;
    
    console.log(`\n🎉 SWAP SUCCESSFUL!`);
    console.log("===================");
    console.log(`   AVAX Spent: ${ethers.formatEther(amountIn)} AVAX`);
    console.log(`   JOE Received: ${ethers.formatUnits(received, 18)} JOE`);
    console.log(`   Via: ${bestQuote.dex}`);
    console.log(`\n   View tx: https://snowtrace.io/tx/${tx.hash}`);
    
  } catch (error: any) {
    console.error("\n❌ Swap failed:", error.message);
    
    // Try to decode the error
    if (error.message.includes("InsufficientOutputAmount")) {
      console.error("   Reason: Slippage too high - try increasing slippage tolerance");
    } else if (error.message.includes("NoRoute")) {
      console.error("   Reason: No valid route found for this token pair");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });