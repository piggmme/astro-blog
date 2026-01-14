import { defineConfig } from 'astro/config'

import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.dev-hee.com',
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
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
