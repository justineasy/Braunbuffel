import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'preloader-critical-css',
      transformIndexHtml: async (html) => {
        const pkgRoot = process.env.VITE_CWD || process.cwd()
        const cssPath = path.resolve(pkgRoot, 'src/components/Preloader.css')
        let css = ''
        try {
          css = await fs.readFile(cssPath, 'utf8')
        } catch {
          // Leave the HTML unchanged if the stylesheet can't be read.
        }
        if (!css) return html

        const injection = `<style id="preloader-critical">${css.replace(/\s+/g, ' ').trim()}</style>`
        return html.replace('</head>', `${injection}</head>`)
      },
    },
  ],
  build: {
    chunkSizeWarningLimit: 600,
  },
})
