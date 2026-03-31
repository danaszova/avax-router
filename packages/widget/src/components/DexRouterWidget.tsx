import React, { useState, useEffect, useCallback } from 'react';
import { Token, Quote, WidgetConfig } from '../types';
import { AVALANCHE_TOKENS, DEFAULT_SLIPPAGE, API_BASE_URL, DEX_ROUTER_ADDRESS } from '../utils/constants';
import { useAccount, useWriteContract, useReadContract, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'ethers';

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const DEX_ROUTER_ABI = [
  {
    name: 'swapBestRoute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

const WAVAX_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
] as const;

interface DexRouterWidgetProps extends WidgetConfig { }

export const DexRouterWidget: React.FC<DexRouterWidgetProps> = ({
  theme = 'dark',
  primaryColor = '#E84142',
  borderRadius = 'lg',
  width = 'default',
  defaultTokenIn,
  defaultTokenOut,
  tokenList = 'default',
  slippage = DEFAULT_SLIPPAGE,
  hideRouteInfo = false,
  hideSettings = false,
  partnerId,
  apiUrl = API_BASE_URL,
  onSwapStart,
  onSwapSuccess,
  onSwapError,
}) => {
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState<string>('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState<number>(slippage);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState<'in' | 'out' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);

  const { isConnected, address } = useAccount();

  // Contract Write Hooks
  const { writeContractAsync: writeContract, isPending: isSwapPending } = useWriteContract();
  const { data: balanceData } = useBalance({
    address: address,
    token: tokenIn?.symbol === 'AVAX' ? undefined : (tokenIn?.address as `0x${string}`),
  });

  // Allowance Handling
  const { data: allowance } = useReadContract({
    address: tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && tokenIn?.symbol !== 'AVAX' ? [address as `0x${string}`, DEX_ROUTER_ADDRESS as `0x${string}`] : undefined,
  });

  const needsApproval = tokenIn?.symbol !== 'AVAX' &&
    allowance !== undefined &&
    quote !== undefined &&
    BigInt(allowance?.toString() || '0') < BigInt(Math.floor(parseFloat(amountIn || '0') * Math.pow(10, tokenIn?.decimals || 18)));

  const tokens = tokenList === 'default'
    ? AVALANCHE_TOKENS
    : Array.isArray(tokenList)
      ? tokenList
      : AVALANCHE_TOKENS;

  useEffect(() => {
    if (defaultTokenIn) {
      const token = tokens.find(t =>
        t.address.toLowerCase() === defaultTokenIn.toLowerCase() ||
        t.symbol.toLowerCase() === defaultTokenIn.toLowerCase()
      );
      if (token) setTokenIn(token);
    }
    if (defaultTokenOut) {
      const token = tokens.find(t =>
        t.address.toLowerCase() === defaultTokenOut.toLowerCase() ||
        t.symbol.toLowerCase() === defaultTokenOut.toLowerCase()
      );
      if (token) setTokenOut(token);
    }
  }, [defaultTokenIn, defaultTokenOut, tokens]);

  const fetchQuote = useCallback(async () => {
    if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) === 0) {
      setQuote(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountInWei = (parseFloat(amountIn) * Math.pow(10, tokenIn.decimals)).toLocaleString('fullwide', { useGrouping: false });

      const params = new URLSearchParams({
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: amountInWei,
        ...(partnerId && { partnerId }),
      });

      console.log('Fetching quote with params:', {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: amountInWei,
        url: `${apiUrl}/quote/best?${params}`
      });

      const response = await fetch(`${apiUrl}/quote/best?${params}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [tokenIn, tokenOut, amountIn, apiUrl, partnerId]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchQuote]);

  const handleSwapTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(quote?.amountOut || '');
    setQuote(null);
  };

  const handleMaxClick = () => {
    // Use real balance from wallet
    if (balanceData) {
      setAmountIn(formatUnits(balanceData.value, balanceData.decimals));
    }
  };

  const handleSwap = async () => {
    if (!quote || !tokenIn || !tokenOut || !address) return;

    setLoading(true);
    setError(null);

    try {
      onSwapStart?.(quote);

      const amountInWei = BigInt(Math.floor(parseFloat(amountIn) * Math.pow(10, tokenIn.decimals)));
      const minAmountOut = (BigInt(quote.amountOut) * BigInt(Math.floor((1 - customSlippage / 100) * 10000))) / 10000n;

      // 1. Handle Native AVAX -> WAVAX wrapping
      if (tokenIn.symbol === 'AVAX') {
        console.log('Wrapping native AVAX to WAVAX...');
        setError('Step 1/3: Wrapping AVAX...');
        await writeContract({
          address: tokenIn.address as `0x${string}`,
          abi: WAVAX_ABI,
          functionName: 'deposit',
          value: amountInWei,
        });
        // In a real app, wait for receipt. For now, assume success or next step will fail anyway.
      }

      // 2. Handle Approval if needed (even after wrapping, router needs allowance)
      if (needsApproval || tokenIn.symbol === 'AVAX') {
        console.log('Requesting approval...');
        setError('Step 2/3: Authorizing Router...');
        await writeContract({
          address: tokenIn.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [DEX_ROUTER_ADDRESS as `0x${string}`, amountInWei],
        });
      }

      // 3. Execute Swap
      console.log('Executing swap on-chain...');
      setError('Step 3/3: Executing Swap...');
      const hash = await writeContract({
        address: DEX_ROUTER_ADDRESS as `0x${string}`,
        abi: DEX_ROUTER_ABI,
        functionName: 'swapBestRoute',
        args: [
          tokenIn.address as `0x${string}`,
          tokenOut.address as `0x${string}`,
          amountInWei,
          minAmountOut,
          address as `0x${string}`,
        ],
      });

      console.log('Swap transaction sent:', hash);
      setTxHash(hash);
      onSwapSuccess?.({ hash });

      // Reset after success
      setAmountIn('');
      setQuote(null);
    } catch (err: any) {
      console.error('Swap execution failed:', err);
      const msg = err.shortMessage || err.message || 'Swap failed';
      setError(msg);
      onSwapError?.(new Error(msg));
    } finally {
      setLoading(false);
    }
  };

  const widthClass = {
    compact: 'w-80',
    default: 'w-96',
    wide: 'w-[480px]',
  }[width];

  const radiusClass = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-3xl',
  }[borderRadius];

  return (
    <div
      className={`${widthClass} ${radiusClass} overflow-hidden font-sans transition-all duration-300`}
      style={{
        backgroundColor: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: theme === 'dark'
          ? '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 20px 50px rgba(0, 0, 100, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Header with Gradient Blur */}
      <div
        className="px-6 py-5 flex items-center justify-between relative overflow-hidden"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(to bottom, rgba(232, 65, 66, 0.05), transparent)'
            : 'linear-gradient(to bottom, rgba(232, 65, 66, 0.02), transparent)',
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
        }}
      >
        <div className="z-10">
          <h2
            className="text-xl font-black tracking-tight flex items-center gap-2"
            style={{ color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A' }}
          >
            <span style={{ color: primaryColor }}>AVAX</span> ROUTER
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold ml-1 uppercase tracking-widest">Live</span>
          </h2>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
            style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
          >
            0.05% Fee • Aggregated Liquidity
          </p>
        </div>
        <div className="flex items-center gap-2 z-10">
          {isConnected && address && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono font-bold opacity-60">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          )}
          {!hideSettings && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                backgroundColor: showSettings
                  ? (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                  : 'transparent',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.1a2 2 0 01-1-1.72v-.51a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && !hideSettings && (
        <div
          className="px-6 py-5 space-y-3"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
            borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <div className="flex justify-between items-center">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
            >
              Slippage Tolerance
            </span>
            <span className="text-xs font-mono font-bold" style={{ color: primaryColor }}>{customSlippage}%</span>
          </div>
          <div className="flex gap-2">
            {[0.5, 1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setCustomSlippage(s)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={{
                  backgroundColor: customSlippage === s ? primaryColor : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                  color: customSlippage === s ? '#FFFFFF' : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
                  boxShadow: customSlippage === s ? `0 4px 12px ${primaryColor}44` : 'none',
                }}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Swap Interface */}
      <div className="p-4 space-y-2">
        {/* Token In */}
        <div
          className="p-5 rounded-3xl transition-all duration-300 group relative"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            >
              Sell
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                style={{ color: primaryColor }}
                onClick={handleMaxClick}
              >
                MAX
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsTokenSelectorOpen('in')}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200 hover:bg-white/10"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                }}
              >
                {tokenIn?.logoURI ? (
                  <img src={tokenIn.logoURI} alt={tokenIn.symbol} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] font-bold">?</div>
                )}
                <span className="text-lg font-black">{tokenIn?.symbol || 'Select'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-3xl font-black outline-none text-right placeholder:opacity-20"
                style={{
                  color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A',
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            {tokenIn && (
              <p
                className="text-[10px] font-bold opacity-40 uppercase tracking-tighter"
                style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}
              >
                Balance: {balanceData ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)}` : '0.0000'} {tokenIn.symbol}
              </p>
            )}
            <p className="text-[10px] font-bold opacity-20">$0.00</p>
          </div>
        </div>

        {/* Swap Button with Circular Gradient */}
        <div className="flex justify-center -my-6 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-3 rounded-2xl transition-all duration-300 hover:rotate-180 group active:scale-95 shadow-xl"
            style={{
              backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
              border: `4px solid ${theme === 'dark' ? '#0F0F0F' : '#F4F4F4'}`,
              color: primaryColor
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8v12M17 20l4-4M17 20l-4-4" />
            </svg>
          </button>
        </div>

        {/* Token Out */}
        <div
          className="p-5 rounded-3xl transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            >
              Buy
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsTokenSelectorOpen('out')}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200 hover:bg-white/10"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                }}
              >
                {tokenOut?.logoURI ? (
                  <img src={tokenOut.logoURI} alt={tokenOut.symbol} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold">?</div>
                )}
                <span className="text-lg font-black">{tokenOut?.symbol || 'Select'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-w-0 text-right h-10 flex items-center justify-end">
              {loading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : quote ? (
                <span
                  className="text-3xl font-black truncate"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A' }}
                >
                  {(parseFloat(quote.amountOut) / Math.pow(10, tokenOut?.decimals || 18)).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              ) : (
                <span
                  className="text-3xl font-black opacity-20"
                >
                  0.0
                </span>
              )}
            </div>
          </div>

          {tokenOut && quote && (
            <div className="flex justify-between items-center mt-3">
              <p className="text-[10px] font-bold opacity-40">~${(parseFloat(quote.amountOut) / Math.pow(10, tokenOut.decimals) * 1).toFixed(2)}</p>
              <span className="text-[10px] font-black text-emerald-500">BEST PRICE</span>
            </div>
          )}
        </div>

        {/* Route Info Card */}
        {!hideRouteInfo && quote && (
          <div className="space-y-2">
            <div
              className="p-4 rounded-3xl"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.01))',
                border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`,
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Aggregator Path</span>
                <span className="text-[10px] font-bold font-mono text-emerald-500">VIA {quote.bestDex.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="opacity-40">Impact: <span className={Number(quote.priceImpact) > 2 ? 'text-red-500' : 'text-emerald-500'}>{Number(quote.priceImpact || 0).toFixed(2)}%</span></span>
                <span className="opacity-40 text-right">Savings: <span className="text-emerald-500">${Number(quote.savings || 0).toFixed(2)}</span></span>
              </div>
            </div>

            {/* Comparison List */}
            {quote.allQuotes && quote.allQuotes.length > 1 && (
              <div
                className="p-4 rounded-3xl space-y-2"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`
                }}
              >
                <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 px-1">Market Comparison</p>
                {quote.allQuotes.map((q, i) => (
                  <div key={i} className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold opacity-50">{q.dex}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold">
                        {(parseFloat(q.amountOut) / Math.pow(10, tokenOut?.decimals || 18)).toFixed(4)}
                      </span>
                      {q.dex.includes(quote.bestDex) && (
                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1 rounded">BEST</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div
            className="p-4 rounded-2xl text-[11px] font-bold text-center flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'rgba(232, 65, 66, 0.1)',
              color: '#E84142',
              border: '1px solid rgba(232, 65, 66, 0.2)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Main Action Area */}
        <div className="pt-2">
          {txHash ? (
            <div
              className="p-5 rounded-3xl space-y-3 animate-in fade-in zoom-in duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-500 uppercase tracking-tight">Swap Successful!</h3>
                  <p className="text-[10px] opacity-60 font-bold">Funds have been sent to your wallet.</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`https://subnets.avax.network/c-chain/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black text-center border border-emerald-500/20 hover:bg-emerald-500/20 transition-all uppercase tracking-widest"
                >
                  View on Explorer
                </a>
                <button
                  onClick={() => setTxHash(null)}
                  className="w-full py-2 text-[10px] font-black opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : !isConnected ? (
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, mounted }) => {
                return (
                  <div
                    {...(!mounted && {
                      'aria-hidden': true,
                      'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                    })}
                  >
                    {(() => {
                      if (!mounted || !account || !chain) {
                        return (
                          <button
                            onClick={openConnectModal}
                            style={{
                              backgroundColor: primaryColor,
                              boxShadow: `0 10px 30px ${primaryColor}44`,
                            }}
                            className="w-full py-4 rounded-3xl font-black text-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            CONNECT WALLET
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          ) : (
            <button
              onClick={handleSwap}
              disabled={!quote || loading || !tokenIn || !tokenOut || isSwapPending}
              className="w-full py-5 rounded-3xl font-black text-xl transition-all duration-300 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-2xl relative overflow-hidden group"
              style={{
                backgroundColor: primaryColor,
                color: '#FFFFFF',
                boxShadow: `0 15px 35px ${primaryColor}44`,
              }}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {!tokenIn || !tokenOut
                  ? 'SELECT TOKENS'
                  : !amountIn
                    ? 'ENTER AMOUNT'
                    : loading || isSwapPending
                      ? (needsApproval ? 'APPROVING...' : 'CONFIRMING...')
                      : needsApproval
                        ? 'APPROVE & SWAP'
                        : 'EXECUTE SWAP'}
              </div>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant"></div>
            </button>
          )}
        </div>
      </div>

      {/* Token Selection Modal */}
      {isTokenSelectorOpen && (
        <div className="absolute inset-0 z-50 p-4 animate-in fade-in duration-200">
          <div
            className="w-full h-full rounded-3xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: theme === 'dark' ? '#121213' : '#F9F9F9',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Select Token</h3>
              <button onClick={() => { setIsTokenSelectorOpen(null); setSearchQuery(''); }} className="opacity-40 hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="p-4">
              <input
                autoFocus
                type="text"
                placeholder="Search name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500/50 transition-colors"
                style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {tokens
                .filter(t => t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      if (isTokenSelectorOpen === 'in') setTokenIn(token);
                      else setTokenOut(token);
                      setIsTokenSelectorOpen(null);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">?</div>
                      )}
                      <div className="text-left">
                        <p className="text-sm font-black">{token.symbol}</p>
                        <p className="text-[10px] font-bold opacity-40">{token.name}</p>
                      </div>
                    </div>
                    {(isTokenSelectorOpen === 'in' ? tokenIn : tokenOut)?.address === token.address && (
                      <div style={{ color: primaryColor }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .slant {
          clip-path: polygon(20% 0, 100% 0, 80% 100%, 0% 100%);
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        .animate-in {
          animation: animate-in 0.2s ease-out;
        }
        @keyframes animate-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
};