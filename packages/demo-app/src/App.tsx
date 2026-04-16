import { DexRouterWidget, Web3Provider } from '@snowmonster_defi/widget';
import { useState } from 'react';

const App = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Web3Provider theme="dark">
            <div className="app-root">
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>

                <header>
                    <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <a href="/" className="logo" style={{ textDecoration: 'none' }}>
                            <img src="/logo.png" alt="AVAX Router" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                            <span>AVAX<span>ROUTER</span></span>
                        </a>
                        <nav>
                            <ul>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#developers">Developer Tools</a></li>
                                <li><a href="#widget-section">Widget</a></li>
                                <li><a href="#sdk-section">SDK</a></li>
                            </ul>
                        </nav>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <a href="#developers" className="btn-secondary hidden-mobile" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Start Building</a>
                            <button 
                                className="mobile-menu-btn" 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', display: 'none' }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {isMenuOpen ? (
                                        <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
                                    ) : (
                                        <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="mobile-menu" style={{
                            position: 'absolute',
                            top: '100px',
                            left: 0,
                            right: 0,
                            background: 'rgba(10, 10, 11, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '1rem 2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            zIndex: 99
                        }}>
                            <a href="#features" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 600 }}>Features</a>
                            <a href="#developers" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 600 }}>Developer Tools</a>
                            <a href="#widget-section" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 600 }}>Widget</a>
                            <a href="#sdk-section" onClick={() => setIsMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 600 }}>SDK</a>
                            <a href="#developers" onClick={() => setIsMenuOpen(false)} className="btn-secondary" style={{ textAlign: 'center', marginTop: '0.5rem' }}>Start Building</a>
                        </div>
                    )}
                </header>

                <main className="landing-container">
                    {/* Hero Section */}
                    <section className="hero">
                        <div className="hero-content">
                            <span className="section-tag">Avalanche DEX Aggregator</span>
                            <h1>Smart Routing. <span>Best Price.</span></h1>
                            <p>
                            We query top DEXs on Avalanche in real-time (Trader Joe, Pangolin, etc.) and route your trade 
                            to the best price — automatically. Low fees. Fast execution. The ultimate routing engine.
                            </p>
                            <div className="hero-actions">
                                <a href="#widget" className="btn-primary">Start Swapping</a>
                                <a href="#developers" className="btn-secondary">View Developer Tools</a>
                            </div>
                        </div>
                        <div className="hero-widget" id="widget">
                            <div style={{
                                position: 'relative',
                                padding: '10px',
                                borderRadius: '3rem',
                                background: 'linear-gradient(135deg, rgba(232, 20, 26, 0.2), rgba(232, 20, 26, 0.05))',
                                boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5)'
                            }}>
                                <DexRouterWidget
                                    theme="dark"
                                    primaryColor="#E8141A"
                                    borderRadius="lg"
                                    defaultTokenIn="AVAX"
                                    defaultTokenOut="USDC"
                                    apiUrl={import.meta.env.VITE_API_URL}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Stats Bar */}
                    <section className="stats">
                        <div className="stat-card">
                            <h3>0.05%</h3>
                            <p>Protocol Fee</p>
                        </div>
                        <div className="stat-card">
                            <h3>Top</h3>
                            <p>DEXs Aggregated</p>
                        </div>
                        <div className="stat-card">
                            <h3>~2s</h3>
                            <p>Confirmation Time</p>
                        </div>
                    </section>

                    {/* Core Value Proposition */}
                    <section style={{ padding: '80px 0', textAlign: 'center' }}>
                        <span className="section-tag">Our Promise</span>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
                            Live Price Comparison. <span>Every Swap.</span>
                        </h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.7, maxWidth: '700px', margin: '1.5rem auto 0', lineHeight: '1.8' }}>
                            Every swap triggers a real-time comparison across the top Avalanche DEXs, including Trader Joe and Pangolin.
                            No cached prices. No stale data. Live queries that find you the best route across the entire ecosystem — every single time.
                        </p>
                    </section>

                    {/* Reasons Section */}
                    <section style={{ padding: '100px 0', textAlign: 'center' }} id="features">
                        <span className="section-tag">Why We're Different</span>
                        <h2 style={{ fontSize: '3rem', marginBottom: '4rem' }}>Zero Bias. <span>Total Precision.</span></h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                            <div className="stat-card" style={{ textAlign: 'left' }}>
                                <h4 style={{ color: '#E8141A', fontSize: '1.5rem', marginBottom: '1rem' }}>Real-Time Aggregation</h4>
                                <p style={{ textTransform: 'none', fontSize: '1rem', lineHeight: '1.6', letterSpacing: '0' }}>
                                    We don't cache. We don't guess. Every swap queries the entire Avalanche ecosystem — live — to find the true best price.
                                </p>
                            </div>
                            <div className="stat-card" style={{ textAlign: 'left' }}>
                                <h4 style={{ color: '#E8141A', fontSize: '1.5rem', marginBottom: '1rem' }}>Zero Bias Routing</h4>
                                <p style={{ textTransform: 'none', fontSize: '1rem', lineHeight: '1.6', letterSpacing: '0' }}>
                                    No secret deals. No preferential treatment. Your trade goes where it gets the most value — period. Pure math, no favorites.
                                </p>
                            </div>
                            <div className="stat-card" style={{ textAlign: 'left' }}>
                                <h4 style={{ color: '#E8141A', fontSize: '1.5rem', marginBottom: '1rem' }}>Built for Avalanche</h4>
                                <p style={{ textTransform: 'none', fontSize: '1rem', lineHeight: '1.6', letterSpacing: '0' }}>
                                    Native AVAX support with seamless wrapping. Sub-second finality. Optimized smart contracts designed specifically for the Avalanche ecosystem.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* How It Works */}
                    <section style={{ padding: '80px 0', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '2rem', margin: '40px 0' }}>
                        <span className="section-tag">How It Works</span>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Three Steps. <span>Best Price. Always.</span></h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem', padding: '0 40px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(232, 20, 26, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#E8141A' }}>1</div>
                                <h4 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>You Click Swap</h4>
                                <p style={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: '1.6' }}>Enter your tokens and amount. We handle the rest.</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(232, 20, 26, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#E8141A' }}>2</div>
                                <h4 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>We Query Top DEXs</h4>
                                <p style={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: '1.6' }}>Real-time price discovery across supported exchanges.</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(232, 20, 26, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#E8141A' }}>3</div>
                                <h4 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>Best Route Wins</h4>
                                <p style={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: '1.6' }}>Your trade executes where you get the most tokens back.</p>
                            </div>
                        </div>
                    </section>

                    {/* Developer Tools Introduction */}
                    <section id="developers" style={{ padding: '80px 0', textAlign: 'center', marginTop: '40px' }}>
                        <span className="section-tag">Developer Tools</span>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
                            Choose Your Integration. <span>Build Better DeFi.</span>
                        </h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.7, maxWidth: '700px', margin: '1.5rem auto 3rem', lineHeight: '1.8' }}>
                            Whether you want a drop-in UI component or full programmatic control, we have the tools you need.
                            Both options include partner fee sharing, letting you monetize your application.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                            <div className="stat-card" style={{ padding: '2rem', border: '1px solid rgba(232, 20, 26, 0.3)' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>The Widget</h3>
                                <p style={{ opacity: 0.7, marginBottom: '1.5rem', minHeight: '80px' }}>
                                    A complete, drop-in React component. Perfect for quickly adding swap functionality with zero UI work.
                                </p>
                                <a href="#widget-section" className="btn-primary" style={{ width: '100%', display: 'block' }}>Explore Widget</a>
                            </div>
                            <div className="stat-card" style={{ padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>The SDK</h3>
                                <p style={{ opacity: 0.7, marginBottom: '1.5rem', minHeight: '80px' }}>
                                    Powerful React hooks and direct API access. Perfect for building custom swap interfaces and advanced routing.
                                </p>
                                <a href="#sdk-section" className="btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>Explore SDK</a>
                            </div>
                        </div>
                    </section>

                    {/* Widget Section */}
                    <section className="dev-section" id="widget-section" style={{ background: 'rgba(232, 20, 26, 0.02)' }}>
                        <div className="dev-container">
                            <div className="dev-text">
                                <span className="section-tag">Drop-in UI Component</span>
                                <h2>The React Widget. <span>Ready to deploy.</span></h2>
                                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', opacity: 0.7 }}>
                                    Drop the AVAX Router widget into your React app and give your users best-in-class swap functionality 
                                    in minutes. Fully customizable and responsive.
                                </p>
                                
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <code style={{ color: '#4ADE80' }}>npm install @snowmonster_defi/widget</code>
                                    <a href="https://www.npmjs.com/package/@snowmonster_defi/widget" target="_blank" rel="noopener noreferrer" style={{ color: '#E8141A', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>View on npm →</a>
                                </div>

                                <div className="features-small" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ opacity: 0.8 }}>
                                        <h4 style={{ color: '#E8141A', marginBottom: '0.5rem' }}>Fully Customizable</h4>
                                        <p style={{ fontSize: '0.85rem' }}>Theme, colors, tokens — match your brand perfectly.</p>
                                    </div>
                                    <div style={{ opacity: 0.8 }}>
                                        <h4 style={{ color: '#E8141A', marginBottom: '0.5rem' }}>Batteries Included</h4>
                                        <p style={{ fontSize: '0.85rem' }}>Auto AVAX wrapping, multi-hop routing, gas estimates.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="code-window">
                                <div className="code-header">
                                    <div className="dot red"></div>
                                    <div className="dot yellow"></div>
                                    <div className="dot green"></div>
                                </div>
                                <div className="code-content">
                                    <pre>
                                        <code>{`import { DexRouterWidget } from '@snowmonster_defi/widget';

const App = () => (
  <DexRouterWidget
    theme="dark"
    primaryColor="#E8141A"
    partnerFeeBps={25} // Earn 0.25%
    partnerAddress="0xYourWallet..."
    onSwapSuccess={(tx) => alert('Swapped!')}
  />
);`}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SDK Section */}
                    <section className="dev-section flex-reverse" id="sdk-section">
                        <div className="dev-container" style={{ flexDirection: 'row-reverse' }}>
                            <div className="dev-text">
                                <span className="section-tag">Programmatic Access</span>
                                <h2>The React SDK. <span>Build your way.</span></h2>
                                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', opacity: 0.7 }}>
                                    Want to build a custom UI? Our SDK provides powerful React hooks for quoting, routing, and executing swaps across the Avalanche ecosystem.
                                </p>
                                
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <code style={{ color: '#4ADE80' }}>npm install @danaszova/avax-router-sdk</code>
                                    <a href="https://www.npmjs.com/package/@danaszova/avax-router-sdk" target="_blank" rel="noopener noreferrer" style={{ color: '#E8141A', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>View on npm →</a>
                                </div>

                                <div className="features-small" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ opacity: 0.8 }}>
                                        <h4 style={{ color: '#E8141A', marginBottom: '0.5rem' }}>Type Safe</h4>
                                        <p style={{ fontSize: '0.85rem' }}>Written in TypeScript with comprehensive type definitions.</p>
                                    </div>
                                    <div style={{ opacity: 0.8 }}>
                                        <h4 style={{ color: '#E8141A', marginBottom: '0.5rem' }}>React Hooks</h4>
                                        <p style={{ fontSize: '0.85rem' }}>useQuote and useSwap hooks make integration seamless.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="code-window">
                                <div className="code-header">
                                    <div className="dot red"></div>
                                    <div className="dot yellow"></div>
                                    <div className="dot green"></div>
                                </div>
                                <div className="code-content">
                                    <pre>
                                        <code>{`import { useQuote, useSwap } from '@danaszova/avax-router-sdk/react';

const CustomSwapUI = () => {
  // 1. Get the best route
  const { quote, isLoading } = useQuote({
    tokenIn: 'AVAX',
    tokenOut: 'USDC',
    amountIn: '1.5'
  });

  // 2. Execute the swap
  const { swap, isSwapping } = useSwap({
    onSuccess: (txHash) => console.log('Done!', txHash)
  });

  return (
    <button onClick={() => swap(quote)}>
      {isSwapping ? 'Swapping...' : 'Swap Now'}
    </button>
  );
};`}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Trust Section */}
                    <section style={{ padding: '100px 0', textAlign: 'center' }}>
                        <span className="section-tag">Built Different</span>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Transparent. <span>Verifiable. Trustless.</span></h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                            <div className="stat-card">
                                <h3 style={{ color: '#E8141A', fontSize: '2rem', marginBottom: '0.5rem' }}>0.05%</h3>
                                <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Protocol Fee</p>
                            </div>
                            <div className="stat-card">
                                <h3 style={{ color: '#E8141A', fontSize: '2rem', marginBottom: '0.5rem' }}>100%</h3>
                                <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Open Source</p>
                            </div>
                            <div className="stat-card">
                                <h3 style={{ color: '#E8141A', fontSize: '2rem', marginBottom: '0.5rem' }}>0</h3>
                                <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Hidden Fees</p>
                            </div>
                            <div className="stat-card">
                                <h3 style={{ color: '#E8141A', fontSize: '2rem', marginBottom: '0.5rem' }}>∞</h3>
                                <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Extensible</p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '50px 0', marginTop: '100px' }}>
                    <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <a href="/" className="logo" style={{ margin: 0, textDecoration: 'none' }}>
                            <img src="/logo.png" alt="AVAX Router" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                            <span>AVAX<span>ROUTER</span></span>
                        </a>
                        <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>
                            Smart routing for Avalanche DeFi
                        </p>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <a href="https://www.npmjs.com/package/@snowmonster_defi/widget" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', opacity: 0.5, fontSize: '0.9rem' }}>npm</a>
                            <a href="https://github.com/danaszova/avax-router" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', opacity: 0.5, fontSize: '0.9rem' }}>GitHub</a>
                        </div>
                    </div>
                    <div className="landing-container" style={{ marginTop: '30px', textAlign: 'center' }}>
                        <p style={{ opacity: 0.3, fontSize: '0.8rem' }}>© 2026 SnowMonster DeFi. Built on Avalanche. Open Source.</p>
                    </div>
                </footer>
            </div>
        </Web3Provider>
    );
};

export default App;