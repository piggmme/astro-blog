import rss, { pagesGlobToRssItems } from '@astrojs/rss'
import type { APIContext } from 'astro'

export async function GET (context: APIContext) {
  return rss({
    title: 'Developer Hee | Blog',
    description: 'Logging my journey as a developer',
    site: context.site ?? 'https://blog.dev-hee.com',
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    customData: `<language>en-us</language>`,
  })
}
