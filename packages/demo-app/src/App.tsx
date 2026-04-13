import { DexRouterWidget, Web3Provider } from '@snowmonster_defi/widget';

const App = () => {
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
                                <li><a href="#developers">Developers</a></li>
                                <li><a href="#sdk">SDK</a></li>
                            </ul>
                        </nav>
                        <a href="#developers" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Get SDK</a>
                    </div>
                </header>

                <main className="landing-container">
                    {/* Hero Section */}
                    <section className="hero">
                        <div className="hero-content">
                            <span className="section-tag">Avalanche DEX Aggregator</span>
                            <h1>Smart Routing. <span>Best Price.</span></h1>
                            <p>
                            We query top DEXs on Avalanche in real-time and route your trade 
                            to the best price — automatically. Starting with Trader Joe. Low fees. Fast execution.
                            </p>
                            <div className="hero-actions">
                                <a href="#widget" className="btn-primary">Start Swapping</a>
                                <a href="#developers" className="btn-secondary">View Documentation</a>
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
                            Every swap triggers a real-time comparison across supported Avalanche DEXs, starting with Trader Joe.
                            No cached prices. No stale data. Live queries that find you the best route — every single time.
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
                                    We don't cache. We don't guess. Every swap queries top DEXs like Trader Joe — live — to find the true best price.
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

                    {/* Developer / Vibe Coder Section */}
                    <section className="dev-section" id="developers">
                        <div className="dev-container">
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
    onSwapSuccess={(tx) => alert('Swapped!')}
  />
);`}</code>
                                    </pre>
                                </div>
                            </div>
                            <div className="dev-text">
                                <span className="section-tag">Developer SDK</span>
                                <h2>DeFi in a Box. <span>Free Forever.</span></h2>
                                <p style={{ marginBottom: '2rem', fontSize: '1.1rem', opacity: 0.7 }}>
                                    Drop the AVAX Router widget into your React app and give your users best-in-class swap functionality 
                                    in minutes. Open source. Partner fee sharing built-in. No vendor lock-in.
                                </p>
                                <div className="features-small" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ opacity: 0.8 }}>
                                        <h4 style={{ color: '#E8141A', marginBottom: '0.5rem' }}>Fully Customizable</h4>
                                        <p style={{ fontSize: '0.85rem' }}>Theme, colors, tokens — match your brand perfectly.</p>
                                    </div>
                                    <div style={{ opacity: 0.8 }}>
                                        <h4 style={{ color: '#E8141A', marginBottom: '0.5rem' }}>Batteries Included</h4>
                                        <p style={{ fontSize: '0.85rem' }}>Auto AVAX wrapping, multi-hop routing, gas estimates.</p>
                                    </div>
                                    <div style={{ opacity: 0.8 }}>
                                        <h4 style={{ color: '#E8141A', marginBottom: '0.5rem' }}>Partner Revenue</h4>
                                        <p style={{ fontSize: '0.85rem' }}>Earn 0.25% on every swap through your integration.</p>
                                    </div>
                                    <div style={{ opacity: 0.8 }}>
                                        <h4 style={{ color: '#E8141A', marginBottom: '0.5rem' }}>Open Source</h4>
                                        <p style={{ fontSize: '0.85rem' }}>Audit the code. Fork it. Build on top of it.</p>
                                    </div>
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