/*
 * Reader for draftlog's `.history.jsonl` (github: gcrois/draftlog, src/history.ts is the
 * writer). Header `{"draftlog":2,"t0":ms}`, then one row per edit:
 * `[ms since previous, from, deleted, insert, origin?]`, origin only when it changes.
 * Folding the rows over "" yields the post's Markdown byte for byte. Object rows
 * `{"milestone":{…}}` are session notes; a later row with the same id replaces (or, with
 * `deleted`, removes) an earlier one.
 */
export interface DraftEdit {
	t: number;
	o: string;
	from: number;
	to: number;
	insert: string;
}

export interface Milestone {
	id: string;
	/** Applies from the text after this many edits. */
	at: number;
	t: number;
	goal: string;
	sources: { url: string; title?: string }[];
	/** An agent's pass: who, what it was asked, and the edit count its changes end at. */
	by?: string;
	prompt?: string;
	end?: number;
}

/**
 * The sessions to show: the milestones, plus an untitled one from the first edit when the
 * log starts before any milestone, so every point in the history belongs to a session.
 */
export function sessions(edits: readonly DraftEdit[], milestones: readonly Milestone[]): Milestone[] {
	if (edits.length === 0 || milestones.some((m) => m.at === 0 && !m.by)) return [...milestones];
	return [{ id: "start", at: 0, t: edits[0]!.t, goal: "", sources: [] }, ...milestones];
}

/** The session the text after `n` edits belongs to: an agent pass while its edits play, else the writer's. */
export function sessionAt(list: readonly Milestone[], n: number): Milestone | null {
	return (
		list.find((m) => m.by && m.end !== undefined && n > m.at && n <= m.end) ??
		list.findLast((m) => !m.by && m.at <= n) ??
		null
	);
}

type Row = [number, number, number, string, string?] | { milestone: Milestone | { id: string; deleted: true } };

export function parseDraftLog(text: string): { edits: DraftEdit[]; milestones: Milestone[] } {
	const lines = text.split("\n").filter((l) => l.trim() !== "");
	if (lines.length === 0) return { edits: [], milestones: [] };
	const head = JSON.parse(lines[0]!) as { draftlog?: number; t0?: number } & Partial<DraftEdit>;
	// Version 1: one object per line.
	if (head.draftlog === undefined) return { edits: lines.map((l) => JSON.parse(l) as DraftEdit), milestones: [] };
	let t = head.t0 ?? 0;
	let o = "";
	const edits: DraftEdit[] = [];
	const milestones = new Map<string, Milestone>();
	for (const line of lines.slice(1)) {
		const row = JSON.parse(line) as Row;
		if (!Array.isArray(row)) {
			if ("deleted" in row.milestone) milestones.delete(row.milestone.id);
			else milestones.set(row.milestone.id, row.milestone);
			continue;
		}
		const [dt, from, deleted, insert, origin] = row;
		t += dt;
		o = origin ?? o;
		edits.push({ t, o, from, to: from + deleted, insert });
	}
	return { edits, milestones: [...milestones.values()].sort((a, b) => a.at - b.at || a.t - b.t) };
}

export const applyEdit = (doc: string, e: DraftEdit): string => doc.slice(0, e.from) + e.insert + doc.slice(e.to);

const CHECKPOINT = 256;

/**
 * Random access to the draft after any number of edits: snapshots every 256 edits, so a
 * scrub costs at most 255 applications, and stepping forward one edit costs one.
 */
export class Draft {
	private readonly snaps: string[] = [""];
	private cursor = { n: 0, text: "" };

	constructor(readonly edits: readonly DraftEdit[]) {
		let text = "";
		edits.forEach((e, i) => {
			text = applyEdit(text, e);
			if ((i + 1) % CHECKPOINT === 0) this.snaps.push(text);
		});
	}

	/** The Markdown after the first `n` edits. */
	at(n: number): string {
		let { n: i, text } = this.cursor;
		if (n < i || n - i >= CHECKPOINT) {
			i = Math.floor(n / CHECKPOINT) * CHECKPOINT;
			text = this.snaps[i / CHECKPOINT]!;
		}
		for (; i < n; i++) text = applyEdit(text, this.edits[i]!);
		this.cursor = { n, text };
		return text;
	}
}
