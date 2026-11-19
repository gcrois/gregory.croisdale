// Drafting histories recorded by draftlog: `<post>.history.jsonl` beside `<post>.md`.
const logs = import.meta.glob<string>("/src/content/blog/**/*.history.jsonl", {
	query: "?raw",
	import: "default",
	eager: true,
});

/** The raw log for a blog entry id (e.g. "linux_on_osx.md"), if it has one. */
export function draftHistory(id: string): string | undefined {
	return logs[`/src/content/blog/${id.replace(/\.mdx?$/, "")}.history.jsonl`];
}
