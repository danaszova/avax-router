import { ethers } from "hardhat";

/**
 * Test our deployed adapters directly
 */

const DEX_ROUTER = "0xfb98ae3cbD4564885d58D68CCf8C27566F0F4575";

const ADAPTERS = {
  TraderJoeV2: "0x1EcBF23e1c583Af4C3986E77bF72de9518D84ea3",
  TraderJoeV1: "0xf46f78a78b96D5059F44c0760166f161185731ea",
  Pangolin: "0x5D9E888281a29fE041bC7766E6e32B6fB6464891",
  Platypus: "0xF394dD1f3C8CDea1346C1A9e81cDe5FF417C5C1d",
};

const TOKENS = {
  WAVAX: "0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C",
  USDC_BRIDGED: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
  USDC_NATIVE: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
};

const ADAPTER_ABI = [
  "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)",
  "function hasPool(address tokenIn, address tokenOut) view returns (bool)",
  "function router() view returns (address)",
  "function factory() view returns (address)",
  "function dexName() view returns (string)"
];

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("Testing Our Deployed Adapters on Avalanche");
  console.log("============================================");
  console.log("Signer:", signer.address);
  
  const amountIn = ethers.parseEther("0.001");
  console.log("Amount In:", ethers.formatEther(amountIn), "AVAX\n");
  
  for (const [name, address] of Object.entries(ADAPTERS)) {
    console.log(`\n📍 ${name}`);
    console.log(`   Adapter: ${address}`);
    
    const adapter = new ethers.Contract(address, ADAPTER_ABI, signer);
    
    for (const [tokenName, tokenAddr] of Object.entries(TOKENS)) {
      if (tokenName === "WAVAX") continue;
      
      // First check if pool exists
      try {
        const hasPool = await adapter.hasPool(TOKENS.WAVAX, tokenAddr);
        if (!hasPool) {
          console.log(`   ❌ WAVAX -> ${tokenName}: No pool`);
          continue;
        }
      } catch (e: any) {
        console.log(`   ❌ WAVAX -> ${tokenName}: Pool check failed`);
        continue;
      }
      
      // Try to get quote
      try {
        const amountOut = await adapter.getAmountOut(TOKENS.WAVAX, tokenAddr, amountIn);
        const decimals = tokenName.includes("USDC") || tokenName.includes("USDT") ? 6 : 18;
        console.log(`   ✅ WAVAX -> ${tokenName}: ${ethers.formatUnits(amountOut, decimals)}`);
      } catch (e: any) {
        console.log(`   ❌ WAVAX -> ${tokenName}: ${e.message?.slice(0, 50)}`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(console.error);