import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

const FUJI_RPC_URL = process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

// Deployed addresses on Fuji
const DEX_ROUTER = '0xc4396498B42DE35D38CE47c38e75240a49B5452a';
const PARTNER_REGISTRY = '0xEC19b44BAfB8572dfEaec8Fd38A1E15aCA82E01a';
const TRADERJOE_ADAPTER = '0x62d133b127786c4D2D9e7D64dDdD4Cac7685eA8c';

// Fuji WAVAX address
const WAVAX_FUJI = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c';
const USDC_FUJI = '0x5425890298aed601595a70AB815c96711a31Bc65';

// ABIs
const ROUTER_ABI = [
  'function registeredDexes(uint256) view returns (string)',
  'function adapters(string) view returns (address)',
  'function partnerRegistry() view returns (address)',
  'function owner() view returns (address)',
  'function PROTOCOL_FEE_BPS() view returns (uint256)',
  'function MAX_PARTNER_FEE_BPS() view returns (uint256)',
  'function findBestRoute(address, address, uint256) view returns (string, uint256)',
  'function getPartnerAccumulatedFees(address, address) view returns (uint256)',
];

const REGISTRY_ABI = [
  'function owner() view returns (address)',
  'function getPartnerAddress(string) view returns (address)',
  'function isPartnerRegistered(string) view returns (bool)',
  'function partnerCount() view returns (uint256)',
];

async function main() {
  console.log('🔍 Testing Partner System on Fuji Testnet\n');
  console.log('==========================================\n');

  const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);

  // 1. Check DexRouter
  const router = new ethers.Contract(DEX_ROUTER, ROUTER_ABI, provider);
  console.log('📡 DexRouter:', DEX_ROUTER);
  
  try {
    const owner = await router.owner();
    console.log('  ✅ Owner:', owner);
  } catch (e: any) {
    console.log('  ❌ Owner check failed:', e.message);
  }

  try {
    const registry = await router.partnerRegistry();
    console.log('  ✅ PartnerRegistry:', registry);
    console.log('    Expected:', PARTNER_REGISTRY);
    console.log('    Match:', registry.toLowerCase() === PARTNER_REGISTRY.toLowerCase() ? '✅' : '❌');
  } catch (e: any) {
    console.log('  ❌ PartnerRegistry check failed:', e.message);
  }

  try {
    const feeBps = await router.PROTOCOL_FEE_BPS();
    console.log('  ✅ Protocol Fee BPS:', feeBps.toString(), '(0.05%)');
  } catch (e: any) {
    console.log('  ❌ Protocol fee check failed:', e.message);
  }

  try {
    const maxFee = await router.MAX_PARTNER_FEE_BPS();
    console.log('  ✅ Max Partner Fee BPS:', maxFee.toString(), '(0.50%)');
  } catch (e: any) {
    console.log('  ❌ Max partner fee check failed:', e.message);
  }

  // 2. Check registered adapters
  console.log('\n📡 Checking Registered Adapters:');
  try {
    for (let i = 0; i < 5; i++) {
      try {
        const dexName = await router.registeredDexes(i);
        const adapterAddr = await router.adapters(dexName);
        console.log(`  ✅ ${dexName}: ${adapterAddr}`);
      } catch {
        break;
      }
    }
  } catch (e: any) {
    console.log('  ❌ Adapter check failed:', e.message);
  }

  // 3. Check PartnerRegistry
  console.log('\n📡 PartnerRegistry:', PARTNER_REGISTRY);
  const registry = new ethers.Contract(PARTNER_REGISTRY, REGISTRY_ABI, provider);
  
  try {
    const owner = await registry.owner();
    console.log('  ✅ Owner:', owner);
  } catch (e: any) {
    console.log('  ❌ Registry owner check failed:', e.message);
  }

  try {
    const partnerCount = await registry.partnerCount();
    console.log('  ✅ Partner Count:', partnerCount.toString());
  } catch (e: any) {
    console.log('  ❌ Partner count check failed:', e.message);
  }

  try {
    const ownerPartnerAddr = await registry.getPartnerAddress('owner');
    console.log('  ✅ "owner" partner address:', ownerPartnerAddr);
  } catch (e: any) {
    console.log('  ❌ Owner partner check failed:', e.message);
  }

  // 4. Test findBestRoute (read-only)
  console.log('\n📡 Testing findBestRoute (WAVAX → USDC):');
  try {
    const testAmount = ethers.parseEther('0.1'); // 0.1 WAVAX
    const [bestDex, bestAmount] = await router.findBestRoute(WAVAX_FUJI, USDC_FUJI, testAmount);
    console.log('  ✅ Best DEX:', bestDex);
    console.log('  ✅ Best Amount Out:', ethers.formatUnits(bestAmount, 6), 'USDC');
  } catch (e: any) {
    console.log('  ❌ findBestRoute failed:', e.message);
    console.log('     (This is expected if no liquidity on Fuji testnet)');
  }

  // 5. Check accumulated fees (should be 0)
  console.log('\n📡 Checking Accumulated Fees:');
  try {
    const ownerAddr = await router.owner();
    const fees = await router.getPartnerAccumulatedFees(ownerAddr, WAVAX_FUJI);
    console.log('  ✅ Owner accumulated WAVAX fees:', ethers.formatEther(fees));
  } catch (e: any) {
    console.log('  ❌ Fee check failed:', e.message);
  }

  console.log('\n==========================================');
  console.log('✅ Fuji Partner System Verification Complete!\n');

  // Summary
  console.log('📋 Summary:');
  console.log('  - DexRouter deployed at:', DEX_ROUTER);
  console.log('  - PartnerRegistry deployed at:', PARTNER_REGISTRY);
  console.log('  - TraderJoeV1Adapter at:', TRADERJOE_ADAPTER);
  console.log('  - Network: Fuji Testnet (43113)');
  console.log('\n  To test a swap, use the demo app with your Fuji wallet.\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });