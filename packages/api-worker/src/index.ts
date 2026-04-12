/**
 * Avalanche DEX Router API - Cloudflare Workers Version
 * SnowMonster DeFi
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// ============== CONSTANTS ==============

// 17 Avalanche tokens with VERIFIED LIQUIDITY on our DEX router
// Ordered by number of working pairs (most liquid first)
// Tested April 2026: 259/380 pairs have liquidity across Pangolin V2 + TraderJoe V1
// Removed: yyAVAX (0 pairs), AAVE (0 pairs), KIMBO (0 pairs) - no liquidity
const TOKENS: Record<string, string> = {
  // Tier 1: 16/19 working pairs (highest liquidity)
  AVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  WAVAX: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  USDC: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
  USDT: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
  DAI: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
  USDC_E: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
  WBTC: '0x50b7545627a5162f82a992c33b87adc75187b218',
  WETH: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
  BTC_B: '0x152b9d0fdc40c096757f570a51e494bd4b943e50',
  SAVAX: '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be',
  LINK: '0x5947bb275c521040051d82396192181b413227a3',
  GMX: '0x62edc0692bd897d2295872a9ffcac5425011c661',
  FRAX: '0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64',
  // Tier 2: 14/19 working pairs (good liquidity)
  JOE: '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd',
  PNG: '0x60781c2586d68229fde47564546784ab3faca982',
  QI: '0x8729438eb15e2c8b576fcc6aecda6a148776c0f5',
  CRV: '0x47536f17f4ff30e64a96a7555826b8f9e66ec468',
  // Tier 3: 11/19 working pairs
  COQ: '0x420fca0121dc28039145009570975747295f2329',
};

const TOKEN_DECIMALS: Record<string, number> = {
  [TOKENS.AVAX]: 18,
  [TOKENS.USDC]: 6,
  [TOKENS.USDT]: 6,
  [TOKENS.DAI]: 18,
  [TOKENS.USDC_E]: 6,
  [TOKENS.WBTC]: 8,
  [TOKENS.WETH]: 18,
  [TOKENS.BTC_B]: 8,
  [TOKENS.SAVAX]: 18,
  [TOKENS.LINK]: 18,
  [TOKENS.GMX]: 18,
  [TOKENS.FRAX]: 18,
  [TOKENS.JOE]: 18,
  [TOKENS.PNG]: 18,
  [TOKENS.QI]: 18,
  [TOKENS.CRV]: 18,
  [TOKENS.COQ]: 18,
};

const TJ_V1_ROUTER = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4';
const PANGOLIN_ROUTER = '0xE54Ca86531e17Ef3616d11Ca5b4d259Fa0d24756';
const DEX_ROUTER_ADDRESS = '0x81308B8e4C72E5aA042ADA30f9b29729c5a43098';

const RPC_URLS = [
  'https://api.avax.network/ext/bc/C/rpc',
  'https://avalanche-c-chain-rpc.publicnode.com',
];

// ============== RPC HELPERS ==============

async function rpcCall(method: string, params: any[]): Promise<any> {
  const requestData = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params,
  };

  for (const url of RPC_URLS) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json() as any;
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.result;
    } catch (error) {
      console.error(`RPC call failed to ${url}:`, error);
      continue;
    }
  }
  throw new Error('All RPC endpoints failed');
}

// Encode getAmountsOut function call using proper ABI encoding
function encodeGetAmountsOut(amountIn: bigint, path: string[]): string {
  // Function selector for getAmountsOut(uint256,address[])
  // keccak256("getAmountsOut(uint256,address[])") = 0xd06ca61f
  const selector = '0xd06ca61f';
  
  // Encode amountIn (uint256) - 32 bytes padded
  const amountInHex = amountIn.toString(16).padStart(64, '0');
  
  // Encode offset to dynamic array (address[]) 
  // The offset is 0x40 (64 bytes = 32 for amountIn + 32 for the offset slot itself)
  const pathOffset = '0000000000000000000000000000000000000000000000000000000000000040';
  
  // Encode array length
  const pathLength = path.length.toString(16).padStart(64, '0');
  
  // Encode each address (20 bytes, padded to 32 bytes, right-aligned)
  const pathEncoded = path.map(addr => {
    return addr.slice(2).toLowerCase().padStart(64, '0');
  }).join('');
  
  return selector + amountInHex + pathOffset + pathLength + pathEncoded;
}

// Decode uint256 array from response
function decodeUint256Array(data: string): bigint[] {
  // Remove 0x prefix
  const hex = data.slice(2);
  
  // First 32 bytes is the offset pointer (usually 0x20 = 32)
  const offsetPointer = parseInt(hex.slice(0, 64), 16);
  
  // Read the array length at the offset position
  const lengthHex = hex.slice(offsetPointer * 2, offsetPointer * 2 + 64);
  const length = parseInt(lengthHex, 16);
  
  // Read the array elements starting after the length word
  const result: bigint[] = [];
  const dataStart = offsetPointer * 2 + 64;
  
  for (let i = 0; i < length; i++) {
    const elementStart = dataStart + i * 64;
    const element = hex.slice(elementStart, elementStart + 64);
    result.push(BigInt('0x' + element));
  }
  
  return result;
}

function getTokenDecimals(address: string): number {
  return TOKEN_DECIMALS[address.toLowerCase()] || 18;
}

function parseAmount(amountStr: string, decimals: number): bigint {
  if (amountStr.includes('.')) {
    const [whole, decimal = ''] = amountStr.split('.');
    const decimalPadded = decimal.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(whole + decimalPadded);
  } else {
    // Whole number - multiply by 10^decimals
    return BigInt(amountStr) * BigInt(10 ** decimals);
  }
}

function resolveToken(token: string): string {
  if (token.startsWith('0x')) {
    return token.toLowerCase();
  }
  const addr = TOKENS[token.toUpperCase()];
  if (!addr) {
    throw new Error(`Unknown token: ${token}`);
  }
  return addr;
}

// ============== DEX QUERIES ==============

async function getRouterQuote(
  routerAddress: string,
  path: string[],
  amountIn: bigint
): Promise<bigint | null> {
  try {
    const data = encodeGetAmountsOut(amountIn, path);
    
    const result = await rpcCall('eth_call', [
      { to: routerAddress, data },
      'latest'
    ]);
    
    const amounts = decodeUint256Array(result);
    return amounts[amounts.length - 1];
  } catch (error) {
    console.error(`Router quote failed for ${routerAddress}:`, error);
    return null;
  }
}

async function getMultiHopBestQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<{
  bestAmount: bigint;
  bestPath: string[];
  bestDex: string;
  allQuotes: { dex: string; amountOut: string }[];
}> {
  const tokenInLower = tokenIn.toLowerCase();
  const tokenOutLower = tokenOut.toLowerCase();
  const wavax = TOKENS.WAVAX;
  const usdc = TOKENS.USDC;
  const usdt = TOKENS.USDT;

  const routeCandidates: { label: string; path: string[] }[] = [
    { label: 'TraderJoeV1', path: [tokenInLower, tokenOutLower] },
    { label: 'TraderJoeV1', path: [tokenInLower, wavax, tokenOutLower] },
    { label: 'TraderJoeV1', path: [tokenInLower, usdc, tokenOutLower] },
    { label: 'TraderJoeV1', path: [tokenInLower, usdt, tokenOutLower] },
  ];

  let bestAmount: bigint = 0n;
  let bestPath: string[] = [];
  let bestLabel = '';
  const allQuotes: { dex: string; amountOut: string }[] = [];

  for (const candidate of routeCandidates) {
    const { path, label } = candidate;

    // Skip routes where tokenIn or tokenOut is also the intermediate
    if (new Set(path).size !== path.length) continue;

    try {
      const amountOut = await getRouterQuote(TJ_V1_ROUTER, path, amountIn);
      
      if (amountOut && amountOut > bestAmount) {
        bestAmount = amountOut;
        bestPath = path;
        bestLabel = label;
        
        const existing = allQuotes.find(q => q.dex === label);
        if (!existing) {
          allQuotes.push({ dex: label, amountOut: amountOut.toString() });
        } else if (BigInt(existing.amountOut) < amountOut) {
          existing.amountOut = amountOut.toString();
        }
      } else if (amountOut && amountOut > 0n) {
        const existing = allQuotes.find(q => q.dex === label);
        if (!existing) {
          allQuotes.push({ dex: label, amountOut: amountOut.toString() });
        } else if (BigInt(existing.amountOut) < amountOut) {
          existing.amountOut = amountOut.toString();
        }
      }
    } catch {
      // This path doesn't have liquidity, skip silently
    }
  }

  // Also try Pangolin direct
  try {
    const pangolinAmount = await getRouterQuote(
      PANGOLIN_ROUTER,
      [tokenInLower, tokenOutLower],
      amountIn
    );
    
    if (pangolinAmount && pangolinAmount > 0n) {
      allQuotes.push({ dex: 'Pangolin', amountOut: pangolinAmount.toString() });
      
      if (pangolinAmount > bestAmount) {
        bestAmount = pangolinAmount;
        bestPath = [tokenInLower, tokenOutLower];
        bestLabel = 'Pangolin';
      }
    }
  } catch {
    // Pangolin doesn't have this pair
  }

  if (bestAmount === 0n) {
    throw new Error('No valid route found on any DEX');
  }

  return {
    bestAmount,
    bestPath,
    bestDex: bestLabel,
    allQuotes,
  };
}

// ============== HONO APP ==============

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    network: 'avalanche-mainnet',
  });
});

app.get('/', (c) => {
  return c.json({
    name: 'Avalanche DEX Router API',
    version: '1.0.0',
    description: 'DEX aggregator for Avalanche network - Powered by Cloudflare Workers',
    poweredBy: 'SnowMonster DeFi',
    endpoints: {
      quote: '/quote',
      'quote/best': '/quote/best',
      'quote/compare': '/quote/compare',
      health: '/health',
      dexes: '/dexes',
      tokens: '/tokens',
    },
  });
});

app.get('/dexes', (c) => {
  return c.json({
    dexes: [
      {
        name: 'TraderJoeV1',
        type: 'Uniswap V2',
        description: 'Trader Joe V1 - Uniswap V2 style AMM with multi-hop routing',
        website: 'https://traderjoexyz.com',
        feeRange: '0.3%',
        router: TJ_V1_ROUTER,
      },
      {
        name: 'Pangolin',
        type: 'Uniswap V2',
        description: 'Pangolin - Uniswap V2 style AMM',
        website: 'https://pangolin.exchange',
        feeRange: '0.3%',
        router: PANGOLIN_ROUTER,
      },
    ],
  });
});

app.get('/tokens', (c) => {
  const tokens = Object.entries(TOKENS).map(([symbol, address]) => ({
    symbol,
    address,
    decimals: TOKEN_DECIMALS[address] || 18,
  }));
  return c.json({ tokens });
});

app.get('/quote', async (c) => {
  try {
    const dex = c.req.query('dex');
    const tokenIn = c.req.query('tokenIn');
    const tokenOut = c.req.query('tokenOut');
    const amountIn = c.req.query('amountIn');

    if (!tokenIn || !tokenOut || !amountIn) {
      return c.json({ error: 'Missing required parameters: tokenIn, tokenOut, amountIn' }, 400);
    }

    const tokenInAddress = resolveToken(tokenIn);
    const tokenOutAddress = resolveToken(tokenOut);
    const inDecimals = getTokenDecimals(tokenInAddress);
    const outDecimals = getTokenDecimals(tokenOutAddress);

    const amountInWei = parseAmount(amountIn as string, inDecimals);

    const routerAddress = dex?.toLowerCase() === 'pangolin' ? PANGOLIN_ROUTER : TJ_V1_ROUTER;
    const dexName = dex?.toLowerCase() === 'pangolin' ? 'Pangolin' : 'TraderJoeV1';

    let amountOut = await getRouterQuote(routerAddress, [tokenInAddress, tokenOutAddress], amountInWei);
    
    if (!amountOut || amountOut === 0n) {
      amountOut = await getRouterQuote(
        routerAddress,
        [tokenInAddress, TOKENS.WAVAX, tokenOutAddress],
        amountInWei
      );
    }

    if (!amountOut || amountOut === 0n) {
      return c.json({ error: 'No liquidity for this pair' }, 404);
    }

    const amountOutFormatted = Number(amountOut) / Math.pow(10, outDecimals);

    return c.json({
      dex: dexName,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      amountOut: amountOut.toString(),
      amountOutFormatted,
      priceImpact: 0.05,
      route: [tokenInAddress, tokenOutAddress],
      estimatedGas: '150000',
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Quote error:', error);
    return c.json({ error: error.message || 'Failed to get quote' }, 500);
  }
});

app.get('/quote/best', async (c) => {
  try {
    const tokenIn = c.req.query('tokenIn');
    const tokenOut = c.req.query('tokenOut');
    const amountIn = c.req.query('amountIn');

    if (!tokenIn || !tokenOut || !amountIn) {
      return c.json({
        error: 'Missing required parameters',
        required: ['tokenIn', 'tokenOut', 'amountIn']
      }, 400);
    }

    const tokenInAddress = resolveToken(tokenIn);
    const tokenOutAddress = resolveToken(tokenOut);
    const inDecimals = getTokenDecimals(tokenInAddress);
    const outDecimals = getTokenDecimals(tokenOutAddress);

    const amountInWei = parseAmount(amountIn as string, inDecimals);

    const quote = await getMultiHopBestQuote(tokenInAddress, tokenOutAddress, amountInWei);
    const amountOutFormatted = Number(quote.bestAmount) / Math.pow(10, outDecimals);
    const estimatedGas = quote.bestPath.length === 2 ? '120000' : '180000';

    return c.json({
      bestDex: quote.bestDex,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      amountOut: quote.bestAmount.toString(),
      amountOutFormatted,
      priceImpact: 0.05,
      route: quote.bestPath,
      estimatedGas,
      savings: 0,
      allQuotes: quote.allQuotes,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Best route error:', error);
    return c.json({
      error: 'Failed to find best route',
      message: error.message
    }, 500);
  }
});

app.get('/quote/compare', async (c) => {
  try {
    const tokenIn = c.req.query('tokenIn');
    const tokenOut = c.req.query('tokenOut');
    const amountIn = c.req.query('amountIn');

    if (!tokenIn || !tokenOut || !amountIn) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    const tokenInAddress = resolveToken(tokenIn);
    const tokenOutAddress = resolveToken(tokenOut);
    const inDecimals = getTokenDecimals(tokenInAddress);
    
    const amountInWei = parseAmount(amountIn as string, inDecimals);

    const quote = await getMultiHopBestQuote(tokenInAddress, tokenOutAddress, amountInWei);

    const sorted = [...quote.allQuotes].sort((a, b) =>
      BigInt(b.amountOut) > BigInt(a.amountOut) ? 1 : -1
    );

    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    
    const spread = sorted.length > 1
      ? Number(BigInt(best.amountOut) - BigInt(worst.amountOut)) / Number(best.amountOut) * 100
      : 0;

    return c.json({
      tokenIn,
      tokenOut,
      amountIn,
      quotes: sorted,
      best: { dex: best.dex, amountOut: best.amountOut },
      worst: { dex: worst.dex, amountOut: worst.amountOut },
      spread,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/swap/prepare', async (c) => {
  try {
    const body = await c.req.json();
    const { tokenIn, tokenOut, amountIn, slippagePercent = 0.5 } = body;

    if (!tokenIn || !tokenOut || !amountIn) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }

    const tokenInAddress = resolveToken(tokenIn);
    const tokenOutAddress = resolveToken(tokenOut);
    const inDecimals = getTokenDecimals(tokenInAddress);
    
    const amountInWei = parseAmount(amountIn as string, inDecimals);
    
    const quote = await getMultiHopBestQuote(tokenInAddress, tokenOutAddress, amountInWei);
    const minAmountOut = (BigInt(quote.bestAmount) * BigInt(10000 - Math.floor(slippagePercent * 100))) / 10000n;

    return c.json({
      to: DEX_ROUTER_ADDRESS,
      data: '0x',
      value: tokenInAddress.toLowerCase() === TOKENS.AVAX ? amountInWei.toString() : '0',
      gasLimit: quote.bestPath.length === 2 ? '120000' : '180000',
      quote: {
        amountOut: quote.bestAmount.toString(),
        minAmountOut: minAmountOut.toString(),
        bestDex: quote.bestDex,
        route: quote.bestPath,
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;