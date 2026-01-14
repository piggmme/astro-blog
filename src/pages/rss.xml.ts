import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ id }) => id.startsWith('ko/'))

  return rss({
    title: 'Developer Hee | Blog',
    description: 'Logging my journey as a developer',
    site: context.site ?? 'https://blog.dev-hee.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/ko/posts/${post.id.split('/').slice(1).join('/').replace(/\.md$/, '')}`,
    })),
    customData: `<language>ko-kr</language>`,
  })
}
