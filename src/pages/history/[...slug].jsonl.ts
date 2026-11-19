import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { draftHistory } from "../../utils/draft-history";

export async function getStaticPaths() {
	const entries = await getCollection("blog");
	return entries.flatMap((entry) => {
		const log = draftHistory(entry.id);
		return log ? [{ params: { slug: entry.slug }, props: { log } }] : [];
	});
}

export const GET: APIRoute = ({ props }) =>
	new Response(props.log as string, { headers: { "content-type": "application/x-ndjson; charset=utf-8" } });
