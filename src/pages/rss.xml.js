import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
	const blog = (await getCollection("blog")).filter(
		(post) => !post.data.unlisted
	);
	const research = (await getCollection("research")).filter(
		(post) => !post.data.unlisted
	);

	const allPosts = [...blog, ...research].sort(
		(a, b) =>
			new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
	);

	return rss({
		title: "Gregory Croisdale",
		description: "Gregory's Thoughts, Apps, and Research",
		site: context.site,
		items: allPosts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.description,
			link: `/${post.collection}/${post.slug}/`,
			categories: post.data.tags || [],
			customData: `<language>en-us</language>`,
		})),
	});
}
