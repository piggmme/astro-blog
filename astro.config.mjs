import { defineConfig } from 'astro/config'

import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.dev-hee.com',
  integrations: [react({
    experimentalReactChildren: true,
  })],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./global.scss";`,
        },
      },
    },
  },
})
