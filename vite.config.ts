import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('components/background/HexCrackCanvas') || id.includes('components/background/hexGrid')) {
            return 'hex-background';
          }
          if (id.includes('node_modules/motion')) return 'motion';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/@sanity')) return 'sanity';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react-vendor';
        },
      },
    },
  },
});
