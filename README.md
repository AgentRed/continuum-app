# Continuum App

A React + Vite frontend application for the Continuum system.

## Prerequisites

- Node.js 18+ and npm
- Backend API running (either locally or on Railway)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:

```env
# For local backend
VITE_API_BASE=http://localhost:8080

# OR for Railway backend
VITE_API_BASE=https://your-app.railway.app
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Backend Configuration

#### Local Backend

If running the backend locally, ensure:
- Backend is running on port 8080 (or update `VITE_API_BASE` in `.env`)
- CORS is configured to allow requests from `http://localhost:5173`

#### Railway Backend

If using a Railway backend:
1. Get your Railway app URL (e.g., `https://your-app.railway.app`)
2. Set `VITE_API_BASE` in `.env` to your Railway URL
3. Ensure CORS is configured on the backend to allow your frontend origin

### Proxy Configuration

The Vite dev server includes a proxy configuration that forwards `/api/*` and `/media/*` requests to your backend. This means:

- **With proxy (default)**: You can use relative URLs, and Vite will proxy them to `VITE_API_BASE`
- **Without proxy**: The app uses full URLs from `VITE_API_BASE` environment variable

The proxy is configured in `vite.config.js` and uses the `VITE_API_BASE` environment variable as the target.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
  ├── components/     # React components
  ├── pages/         # Page components
  ├── lib/           # API helpers and utilities
  ├── context/       # React context providers
  ├── config.ts      # Configuration (API_BASE)
  └── main.jsx       # Entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API base URL | `http://localhost:8080` |

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. **Local backend**: Ensure your backend allows requests from `http://localhost:5173`
2. **Railway backend**: Ensure CORS is configured to allow your frontend domain

### API Connection Issues

1. Verify `VITE_API_BASE` is set correctly in `.env`
2. Check that the backend is running and accessible
3. Check browser console for network errors
4. Verify the backend URL is correct (no trailing slash)

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual port number.

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory. The build uses the `VITE_API_BASE` environment variable at build time, so ensure it's set correctly for your production environment.
