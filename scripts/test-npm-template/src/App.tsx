import { DexRouterWidget, Web3Provider } from '@snowmonster_defi/widget';

const App = () => {
    return (
        <Web3Provider theme="dark">
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0f',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <h1 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '2rem' }}>
                    🧪 npm Package Test
                </h1>
                <p style={{ color: '#888', marginBottom: '2rem' }}>
                    Testing @snowmonster_defi/widget from npm registry
                </p>
                <div style={{
                    padding: '10px',
                    borderRadius: '2rem',
                    background: 'linear-gradient(135deg, rgba(232, 20, 26, 0.2), rgba(232, 20, 26, 0.05))',
                }}>
                    <DexRouterWidget
                        theme="dark"
                        primaryColor="#E8141A"
                        borderRadius="lg"
                        defaultTokenIn="AVAX"
                        defaultTokenOut="USDC"
                    />
                </div>
                <p style={{ color: '#555', marginTop: '2rem', fontSize: '0.8rem' }}>
                    If you see the widget above, the npm package works! ✅
                </p>
            </div>
        </Web3Provider>
    );
};

export default App;