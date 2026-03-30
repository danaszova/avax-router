# Vercel Deployment Guide for Avalanche DEX Router Demo App

## Overview
This guide explains how to deploy the demo app to Vercel using the Cloudflare API (same as `npm run dev:cloudflare`).

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel` or use GitHub Actions
3. **GitHub Account**: For repository connection (optional)

## Deployment Options

### Option 1: Vercel CLI (Manual Deployment)

#### Step 1: Login to Vercel
```bash
cd packages/demo-app
vercel login
```
Follow the browser prompt to authenticate.

#### Step 2: Deploy
```bash
# Preview deployment (test)
vercel

# Production deployment
vercel --prod
```

### Option 2: Vercel Dashboard (Web UI)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository (`danaszova/avax-router`)
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `packages/demo-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: (Auto-filled from `vercel.json`)
5. Click "Deploy"

### Option 3: GitHub Actions (Automatic)
The repository includes `.github/workflows/deploy-vercel.yml` for automatic deployments.

**Setup required**:
1. Add Vercel secrets to GitHub repository:
   - `VERCEL_TOKEN`: Get from Vercel dashboard → Settings → Tokens
   - `VERCEL_ORG_ID`: Get from Vercel dashboard → Settings → General
   - `VERCEL_PROJECT_ID`: Get after first deployment
2. Push changes to trigger deployment:
   ```bash
   git add .
   git commit -m "Deploy demo app"
   git push origin develop
   ```

## Configuration Files

### `vercel.json` (Primary Configuration)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev:cloudflare",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://avax-router-api.avaxrouter.workers.dev",
    "VITE_NETWORK": "avalanche-mainnet",
    "VITE_DEX_ROUTER_ADDRESS": "0xf081117ccd2f0079f1d08B27cB9AcB2D946fDe35"
  }
}
```

### `package.json` (Build Scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "dev:cloudflare": "vite --mode cloudflare",
    "build": "vite build --mode cloudflare",
    "preview": "vite preview --mode cloudflare"
  }
}
```

## Environment Variables
| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `https://avax-router-api.avaxrouter.workers.dev` | Cloudflare Workers API |
| `VITE_NETWORK` | `avalanche-mainnet` | Avalanche network |
| `VITE_DEX_ROUTER_ADDRESS` | `0xf081117ccd2f0079f1d08B27cB9AcB2D946fDe35` | Deployed contract |

## Testing Deployment

After deployment, verify:

1. ✅ **Homepage loads**: Open deployed URL
2. ✅ **Widget renders**: DexRouterWidget component appears
3. ✅ **API connection**: Quotes load for AVAX/USDC
4. ✅ **Wallet connection**: RainbowKit connects to Avalanche
5. ✅ **Responsive design**: Mobile/desktop layouts work

## Troubleshooting

### Build Fails
**Error**: Missing dependencies
**Solution**: Ensure monorepo dependencies are resolved
```bash
cd packages/demo-app
npm install
```

### API Connection Fails
**Error**: CORS or network errors
**Solution**: Cloudflare API has CORS enabled. Check browser console.

### Wallet Connection Fails
**Error**: Wrong network
**Solution**: Ensure Avalanche network is configured in wallet

## Monitoring
1. **Vercel Analytics**: Built-in performance metrics
2. **Error Tracking**: Vercel logs errors automatically
3. **Custom Domain**: Add in Vercel dashboard → Settings → Domains

## Quick Start Script
Use the included deployment script:
```bash
./deploy-demo.sh
```
Follow the interactive prompts.

## Support
- **GitHub Issues**: [danaszova/avax-router/issues](https://github.com/danaszova/avax-router/issues)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

## Next Steps After Deployment
1. Set up custom domain
2. Configure analytics
3. Set up CI/CD pipeline
4. Monitor performance
