import { resolve } from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Existing aliases if any
      '$stores': resolve('./src/state'),
      '$routes': resolve('./src/routes'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
