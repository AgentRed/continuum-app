# Railway Deployment Guide

This guide covers deploying the Continuum App frontend to Railway.

## Prerequisites

- Railway account
- Backend API URL (e.g., `https://continuum-core2-production.up.railway.app`)

## Deployment Steps

### 1. Create Railway Service

1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or "Empty Project" if deploying manually)
4. Connect your repository or select the `continuum-app` repository

### 2. Configure Environment Variables

In Railway, go to your service → Variables tab and add:

```
VITE_API_BASE=https://continuum-core2-production.up.railway.app
```

**Important**: 
- Replace the URL with your actual backend API URL
- Do NOT include a trailing slash
- The `VITE_` prefix is required for Vite to expose the variable to the frontend

### 3. Configure Build and Start Commands

In Railway service settings:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`

Railway will automatically:
- Run `npm install` to install dependencies
- Run the build command to create the production bundle
- Run the start command to serve the app

### 4. Generate Domain

1. Go to your service → Settings
2. Click "Generate Domain" under "Networking"
3. Railway will provide a public URL (e.g., `continuum-app-production.up.railway.app`)

### 5. Verify Deployment

1. Visit your Railway-generated domain
2. Open browser DevTools → Console
3. Verify no CORS errors
4. Check that API calls are going to the correct backend URL

## Configuration Summary

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Port | Automatically set by Railway via `$PORT` |
| Environment Variable | `VITE_API_BASE` (set to backend URL) |

## Troubleshooting

### Build Fails

- Check Railway build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Railway auto-detects)

### App Loads but API Calls Fail

- Verify `VITE_API_BASE` is set correctly in Railway variables
- Check backend CORS configuration allows your Railway frontend domain
- Check browser console for CORS or network errors

### Port Issues

- Railway automatically sets `$PORT` environment variable
- The start script uses `${PORT:-4173}` as fallback
- Vite preview binds to `0.0.0.0` to accept external connections

### Environment Variables Not Working

- Ensure variable name starts with `VITE_` prefix
- Rebuild after adding/changing environment variables
- Variables are baked into the build at build time, not runtime

## Local Testing

To test the production build locally:

```bash
# Build
npm run build

# Preview (simulates Railway)
PORT=4173 npm start
```

Visit `http://localhost:4173` to verify the build works.

