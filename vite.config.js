import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [
    react(),
    // Compresse et redimensionne au build toutes les images importées
    // (y compris celles uploadées par Eva dans le CMS, cf. src/lib/images.js).
    imagetools({ cache: { enabled: true, dir: './node_modules/.cache/imagetools' } }),
  ],
  server: { port: 5173 },
  build: {
    // Le build serveur (pré-rendu) génère les images Open Graph (src/lib/og.js) :
    // il doit les écrire pour que scripts/prerender.mjs les copie dans dist/assets.
    ssrEmitAssets: true,
  },
})
