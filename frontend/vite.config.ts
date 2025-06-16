import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseado no modo (development/production)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Em desenvolvimento, usa localhost, em produção usa a URL do Netlify
  const apiUrl = mode === 'production' 
    ? 'https://peppy-narwhal-64ff9e.netlify.app/.netlify/functions'
    : 'http://localhost:8999/.netlify/functions';
  
  console.log('Mode:', mode);
  console.log('API URL:', apiUrl);
  
  return {
    plugins: [react()],
    root: '.',
    base: '/',
    envDir: '.',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/.netlify/functions': {
          target: 'http://localhost:8999',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          }
        }
      },
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:8888'],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true
      }
    },
    build: {
      outDir: 'build',
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'axios'],
          },
        },
      },
    },
    define: {
      'process.env': {
        ...env,
        VITE_API_URL: JSON.stringify(apiUrl),
        VITE_APP_URL: JSON.stringify(mode === 'production' 
          ? 'https://peppy-narwhal-64ff9e.netlify.app'
          : 'http://localhost:3000')
      },
    },
  };
}); 