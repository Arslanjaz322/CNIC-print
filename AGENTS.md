<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- The print tool is a vanilla-JS app: markup in `src/components/print-tool/markup.ts`, logic in `public/print-tool/tool.js` (loaded once by `src/routes/index.tsx`), styles in `src/components/print-tool/print-tool.css`. Why: it is the user's existing tool; porting 36 KB of canvas logic to React would risk regressions. Keep every id/data-*/class the script queries.
- AI scan enhance runs server-side (`src/lib/enhance.functions.ts` → `enhance.server.ts`); the script calls it through `window.cnicAiEnhance`. Why: the AI key must stay on the server.
- AI scan uses a latency-first image model at medium quality, ~1024 px, on a pre-cropped JPEG card, then the browser upscales to 4K. Why: the user needs ~5–10 s per photo; high quality was slower and invented details.
- The AI scan prompt in `enhance.server.ts` is user-chosen text; keep it verbatim. Output size rules live in `src/lib/scan-size.ts` with tests.
- Print CSS hides everything except `#pv` inside `#app`; keep `#app` a direct child of `<body>`. Why: printing relies on it.
