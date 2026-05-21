import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this site at /CPG-SupplyChain-ODI-Demo/.
// Override with VITE_BASE=/ for local root previews.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/CPG-SupplyChain-ODI-Demo/',
})
