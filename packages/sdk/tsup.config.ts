import { defineConfig } from 'tsup';

export default defineConfig([
  // Core SDK
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['ethers'],
  },
  // React SDK
  {
    entry: { 'react/index': 'src/react/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ['react', 'react-dom', 'viem', 'wagmi', '@rainbow-me/rainbowkit'],
  },
]);