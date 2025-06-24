import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//import tailwindcss from dependencies as vite plugin
import tailwindcss from '@tailwindcss/vite';
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  base: process.env.VITE_BASE_PATH || "/"
})
