// @ts-ignore
import { z, defineCollection } from 'astro:content';

interface Cardable {
    title: string;
    description: string;
    date: string;
    tags: string[];
    image?: string;
}

const schema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()),

    image: z.string().default("/images/me.jpg"),
});

const blogCollection = defineCollection({
    schema: schema,
});

const researchCollection = defineCollection({
    schema: schema,
});

export const collections = {
    'blog': blogCollection,
    'research': researchCollection,
};