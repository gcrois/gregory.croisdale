// @ts-ignore
import { z, defineCollection } from 'astro:content';

const schema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()),

    image: z.string().optional(),
});

const blogCollection = defineCollection({
    schema: schema,
});

export const collections = {
    'blog': blogCollection,
};