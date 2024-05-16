// @ts-ignore
import { z, defineCollection } from 'astro:content';

interface Cardable {
    title: string;
    description: string;
    date: string;
    tags: string[];

    image?: string;
    link?: string;
    newTab?: boolean;
}

const schema = {
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()),

    image: z.string().default("/images/me.jpg"),
    link: z.string().default(""),
    newTab: z.boolean().default(false),
};

const blogSchema = {...schema};
const researchSchema = {
    ...schema,
    authors: z.array(z.string()),
    venue: z.string(),
};

const blogCollection = defineCollection({
    schema: z.object(blogSchema),
});

const researchCollection = defineCollection({
    schema: z.object(researchSchema),
});

export const collections = {
    'blog': blogCollection,
    'research': researchCollection,
};