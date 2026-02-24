import React from 'react';
import { DexRouterWidget } from '../src';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Avalanche DEX Router Widget
          </h1>
          <p className="text-gray-400">
            Embeddable swap widget with 0.05% fees
          </p>
        </div>

        {/* Dark Theme (Default) */}
        <DexRouterWidget
          theme="dark"
          defaultTokenIn="0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C"
          defaultTokenOut="0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
          onSwapStart={(quote) => console.log('Swap started:', quote)}
          onSwapSuccess={(receipt) => console.log('Swap success:', receipt)}
          onSwapError={(error) => console.error('Swap error:', error)}
        />

        {/* Light Theme Example */}
        <div className="text-center mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Light Theme</h2>
        </div>
        
        <DexRouterWidget
          theme="light"
          width="compact"
          borderRadius="full"
        />

        {/* Custom Color Example */}
        <div className="text-center mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Custom Brand Color</h2>
        </div>
        
        <DexRouterWidget
          theme="dark"
          primaryColor="#3B82F6"
          width="wide"
        />
      </div>
    </div>
  );
}

export default App;