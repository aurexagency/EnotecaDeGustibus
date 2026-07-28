import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        vini: resolve(__dirname, 'vini.html'),
        chisiamo: resolve(__dirname, 'chi-siamo.html'),
        contatti: resolve(__dirname, 'contatti.html'),
        distillati: resolve(__dirname, 'distillati.html'),
        birraolio: resolve(__dirname, 'birra-olio.html'),
      }
    }
  }
});
