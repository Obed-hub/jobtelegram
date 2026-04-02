// vite.config.ts
import { defineConfig } from "file:///C:/all%20my%20startup/kloveablejob/ai-job-spark-27/node_modules/vite/dist/node/index.js";
import react from "file:///C:/all%20my%20startup/kloveablejob/ai-job-spark-27/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/all%20my%20startup/kloveablejob/ai-job-spark-27/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\all my startup\\kloveablejob\\ai-job-spark-27";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    },
    proxy: {
      "/api/remotive": {
        target: "https://remotive.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/remotive/, "")
      },
      "/api/arbeitnow": {
        target: "https://www.arbeitnow.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/arbeitnow/, "")
      },
      "/api/remoteok": {
        target: "https://remoteok.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/remoteok/, "")
      },
      "/api/greenhouse": {
        target: "https://boards-api.greenhouse.io",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/greenhouse/, "")
      },
      "/api/lever": {
        target: "https://api.lever.co",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/lever/, "")
      },
      "/api/hn": {
        target: "https://hn.algolia.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/hn/, "")
      },
      "/api/adzuna": {
        target: "https://api.adzuna.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/adzuna/, "")
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxhbGwgbXkgc3RhcnR1cFxcXFxrbG92ZWFibGVqb2JcXFxcYWktam9iLXNwYXJrLTI3XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxhbGwgbXkgc3RhcnR1cFxcXFxrbG92ZWFibGVqb2JcXFxcYWktam9iLXNwYXJrLTI3XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9hbGwlMjBteSUyMHN0YXJ0dXAva2xvdmVhYmxlam9iL2FpLWpvYi1zcGFyay0yNy92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBobXI6IHtcclxuICAgICAgb3ZlcmxheTogZmFsc2UsXHJcbiAgICB9LFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGkvcmVtb3RpdmUnOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9yZW1vdGl2ZS5jb20nLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9yZW1vdGl2ZS8sICcnKSxcclxuICAgICAgfSxcclxuICAgICAgJy9hcGkvYXJiZWl0bm93Jzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vd3d3LmFyYmVpdG5vdy5jb20nLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9hcmJlaXRub3cvLCAnJyksXHJcbiAgICAgIH0sXHJcbiAgICAgICcvYXBpL3JlbW90ZW9rJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vcmVtb3Rlb2suY29tJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvcmVtb3Rlb2svLCAnJyksXHJcbiAgICAgIH0sXHJcbiAgICAgICcvYXBpL2dyZWVuaG91c2UnOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9ib2FyZHMtYXBpLmdyZWVuaG91c2UuaW8nLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9ncmVlbmhvdXNlLywgJycpLFxyXG4gICAgICB9LFxyXG4gICAgICAnL2FwaS9sZXZlcic6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2FwaS5sZXZlci5jbycsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2xldmVyLywgJycpLFxyXG4gICAgICB9LFxyXG4gICAgICAnL2FwaS9obic6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2huLmFsZ29saWEuY29tJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvaG4vLCAnJyksXHJcbiAgICAgIH0sXHJcbiAgICAgICcvYXBpL2FkenVuYSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2FwaS5hZHp1bmEuY29tJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvYWR6dW5hLywgJycpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgICBkZWR1cGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3QvanN4LXJ1bnRpbWVcIiwgXCJyZWFjdC9qc3gtZGV2LXJ1bnRpbWVcIl0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdVLFNBQVMsb0JBQW9CO0FBQ3JXLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsSUFDWDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsaUJBQWlCO0FBQUEsUUFDZixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUNBLFVBQWlCQSxNQUFLLFFBQVEsb0JBQW9CLEVBQUU7QUFBQSxNQUNoRTtBQUFBLE1BQ0Esa0JBQWtCO0FBQUEsUUFDaEIsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDQSxVQUFpQkEsTUFBSyxRQUFRLHFCQUFxQixFQUFFO0FBQUEsTUFDakU7QUFBQSxNQUNBLGlCQUFpQjtBQUFBLFFBQ2YsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDQSxVQUFpQkEsTUFBSyxRQUFRLG9CQUFvQixFQUFFO0FBQUEsTUFDaEU7QUFBQSxNQUNBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQ0EsVUFBaUJBLE1BQUssUUFBUSxzQkFBc0IsRUFBRTtBQUFBLE1BQ2xFO0FBQUEsTUFDQSxjQUFjO0FBQUEsUUFDWixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUNBLFVBQWlCQSxNQUFLLFFBQVEsaUJBQWlCLEVBQUU7QUFBQSxNQUM3RDtBQUFBLE1BQ0EsV0FBVztBQUFBLFFBQ1QsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDQSxVQUFpQkEsTUFBSyxRQUFRLGNBQWMsRUFBRTtBQUFBLE1BQzFEO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUNBLFVBQWlCQSxNQUFLLFFBQVEsa0JBQWtCLEVBQUU7QUFBQSxNQUM5RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDOUUsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsSUFDQSxRQUFRLENBQUMsU0FBUyxhQUFhLHFCQUFxQix1QkFBdUI7QUFBQSxFQUM3RTtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
