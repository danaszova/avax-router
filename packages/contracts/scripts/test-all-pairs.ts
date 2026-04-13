import { ethers } from "hardhat";

/**
 * Comprehensive test: Test all token pairs on both Pangolin V2 and TraderJoe V1
 * 
 * DexRouter: 0x81308B8e4C72E5aA042ADA30f9b29729c5a43098
 * 
 * Tests ~400 token pair combinations (20 tokens × 20 tokens)
 * Reports which pairs work on each DEX and which gives better prices
 */

const DEX_ROUTER_ADDRESS = "0x81308B8e4C72E5aA042ADA30f9b29729c5a43098";

const DEX_ROUTER_ABI = [
  "function getQuote(string calldata dexName, address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)",
  "function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn) view returns (string memory bestDex, uint256 bestAmountOut)",
  "function registeredDexes(uint256) view returns (string memory)"
];

// Known registered DEXes
const DEX_NAMES = ["TraderJoeV1", "Pangolin V2"];

// Our token list - same as widget constants
const TOKENS: { symbol: string; address: string; decimals: number }[] = [
  // Stablecoins/Native
  { symbol: "AVAX", address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 18 },
  { symbol: "USDC", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
  { symbol: "USDT", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 },
  { symbol: "DAI", address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", decimals: 18 },
  { symbol: "USDC.e", address: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", decimals: 6 },
  // Major Cryptos
  { symbol: "WBTC", address: "0x50b7545627a5162F82A992c33b87aDc75187B218", decimals: 8 },
  { symbol: "WETH", address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", decimals: 18 },
  { symbol: "BTC.b", address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50", decimals: 8 },
  { symbol: "COQ", address: "0x420FcA0121DC28039145009570975747295f2329", decimals: 18 },
  // Avalanche DeFi
  { symbol: "JOE", address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd", decimals: 18 },
  { symbol: "PNG", address: "0x60781C2586D68229fde47564546784ab3fACA982", decimals: 18 },
  { symbol: "QI", address: "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5", decimals: 18 },
  { symbol: "sAVAX", address: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE", decimals: 18 },
  { symbol: "yyAVAX", address: "0x5c49b268c9841a1c4964403996b92d7145938e3a", decimals: 18 },
  // Blue Chips
  { symbol: "LINK", address: "0x5947bb275c521040051d82396192181b413227a3", decimals: 18 },
  { symbol: "GMX", address: "0x62edc0692BD897D2295872a9FFCac5425011c661", decimals: 18 },
  { symbol: "AAVE", address: "0x63a72806098Bd3D9520cC43356dD78afe5D386D1", decimals: 18 },
  { symbol: "FRAX", address: "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64", decimals: 18 },
  { symbol: "CRV", address: "0x47536F17F4fF30e64A96a7555826b8f9e66ec468", decimals: 18 },
  // Meme
  { symbol: "KIMBO", address: "0x8e9226eDcA6B7Fdf5b52D8F2937A632F36B0a1F9", decimals: 18 },
];

// Test amount: 0.001 AVAX worth (in 18-decimal units)
const TEST_AMOUNT = ethers.parseEther("0.001");

interface PairResult {
  tokenIn: string;
  tokenOut: string;
  pangolinQuote: string | null;
  traderJoeQuote: string | null;
  bestDex: string | null;
  bestAmount: string | null;
}

async function main() {
  console.log("========================================");
  console.log("Testing ALL Token Pairs on Both DEXes");
  console.log("========================================");
  console.log(`Tokens: ${TOKENS.length}`);
  console.log(`Pairs to test: ${TOKENS.length * (TOKENS.length - 1)}`);
  console.log("");

  const provider = new ethers.JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc");
  const dexRouter = new ethers.Contract(DEX_ROUTER_ADDRESS, DEX_ROUTER_ABI, provider);

  // Verify registered DEXes by reading the public array
  const dex0 = await dexRouter.registeredDexes(0);
  const dex1 = await dexRouter.registeredDexes(1);
  console.log("Registered DEXes:", [dex0, dex1]);
  console.log("");

  const results: PairResult[] = [];
  let pangolinWins = 0;
  let traderJoeWins = 0;
  let bothWork = 0;
  let onlyPangolin = 0;
  let onlyTraderJoe = 0;
  let neither = 0;

  for (const tokenIn of TOKENS) {
    for (const tokenOut of TOKENS) {
      if (tokenIn.symbol === tokenOut.symbol) continue;

      const result: PairResult = {
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        pangolinQuote: null,
        traderJoeQuote: null,
        bestDex: null,
        bestAmount: null,
      };

      // Test Pangolin V2
      try {
        const quote = await dexRouter.getQuote("Pangolin V2", tokenIn.address, tokenOut.address, TEST_AMOUNT);
        if (quote > 0n) {
          result.pangolinQuote = ethers.formatUnits(quote, tokenOut.decimals);
        }
      } catch {
        // No liquidity on Pangolin
      }

      // Test TraderJoe V1
      try {
        const quote = await dexRouter.getQuote("TraderJoeV1", tokenIn.address, tokenOut.address, TEST_AMOUNT);
        if (quote > 0n) {
          result.traderJoeQuote = ethers.formatUnits(quote, tokenOut.decimals);
        }
      } catch {
        // No liquidity on TraderJoe
      }

      // Determine best
      if (result.pangolinQuote && result.traderJoeQuote) {
        bothWork++;
        const pAmount = parseFloat(result.pangolinQuote);
        const tjAmount = parseFloat(result.traderJoeQuote);
        if (pAmount > tjAmount) {
          result.bestDex = "Pangolin V2";
          result.bestAmount = result.pangolinQuote;
          pangolinWins++;
        } else {
          result.bestDex = "TraderJoe V1";
          result.bestAmount = result.traderJoeQuote;
          traderJoeWins++;
        }
      } else if (result.pangolinQuote) {
        onlyPangolin++;
        result.bestDex = "Pangolin V2";
        result.bestAmount = result.pangolinQuote;
        pangolinWins++;
      } else if (result.traderJoeQuote) {
        onlyTraderJoe++;
        result.bestDex = "TraderJoe V1";
        result.bestAmount = result.traderJoeQuote;
        traderJoeWins++;
      } else {
        neither++;
      }

      results.push(result);

      // Progress indicator
      const total = TOKENS.length * (TOKENS.length - 1);
      const done = results.length;
      if (done % 20 === 0 || done === total) {
        process.stdout.write(`\rProgress: ${done}/${total} pairs tested (${Math.round(done/total*100)}%)`);
      }
    }
  }

  console.log("\n\n========================================");
  console.log("=== RESULTS SUMMARY ===");
  console.log("========================================");
  console.log(`Total pairs tested: ${results.length}`);
  console.log(`Both DEXes work: ${bothWork}`);
  console.log(`Only Pangolin V2: ${onlyPangolin}`);
  console.log(`Only TraderJoe V1: ${onlyTraderJoe}`);
  console.log(`Neither DEX: ${neither}`);
  console.log(`\n🏆 Pangolin V2 wins: ${pangolinWins} pairs`);
  console.log(`🏆 TraderJoe V1 wins: ${traderJoeWins} pairs`);
  console.log(`\nTotal coverage: ${results.length - neither}/${results.length} pairs have at least one DEX`);

  // Print pairs where both work with comparison
  console.log("\n========================================");
  console.log("=== PAIRS WHERE BOTH DEXES WORK ===");
  console.log("========================================");
  const bothWorkPairs = results.filter(r => r.pangolinQuote && r.traderJoeQuote);
  for (const r of bothWorkPairs) {
    const pAmt = parseFloat(r.pangolinQuote!);
    const tjAmt = parseFloat(r.traderJoeQuote!);
    const diff = ((pAmt - tjAmt) / tjAmt * 100).toFixed(2);
    const winner = pAmt > tjAmt ? "PNG 🏆" : "TJ 🏆";
    console.log(`${r.tokenIn}→${r.tokenOut}: Pangolin=${r.pangolinQuote} | TJ=${r.traderJoeQuote} | ${winner} (${diff}%)`);
  }

  // Print pairs where only Pangolin works
  console.log("\n========================================");
  console.log("=== PAIRS WHERE ONLY PANGOLIN V2 WORKS ===");
  console.log("========================================");
  const onlyPangolinPairs = results.filter(r => r.pangolinQuote && !r.traderJoeQuote);
  for (const r of onlyPangolinPairs) {
    console.log(`✅ ${r.tokenIn}→${r.tokenOut}: ${r.pangolinQuote}`);
  }
  console.log(`Total: ${onlyPangolinPairs.length} pairs`);

  // Print pairs where only TraderJoe works
  console.log("\n========================================");
  console.log("=== PAIRS WHERE ONLY TRADERJOE V1 WORKS ===");
  console.log("========================================");
  const onlyTraderJoePairs = results.filter(r => !r.pangolinQuote && r.traderJoeQuote);
  for (const r of onlyTraderJoePairs) {
    console.log(`✅ ${r.tokenIn}→${r.tokenOut}: ${r.traderJoeQuote}`);
  }
  console.log(`Total: ${onlyTraderJoePairs.length} pairs`);

  // Print pairs where neither works
  console.log("\n========================================");
  console.log("=== PAIRS WITH NO LIQUIDITY (neither DEX) ===");
  console.log("========================================");
  const neitherPairs = results.filter(r => !r.pangolinQuote && !r.traderJoeQuote);
  for (const r of neitherPairs) {
    console.log(`❌ ${r.tokenIn}→${r.tokenOut}`);
  }
  console.log(`Total: ${neitherPairs.length} pairs`);

  // Per-token coverage
  console.log("\n========================================");
  console.log("=== PER-TOKEN COVERAGE (how many pairs work) ===");
  console.log("========================================");
  for (const token of TOKENS) {
    const asInput = results.filter(r => r.tokenIn === token.symbol && (r.pangolinQuote || r.traderJoeQuote));
    const pangolinCoverage = results.filter(r => r.tokenIn === token.symbol && r.pangolinQuote).length;
    const traderJoeCoverage = results.filter(r => r.tokenIn === token.symbol && r.traderJoeQuote).length;
    console.log(`${token.symbol}: ${asInput.length}/${TOKENS.length - 1} pairs | Pangolin: ${pangolinCoverage} | TJ: ${traderJoeCoverage}`);
  }

  console.log("\n========================================");
  console.log("=== TEST COMPLETE ===");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });