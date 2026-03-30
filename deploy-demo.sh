#!/bin/bash
# Deploy Avalanche DEX Router Demo App to Vercel
# This script deploys the demo app using Vercel CLI

echo "🚀 Deploying Avalanche DEX Router Demo App to Vercel"
echo "======================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Navigate to demo app directory
cd packages/demo-app

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel"
    echo "Please log in with: vercel login"
    echo "Follow the browser prompt to authenticate"
    exit 1
fi

# Display current configuration
echo "📋 Current Vercel Configuration:"
echo "---------------------------------"
echo "Build Command: $(grep -A2 "buildCommand" vercel.json | tail -1 | tr -d \",)"
echo "Output Directory: $(grep -A2 "outputDirectory" vercel.json | tail -1 | tr -d \",)"
echo "Framework: $(grep -A2 "framework" vercel.json | tail -1 | tr -d \",)"
echo "API URL: $(grep -A2 "VITE_API_URL" vercel.json | tail -3 | grep -v "env" | tr -d \" :,)"
echo

echo "🔨 Building demo app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo

echo "🌍 Deploying to Vercel..."
echo "Options:"
echo "  1. Deploy to preview (test)"
echo "  2. Deploy to production"
echo "  3. Cancel"
echo
read -p "Enter choice (1-3): " choice

echo

case $choice in
    1)
        echo "Deploying to preview environment..."
        vercel
        echo "✅ Preview deployment complete!"
        ;;
    2)
        echo "Deploying to production..."
        vercel --prod
        echo "✅ Production deployment complete!"
        ;;
    3)
        echo "Deployment cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo
echo "🎉 Deployment successful!"
echo "Check your Vercel dashboard for the deployed URL."
echo "Test the deployment by visiting the URL and verifying:"
echo "  1. Landing page loads"
    echo "  2. Widget renders"
    echo "  3. API connection works (quotes load)"
    echo "  4. Wallet connection works"

