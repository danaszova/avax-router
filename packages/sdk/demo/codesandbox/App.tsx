import React, { useState } from 'react';
import { AvaxRouter, AVALANCHE_TOKENS } from '@danaszova/avax-router-sdk';
import './styles.css';

// Demo component showing SDK usage
export default function App() {
  const [tokenIn, setTokenIn] = useState('AVAX');
  const [tokenOut, setTokenOut] = useState('USDC');
  const [amount, setAmount] = useState('1');
  const [quote, setQuote] = useState<any>(null);
  const [allQuotes, setAllQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = new AvaxRouter();

  const handleGetQuote = async () => {
    setLoading(true);
    setError(null);
    setQuote(null);
    setAllQuotes([]);

    try {
      // Get best quote
      const bestQuote = await router.getBestQuote({
        tokenIn,
        tokenOut,
        amountIn: amount,
      });
      setQuote(bestQuote);

      // Get all quotes for comparison
      const quotes = await router.getAllQuotes({
        tokenIn,
        tokenOut,
        amountIn: amount,
      });
      setAllQuotes(quotes);
    } catch (err: any) {
      setError(err.message || 'Failed to get quote');
    } finally {
      setLoading(false);
    }
  };

  const tokens = Object.keys(AVALANCHE_TOKENS).filter(t => t !== 'AVAX');

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 AVAX Router SDK Demo</h1>
        <p>Get the best swap rates across all Avalanche DEXes</p>
      </div>

      <div className="swap-form">
        <div className="input-group">
          <label>From</label>
          <div className="input-row">
            <select value={tokenIn} onChange={(e) => setTokenIn(e.target.value)}>
              <option value="AVAX">AVAX</option>
              {tokens.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>
        </div>

        <div className="swap-icon">⇅</div>

        <div className="input-group">
          <label>To</label>
          <select value={tokenOut} onChange={(e) => setTokenOut(e.target.value)}>
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="JOE">JOE</option>
            <option value="PNG">PNG</option>
            <option value="WAVAX">WAVAX</option>
          </select>
        </div>

        <button 
          className="swap-button" 
          onClick={handleGetQuote}
          disabled={loading || !amount}
        >
          {loading ? 'Finding best price...' : 'Get Best Quote'}
        </button>
      </div>

      {error && (
        <div className="error">
          ❌ {error}
        </div>
      )}

      {quote && (
        <div className="result">
          <h2>✨ Best Quote</h2>
          <div className="best-quote">
            <div className="amount">
              {quote.amountOutFormatted} {tokenOut}
            </div>
            <div className="dex">
              via {quote.bestDex}
            </div>
          </div>
        </div>
      )}

      {allQuotes.length > 0 && (
        <div className="all-quotes">
          <h3>📊 All DEX Comparison</h3>
          <table>
            <thead>
              <tr>
                <th>DEX</th>
                <th>Output</th>
                <th>Savings</th>
              </tr>
            </thead>
            <tbody>
              {allQuotes
                .sort((a, b) => parseFloat(b.amountOut) - parseFloat(a.amountOut))
                .map((q, i) => (
                  <tr key={q.dex} className={i === 0 ? 'best' : ''}>
                    <td>{q.dex}</td>
                    <td>{q.amountOutFormatted} {tokenOut}</td>
                    <td>
                      {i === 0 ? '🏆 Best' : 
                        `-${((parseFloat(allQuotes[0].amountOut) - parseFloat(q.amountOut)) / parseFloat(allQuotes[0].amountOut) * 100).toFixed(2)}%`
                      }
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="code-example">
        <h3>💻 Code Used</h3>
        <pre>
{`import { AvaxRouter } from '@danaszova/avax-router-sdk';

const router = new AvaxRouter();

// Get best quote
const quote = await router.getBestQuote({
  tokenIn: '${tokenIn}',
  tokenOut: '${tokenOut}',
  amountIn: '${amount}',
});

console.log(\`Best: \${quote.amountOutFormatted} \${tokenOut} via \${quote.bestDex}\`);

// Compare all DEXes
const allQuotes = await router.getAllQuotes({
  tokenIn: '${tokenIn}',
  tokenOut: '${tokenOut}', 
  amountIn: '${amount}',
});`}
        </pre>
      </div>

      <div className="footer">
        <p>
          <a href="https://www.npmjs.com/package/@danaszova/avax-router-sdk" target="_blank" rel="noopener">
            📦 npm
          </a>
          {' | '}
          <a href="https://github.com/avax-router/sdk" target="_blank" rel="noopener">
            💻 GitHub
          </a>
        </p>
      </div>
    </div>
  );
}