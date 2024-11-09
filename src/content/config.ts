// @ts-ignore
import { z, defineCollection } from "astro:content";

interface Cardable {
	title: string;
	description: string;
	date: string;
	tags: string[];

	image?: string;
	link?: string;
	newTab?: boolean;
}

const blogSchema = {
	title: z.string(),
	description: z.string(),
	date: z.string(),
	tags: z.array(z.string()),
	image: z.string().default("/images/me.jpg"),
	link: z.string().default(""),
	newTab: z.boolean().default(false),
	authors: z.array(z.string()).default([]),
	venue: z.string().default(""),
};

const blogCollection = defineCollection({
	schema: z.object(blogSchema),
});

export const collections = {
	blog: blogCollection,
};
