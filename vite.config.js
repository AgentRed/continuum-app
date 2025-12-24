import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Get API base URL from environment, default to localhost:8080
  const apiBase = env.VITE_API_BASE || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Proxy API requests to backend during development
        // This allows using relative URLs like /api/* instead of full URLs
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
        // Proxy media file requests
        '/media': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '4173', 10),
      allowedHosts: ['continuum-app-production.up.railway.app'],
    },
  }
})
