
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Safely stringify the API key, defaulting to empty string if not found
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});
