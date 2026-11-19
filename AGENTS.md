# gregory.croisdale

Personal site and blog: Astro, deployed to Cloudflare Pages from `main` (`pnpm build`).
Posts live in `src/content/blog/*.md`, with frontmatter checked against `src/content/config.ts`.

## Posts with a drafting history

A post can have a `<post>.history.jsonl` next to it. That file is a record of every edit to
the post, and the post page plays it back (`src/components/DraftHistory.astro`). The file
only stays truthful if every change to the post is logged, so:

- **Never edit such a post directly, and never edit its `.history.jsonl` by hand.** Write
  your revision to a separate file and record it as an attributed pass instead:

  ```sh
  ~/Projects/draftlog/bin/draftlog apply src/content/blog/<post>.md /tmp/<post>.revised.md \
    --by "<your model name>" --prompt-file /tmp/<post>.prompt.txt
  ```

  The prompt file holds what you were asked to do, in the writer's words. It's published
  with the post, so leave out anything private. `--goal "…"` sets a one-line summary
  (it defaults to the prompt's first line).
- `apply` works while the writer has the post open in the editor; the editor reloads.
- Fixing frontmatter or anything else in the post counts too: go through `apply`.
- Commit a post and its `.history.jsonl` together.

Posts without a history can be edited normally. To give an older post one, use
`draftlog import <post.md>`, which rebuilds it from the git log. Ask first, because it
publishes the post's commit messages.

## Writing in the editor

`draftlog write <post.md>` opens the editor and prints its URL. `draftlog list` shows the
open posts, and `draftlog close [post]` stops one. Run `draftlog` with no arguments for help.
Don't start or kill the editor's tmux sessions or ports by hand.
