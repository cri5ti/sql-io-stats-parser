import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/sql-io-stats-parser/',
  plugins: [react()],
});
