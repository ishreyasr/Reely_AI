# Vercel Deployment Guide

## Overview

This project consists of two parts that need to be deployed separately on Vercel:
1. Frontend (Next.js application)
2. Backend (FastAPI Python application)

## Deployment Steps

### Frontend Deployment

1. Push your code to a GitHub repository
2. Log in to Vercel and create a new project
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `Frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables if needed
6. Deploy

### Backend Deployment

1. Create a new project in Vercel
2. Import the same GitHub repository
3. Configure the project:
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Output Directory: (leave empty)
4. Add environment variables:
   - `GEMINI_API_KEY`: Your Gemini API key
5. Deploy

### Connecting Frontend to Backend

After both deployments are complete:

1. Get the URL of your backend deployment (e.g., `https://your-backend-name.vercel.app`)
2. Update the root `vercel.json` file in your repository:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-backend-name.vercel.app/api/:path*"
       }
     ]
   }
   ```
3. Commit and push these changes
4. Redeploy your frontend

## Troubleshooting

- If you encounter CORS issues, make sure your backend CORS configuration allows requests from your frontend domain
- For serverless function timeouts, optimize your API calls to complete within the Vercel time limit (10-60 seconds depending on your plan)
- Check Vercel logs for detailed error information