import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/remotive': {
        target: 'https://remotive.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/remotive/, ''),
      },
      '/api/arbeitnow': {
        target: 'https://www.arbeitnow.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/arbeitnow/, ''),
      },
      '/api/remoteok': {
        target: 'https://remoteok.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/remoteok/, ''),
      },
      '/api/greenhouse': {
        target: 'https://boards-api.greenhouse.io',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/greenhouse/, ''),
      },
      '/api/lever': {
        target: 'https://api.lever.co',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/lever/, ''),
      },
      '/api/hn': {
        target: 'https://hn.algolia.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/hn/, ''),
      },
      '/api/adzuna': {
        target: 'https://api.adzuna.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/adzuna/, ''),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
