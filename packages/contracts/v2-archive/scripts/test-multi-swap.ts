import { ethers } from "hardhat";

/**
 * Multi-Swap Test Script for Avalanche Mainnet
 * 
 * Tests multiple swap pairs to verify DexRouter functionality
 */

// NEW DexRouter with CORRECT WAVAX address
const DEX_ROUTER_ADDRESS = "0x919383A49341f1EeccB6F3Da14d7497e481869d9";

// Mainnet token addresses
const TOKENS = {
  WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  USDC: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // Bridged USDC (more liquidity)
  USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  JOE: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
};

// Token decimals
const DECIMALS: Record<string, number> = {
  WAVAX: 18,
  USDC: 6,
  USDT: 6,
  JOE: 18,
};

interface SwapResult {
  pair: string;
  dex: string;
  amountIn: bigint;
  amountOut: bigint;
  gasUsed: bigint;
  txHash: string;
  success: boolean;
  error?: string;
}

async function main() {
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("🧪 Multi-Swap Test for DexRouter on Avalanche Mainnet");
  console.log("====================================================");
  console.log("Signer:", signer.address);
  console.log("Network:", network.chainId === 43114n ? "Avalanche Mainnet" : "Unknown");
  console.log("DexRouter:", DEX_ROUTER_ADDRESS);
  
  // Check AVAX balance
  const avaxBalance = await ethers.provider.getBalance(signer.address);
  console.log("\n💰 AVAX Balance:", ethers.formatEther(avaxBalance), "AVAX");
  
  if (avaxBalance < ethers.parseEther("0.02")) {
    console.error("❌ Need at least 0.02 AVAX for all tests");
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
  
  const results: SwapResult[] = [];
  
  // ========== TEST 1: AVAX -> USDC ==========
  console.log("\n\n" + "=".repeat(60));
  console.log("TEST 1: AVAX → USDC");
  console.log("=".repeat(60));
  
  const test1 = await testSwap(
    router, signer, dexes,
    TOKENS.WAVAX, TOKENS.USDC,
    ethers.parseEther("0.001"),
    "USDC", "WAVAX"
  );
  results.push({ ...test1, pair: "AVAX → USDC" });
  
  // ========== TEST 2: AVAX -> USDT ==========
  console.log("\n\n" + "=".repeat(60));
  console.log("TEST 2: AVAX → USDT");
  console.log("=".repeat(60));
  
  const test2 = await testSwap(
    router, signer, dexes,
    TOKENS.WAVAX, TOKENS.USDT,
    ethers.parseEther("0.001"),
    "USDT", "WAVAX"
  );
  results.push({ ...test2, pair: "AVAX → USDT" });
  
  // ========== TEST 3: AVAX -> JOE (larger amount) ==========
  console.log("\n\n" + "=".repeat(60));
  console.log("TEST 3: AVAX → JOE (0.01 AVAX)");
  console.log("=".repeat(60));
  
  const test3 = await testSwap(
    router, signer, dexes,
    TOKENS.WAVAX, TOKENS.JOE,
    ethers.parseEther("0.01"),
    "JOE", "WAVAX"
  );
  results.push({ ...test3, pair: "AVAX → JOE (0.01)" });
  
  // ========== TEST 4: JOE -> AVAX ==========
  console.log("\n\n" + "=".repeat(60));
  console.log("TEST 4: JOE → AVAX (Token to AVAX)");
  console.log("=".repeat(60));
  
  // Check JOE balance first
  const joeContract = await ethers.getContractAt("ERC20", TOKENS.JOE);
  const joeBalance = await joeContract.balanceOf(signer.address);
  console.log(`   JOE Balance: ${ethers.formatUnits(joeBalance, 18)} JOE`);
  
  if (joeBalance > ethers.parseUnits("0.1", 18)) {
    const test4 = await testSwapTokenToAvax(
      router, signer, dexes,
      TOKENS.JOE, TOKENS.WAVAX,
      ethers.parseUnits("0.5", 18), // Swap 0.5 JOE
      "AVAX", "JOE"
    );
    results.push({ ...test4, pair: "JOE → AVAX" });
  } else {
    console.log("   ⚠️ Skipping - insufficient JOE balance");
    results.push({
      pair: "JOE → AVAX",
      dex: "-",
      amountIn: 0n,
      amountOut: 0n,
      gasUsed: 0n,
      txHash: "-",
      success: false,
      error: "Insufficient JOE balance"
    });
  }
  
  // ========== SUMMARY ==========
  console.log("\n\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  
  console.log("\n| Pair | DEX | Amount In | Amount Out | Gas | Status |");
  console.log("|------|-----|-----------|------------|-----|--------|");
  
  let totalGas = 0n;
  let successCount = 0;
  
  for (const r of results) {
    const status = r.success ? "✅" : "❌";
    const gasStr = r.gasUsed > 0n ? ethers.formatUnits(r.gasUsed, 0) : "-";
    console.log(`| ${r.pair} | ${r.dex} | ${r.amountIn > 0n ? ethers.formatUnits(r.amountIn, DECIMALS[r.pair.split("→")[1]?.trim()] || 18) : "-"} | ${r.amountOut > 0n ? ethers.formatUnits(r.amountOut, DECIMALS[r.pair.split("→")[0]?.trim()] || 18) : "-"} | ${gasStr} | ${status} |`);
    
    if (r.success) {
      totalGas += r.gasUsed;
      successCount++;
    }
    
    if (r.txHash && r.txHash !== "-") {
      console.log(`   ↳ https://snowtrace.io/tx/${r.txHash}`);
    }
  }
  
  console.log(`\n📈 Results: ${successCount}/${results.length} successful`);
  console.log(`⛽ Total Gas Used: ${ethers.formatUnits(totalGas, 0)} gas`);
  
  // Final balances
  console.log("\n💰 Final Balances:");
  const finalAvax = await ethers.provider.getBalance(signer.address);
  const finalUsdc = await ethers.getContractAt("ERC20", TOKENS.USDC);
  const finalUsdt = await ethers.getContractAt("ERC20", TOKENS.USDT);
  const finalJoe = await ethers.getContractAt("ERC20", TOKENS.JOE);
  
  console.log(`   AVAX: ${ethers.formatEther(finalAvax)}`);
  console.log(`   USDC: ${ethers.formatUnits(await finalUsdc.balanceOf(signer.address), 6)}`);
  console.log(`   USDT: ${ethers.formatUnits(await finalUsdt.balanceOf(signer.address), 6)}`);
  console.log(`   JOE: ${ethers.formatUnits(await finalJoe.balanceOf(signer.address), 18)}`);
}

async function testSwap(
  router: any,
  signer: any,
  dexes: string[],
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  outSymbol: string,
  inSymbol: string
): Promise<Omit<SwapResult, "pair">> {
  const decimalsOut = DECIMALS[outSymbol] || 18;
  const decimalsIn = DECIMALS[inSymbol] || 18;
  
  // Get quotes from all DEXes
  console.log(`\n🔍 Getting quotes for ${ethers.formatUnits(amountIn, decimalsIn)} ${inSymbol}...`);
  
  const quotes: { dex: string; amountOut: bigint }[] = [];
  
  for (const dexName of dexes) {
    try {
      const quote = await router.getQuote.staticCall(dexName, tokenIn, tokenOut, amountIn);
      console.log(`   ${dexName}: ${ethers.formatUnits(quote, decimalsOut)} ${outSymbol}`);
      quotes.push({ dex: dexName, amountOut: quote });
    } catch (error: any) {
      console.log(`   ${dexName}: No liquidity`);
    }
  }
  
  if (quotes.length === 0) {
    console.log("   ❌ No quotes available");
    return {
      dex: "-",
      amountIn: 0n,
      amountOut: 0n,
      gasUsed: 0n,
      txHash: "-",
      success: false,
      error: "No quotes available"
    };
  }
  
  // Find best quote
  const best = quotes.reduce((a, b) => a.amountOut > b.amountOut ? a : b);
  console.log(`\n🏆 Best: ${best.dex} at ${ethers.formatUnits(best.amountOut, decimalsOut)} ${outSymbol}`);
  
  // Execute swap
  try {
    const minOutput = (best.amountOut * 995n) / 1000n; // 0.5% slippage
    console.log(`   Min output: ${ethers.formatUnits(minOutput, decimalsOut)} ${outSymbol}`);
    
    const tx = await router.swapAVAXForTokens(
      tokenOut,
      minOutput,
      signer.address,
      { value: amountIn }
    );
    
    console.log(`   📝 TX: ${tx.hash}`);
    const receipt = await tx.wait();
    
    console.log(`   ✅ Success! Gas: ${receipt.gasUsed}`);
    
    return {
      dex: best.dex,
      amountIn,
      amountOut: best.amountOut,
      gasUsed: receipt.gasUsed,
      txHash: tx.hash,
      success: true
    };
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message?.slice(0, 100)}`);
    return {
      dex: best.dex,
      amountIn,
      amountOut: 0n,
      gasUsed: 0n,
      txHash: "-",
      success: false,
      error: error.message
    };
  }
}

async function testSwapTokenToAvax(
  router: any,
  signer: any,
  dexes: string[],
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  outSymbol: string,
  inSymbol: string
): Promise<Omit<SwapResult, "pair">> {
  const decimalsOut = DECIMALS[outSymbol] || 18;
  const decimalsIn = DECIMALS[inSymbol] || 18;
  
  // Get token contract
  const tokenContract = await ethers.getContractAt("ERC20", tokenIn);
  
  // Check balance
  const balance = await tokenContract.balanceOf(signer.address);
  if (balance < amountIn) {
    console.log(`   ⚠️ Insufficient balance: ${ethers.formatUnits(balance, decimalsIn)} ${inSymbol}`);
    return {
      dex: "-",
      amountIn: 0n,
      amountOut: 0n,
      gasUsed: 0n,
      txHash: "-",
      success: false,
      error: "Insufficient balance"
    };
  }
  
  // Get quotes
  console.log(`\n🔍 Getting quotes for ${ethers.formatUnits(amountIn, decimalsIn)} ${inSymbol} → ${outSymbol}...`);
  
  const quotes: { dex: string; amountOut: bigint }[] = [];
  
  for (const dexName of dexes) {
    try {
      const quote = await router.getQuote.staticCall(dexName, tokenIn, tokenOut, amountIn);
      console.log(`   ${dexName}: ${ethers.formatUnits(quote, decimalsOut)} ${outSymbol}`);
      quotes.push({ dex: dexName, amountOut: quote });
    } catch (error: any) {
      console.log(`   ${dexName}: No liquidity`);
    }
  }
  
  if (quotes.length === 0) {
    console.log("   ❌ No quotes available");
    return {
      dex: "-",
      amountIn: 0n,
      amountOut: 0n,
      gasUsed: 0n,
      txHash: "-",
      success: false,
      error: "No quotes available"
    };
  }
  
  const best = quotes.reduce((a, b) => a.amountOut > b.amountOut ? a : b);
  console.log(`\n🏆 Best: ${best.dex} at ${ethers.formatUnits(best.amountOut, decimalsOut)} ${outSymbol}`);
  
  try {
    // Approve router
    console.log("   Approving token spend...");
    const approveTx = await tokenContract.approve(DEX_ROUTER_ADDRESS, amountIn);
    await approveTx.wait();
    
    const minOutput = (best.amountOut * 995n) / 1000n;
    console.log(`   Min output: ${ethers.formatUnits(minOutput, decimalsOut)} ${outSymbol}`);
    
    const tx = await router.swapTokensForAVAX(
      tokenIn,
      amountIn,
      minOutput,
      signer.address
    );
    
    console.log(`   📝 TX: ${tx.hash}`);
    const receipt = await tx.wait();
    
    console.log(`   ✅ Success! Gas: ${receipt.gasUsed}`);
    
    return {
      dex: best.dex,
      amountIn,
      amountOut: best.amountOut,
      gasUsed: receipt.gasUsed,
      txHash: tx.hash,
      success: true
    };
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message?.slice(0, 100)}`);
    return {
      dex: best.dex,
      amountIn,
      amountOut: 0n,
      gasUsed: 0n,
      txHash: "-",
      success: false,
      error: error.message
    };
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });