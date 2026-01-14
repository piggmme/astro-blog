import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(),
        description: z.string().optional(),
        author: z.string().optional(),
        image: z.object({
            url: z.string(),
            alt: z.string().optional(),
        }).optional(),
        tags: z.array(z.string()),
        bgcolor: z.string().optional(),
        color: z.string().optional(),
    }),
});

const meCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string().optional(),
    }),
});

export const collections = {
    'posts': postsCollection,
    'me': meCollection,
};
