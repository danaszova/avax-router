import { Token } from '../types';

// 17 Avalanche tokens with VERIFIED LIQUIDITY on our DEX router
// Ordered by number of working pairs (most liquid first)
// Tested April 2026: 259/380 pairs have liquidity across Pangolin V2 + TraderJoe V1
// Removed: yyAVAX (0 pairs), AAVE (0 pairs), KIMBO (0 pairs) - no liquidity
export const AVALANCHE_TOKENS: Token[] = [
  // === Native AVAX (auto-unwraps WAVAX to native AVAX for gas) ===
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'AVAX',
    name: 'Avalanche (Native)',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo.png',
    isNative: true,
  },
  // === Tier 1: 16/19 working pairs (highest liquidity) ===
  {
    address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    symbol: 'WAVAX',
    name: 'Wrapped AVAX',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo.png',
  },
  {
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E/logo.png',
  },
  {
    address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7/logo.png',
  },
  {
    address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xd586E7F844cEa2F87f50152665BCbc2C279D8d70/logo.png',
  },
  {
    address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
    symbol: 'USDC.e',
    name: 'USD Coin (Bridged)',
    decimals: 6,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664/logo.png',
  },
  {
    address: '0x50b7545627a5162F82A992c33b87aDc75187B218',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x50b7545627a5162F82A992c33b87aDc75187B218/logo.png',
  },
  {
    address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB/logo.png',
  },
  {
    address: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
    symbol: 'BTC.b',
    name: 'Bitcoin',
    decimals: 8,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x152b9d0FdC40C096757F570A51E494bd4b943E50/logo.png',
  },
  {
    address: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
    symbol: 'sAVAX',
    name: 'Staked AVAX',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE/logo.png',
  },
  {
    address: '0x5947bb275c521040051d82396192181b413227a3',
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x5947bb275c521040051d82396192181b413227a3/logo.png',
  },
  {
    address: '0x62edc0692BD897D2295872a9FFCac5425011c661',
    symbol: 'GMX',
    name: 'GMX',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x62edc0692BD897D2295872a9FFCac5425011c661/logo.png',
  },
  {
    address: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64',
    symbol: 'FRAX',
    name: 'Frax',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64/logo.png',
  },
  // === Tier 2: 14/19 working pairs (good liquidity) ===
  {
    address: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
    symbol: 'JOE',
    name: 'JOE',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd/logo.png',
  },
  {
    address: '0x60781C2586D68229fde47564546784ab3fACA982',
    symbol: 'PNG',
    name: 'Pangolin',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/pangolindex/tokenlists/master/logos/0x60781C2586D68229fde47564546784ab3fACA982/logo.png',
  },
  {
    address: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5',
    symbol: 'QI',
    name: 'BENQI',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5/logo.png',
  },
  {
    address: '0x47536F17F4fF30e64A96a7555826b8f9e66ec468',
    symbol: 'CRV',
    name: 'Curve',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x47536F17F4fF30e64A96a7555826b8f9e66ec468/logo.png',
  },
  // === Tier 3: 11/19 working pairs ===
  {
    address: '0x420FcA0121DC28039145009570975747295f2329',
    symbol: 'COQ',
    name: 'Coq Inu',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://assets.coingecko.com/coins/images/34112/small/coq.png',
  },
];

// WAVAX contract address (used for wrapping/unwrapping native AVAX)
export const WAVAX_ADDRESS = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' as const;
// Native AVAX sentinel address (used to represent native AVAX in token list)
export const NATIVE_AVAX_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const;

// ===== CONTRACT ADDRESSES =====

// Fuji Testnet (Chain ID: 43113)
export const FUJI_DEX_ROUTER_ADDRESS = '0xc4396498B42DE35D38CE47c38e75240a49B5452a';
export const FUJI_PARTNER_REGISTRY_ADDRESS = '0xEC19b44BAfB8572dfEaec8Fd38A1E15aCA82E01a';
export const FUJI_TRADERJOE_V1_ADAPTER = '0x62d133b127786c4D2D9e7D64dDdD4Cac7685eA8c';

// Avalanche Mainnet (Chain ID: 43114)
export const DEX_ROUTER_ADDRESS = '0x81308B8e4C72E5aA042ADA30f9b29729c5a43098'; // Partner System - April 2026
export const PARTNER_REGISTRY_ADDRESS = '0xBF1f8E2872E82555e1Ce85b31077e2903368d943';
export const TRADERJOE_V1_ADAPTER_ADDRESS = '0x108831f20954211336704eaE0483e887a7bfd3A1';
// Pangolin V2 adapter - deployed April 2026
export const PANGOLIN_V2_ADAPTER_ADDRESS = '0xc9F25F209c038312218827B4297A956Cfb9cE0b4';

// ===== DEX CONTRACT ADDRESSES (on-chain) =====
// TraderJoe V1
export const TJ_V1_ROUTER = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4';
export const TJ_V1_FACTORY = '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10';
// Pangolin V2 (from official SDK: https://github.com/pangolindex/sdk/blob/master/src/chains.ts)
export const PANGOLIN_V2_ROUTER = '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106';
export const PANGOLIN_V2_FACTORY = '0xefa94DE7a4656D787667C749f7E1223D71E9FD88';

export const DEFAULT_SLIPPAGE = 0.5; // 0.5%

export const API_BASE_URL = 'https://avax-router-api.avaxrouter.workers.dev';

// ===== MONETIZATION CONFIG =====
// Default partner address - contract deployer/owner (fees go here when no partner is configured)
// Fuji testnet owner: 0xB615Cd848630BaCdBb9051f975b8e1450CF58E0B
export const DEFAULT_PARTNER_ADDRESS = '0xB615Cd848630BaCdBb9051f975b8e1450CF58E0B';

// Default partner fee in basis points (25 = 0.25%)
// Partners earn this when they configure their address
// When no partner is configured, this fee goes to DEFAULT_PARTNER_ADDRESS
export const DEFAULT_PARTNER_FEE_BPS = 25; // 0.25%

// Protocol fee in basis points (5 = 0.05%)
// This always goes to the contract owner
export const PROTOCOL_FEE_BPS = 5; // 0.05%
