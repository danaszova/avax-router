import { Token } from '../types';

// Top 25 Avalanche tokens - VERIFIED OFFICIAL ADDRESSES
export const AVALANCHE_TOKENS: Token[] = [
  // === Native/Stablecoins ===
  {
    address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    symbol: 'AVAX',
    name: 'Avalanche',
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
  // === Major Cryptos ===
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
    address: '0x420FcA0121DC28039145009570975747295f2329',
    symbol: 'COQ',
    name: 'Coq Inu',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://assets.coingecko.com/coins/images/34112/small/coq.png',
  },
  // === Avalanche DeFi ===
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
    address: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
    symbol: 'sAVAX',
    name: 'Staked AVAX',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE/logo.png',
  },
  {
    address: '0x5c49b268c9841a1c4964403996b92d7145938e3a',
    symbol: 'yyAVAX',
    name: 'Yield Yak AVAX',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x5c49b268c9841a1c4964403996b92d7145938e3a/logo.png',
  },
  // === Blue Chips ===
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
    address: '0x63a72806098Bd3D9520cC43356dD78afe5D386D1',
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x63a72806098Bd3D9520cC43356dD78afe5D386D1/logo.png',
  },
  {
    address: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64',
    symbol: 'FRAX',
    name: 'Frax',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64/logo.png',
  },
  {
    address: '0x47536F17F4fF30e64A96a7555826b8f9e66ec468',
    symbol: 'CRV',
    name: 'Curve',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x47536F17F4fF30e64A96a7555826b8f9e66ec468/logo.png',
  },
  // === Meme/Viral ===
  {
    address: '0x8e9226eDcA6B7Fdf5b52D8F2937A632F36B0a1F9',
    symbol: 'KIMBO',
    name: 'Kimbo',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://assets.coingecko.com/coins/images/26404/small/kimbo.png',
  },
];

export const DEX_ROUTER_ADDRESS = '0xf081117ccd2f0079f1d08B27cB9AcB2D946fDe35'; // NEW DEPLOYMENT - March 2026

export const DEFAULT_SLIPPAGE = 0.5; // 0.5%

export const API_BASE_URL = 'http://localhost:3000/api/v1';