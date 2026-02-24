# Avalanche DEX Router Widget

Embeddable swap widget for Avalanche DEX Router with 0.05% fees.

## Installation

```bash
npm install @avalanche-dex/widget
# or
yarn add @avalanche-dex/widget
```

## Usage

### React Component

```tsx
import { DexRouterWidget } from '@avalanche-dex/widget';

function App() {
  return (
    <DexRouterWidget
      theme="dark"
      defaultTokenIn="0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C" // WAVAX
      defaultTokenOut="0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" // USDC
      onSwapSuccess={(receipt) => console.log('Swapped!', receipt)}
    />
  );
}
```

### iframe Embed

```html
<iframe 
  src="https://widget.avalanche-dex.com/?theme=dark&partner=yourPartnerId"
  width="420"
  height="600"
  style="border: none; border-radius: 16px;"
/>
```

## Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'dark'` | Color theme |
| `primaryColor` | `string` | `'#E84142'` | Brand color (hex) |
| `borderRadius` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'lg'` | Corner radius |
| `width` | `'compact' \| 'default' \| 'wide'` | `'default'` | Widget width |
| `defaultTokenIn` | `string` | - | Default input token address |
| `defaultTokenOut` | `string` | - | Default output token address |
| `slippage` | `number` | `0.5` | Slippage tolerance (%) |
| `partnerId` | `string` | - | Partner tracking ID |
| `apiUrl` | `string` | - | Custom API endpoint |
| `onSwapStart` | `(quote) => void` | - | Swap initiated callback |
| `onSwapSuccess` | `(receipt) => void` | - | Swap success callback |
| `onSwapError` | `(error) => void` | - | Swap error callback |

## Features

- ✅ Real-time price quotes
- ✅ Multi-hop routing
- ✅ Split routing optimization
- ✅ Customizable themes
- ✅ Partner tracking
- ✅ Mobile responsive
- ✅ Wallet connection ready

## Build

```bash
cd packages/widget
npm install
npm run build
```

## Deploy

```bash
npm run build
# Publish to npm
npm publish
```

