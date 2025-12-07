#!/bin/bash

# Vercel deployment helper script

echo "=== Smart Content Studio Vercel Deployment Helper ==="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy backend
echo "Deploying backend..."
cd backend
vercel --prod
BACKEND_URL=$(vercel --prod --no-clipboard)
cd ..

# Update the root vercel.json with the backend URL
echo "Updating vercel.json with backend URL: $BACKEND_URL"
sed -i "s|https://<your-backend-url>.vercel.app|$BACKEND_URL|g" vercel.json

# Deploy frontend
echo "Deploying frontend..."
cd Frontend
vercel --prod
cd ..

echo ""
echo "=== Deployment Complete ==="
echo "Remember to set your environment variables in the Vercel dashboard."