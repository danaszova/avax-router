import { Token } from '../types';

export const AVALANCHE_TOKENS: Token[] = [
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
    address: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
    symbol: 'JOE',
    name: 'JOE',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd/logo.png',
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
    address: '0x60781C2586D68229fde47564546784ab3fACA982',
    symbol: 'PNG',
    name: 'Pangolin',
    decimals: 18,
    chainId: 43114,
    logoURI: 'https://raw.githubusercontent.com/pangolindex/tokenlists/master/logos/0x60781C2586D68229fde47564546784ab3fACA982/logo.png',
  },
];

export const DEX_ROUTER_ADDRESS = '0x3ff7FAAD7417130C60b7422De712eAd9a7C2e3B5';

export const DEFAULT_SLIPPAGE = 0.5; // 0.5%

export const API_BASE_URL = 'http://localhost:3000/api/v1';