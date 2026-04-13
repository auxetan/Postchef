import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // State
          'vendor-zustand': ['zustand'],
        },
      },
    },
    // Remonter le seuil d'avertissement (le splitting le réduit naturellement)
    chunkSizeWarningLimit: 400,
  },
})
