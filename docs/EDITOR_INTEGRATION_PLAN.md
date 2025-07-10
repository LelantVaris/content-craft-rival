# Shadcn Editor Integration Plan

> **Goal**  
> Replace the existing `NovelEditor` with the **Shadcn Editor** as the default rich-text editor across the application, while keeping the codebase type-safe, stylistically consistent, and easy to maintain.

---

## 1. Work Completed So Far ✅

| Area | Actions |
|------|---------|
| **Dependency Management** | • Compared `package.json` files and installed required Lexical & UI dependencies.<br/>• Resolved peer-dependency conflicts (`react-day-picker`, `date-fns`). |
| **TypeScript Config** | • Merged strict compiler options from *shadcn-editor*.<br/>• Fixed resulting TS errors (`strictNullChecks`, unknown `error`, etc.). |
| **Styling / Tailwind** | • Adopted color tokens & keyframes from `shadcn-editor/styles/globals.css`.<br/>• Confirmed `tailwindcss-animate` plugin already present.<br/>• Added VS Code/Tailwind IntelliSense settings to silence `@tailwind` / `@apply` linter warnings. |
| **Linting** | • Updated ESLint suppressions where third-party types were missing (`any` in Vite config, Supabase edge types). |
| **CRITICAL FILES (MUST KEEP)** | • THE FOLLOWING FILES **MUST NOT BE RENAMED OR DELETED** DURING MIGRATION:<br/>  • `SRC/COMPONENTS/NOVELEDITOR/GENERATIVE/AICOMPLETIONCOMMANDS.TSX`<br/>  • `SRC/COMPONENTS/NOVELEDITOR/GENERATIVE/AISELECTOR.TSX`<br/>  • `SRC/COMPONENTS/NOVELEDITOR/GENERATIVE/GENERATIVEMENUSWITCH.TSX`<br/>  • `SRC/COMPONENTS/NOVELEDITOR/GENERATIVE/AISELECTORCOMMANDS.TSX`<br/>  • `SRC/COMPONENTS/NOVELEDITOR/SLASHCOMMAND.TS`<br/>  • `SRC/COMPONENTS/NOVELEDITOR.TSX` |

---

## 2. Remaining Tasks 🗂️

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | **Copy editor source**: move `shadcn-editor/registry/new-york-v4/editor` (and supporting `ui`, `hooks`, `lib`, etc.) into the new structure under `src/components/editor`, `src/lib/editor`, etc. |  | ☐ |
| 2 | **Path aliases**: verify `tsconfig.paths`, Vite aliases, and Jest config (if any) resolve new import paths. |  | ☐ |
| 3 | **Update imports**: bulk-replace old `NovelEditor` imports with new editor wrapper component. |  | ☐ |
| 4 | **Create EditorWrapper**: thin wrapper that exposes Shadcn Editor with props compatible with existing usage. |  | ☐ |
| 5 | **Feature parity audit**: ensure all existing editor-related features (AI commands, image upload, etc.) work or have migration stories. |  | ☐ |
| 6 | **Remove duplicates**: delete old `NovelEditor` and redundant UI primitives after migration passes unit tests. |  | ☐ |
| 7 | **Docs & scripts**: update developer README with setup notes and add Storybook/Playground page for the new editor. |  | ☐ |
| 8 | **End-to-end test**: run `npx tsc --noEmit`, `npm run lint`, and full Vite build to ensure zero errors. |  | ☐ |
| 9 | **Critical files preservation**: verify files listed in CRITICAL FILES section remain unchanged and functional after integration. |  | ☐ |

> **Tip:** tackle tasks in order—copy code first, then fix aliases, then update imports, etc.

---

## 3. Next Immediate Step 🚀

1. **Copy editor source** (Task #1):
   ```bash
   # Example (paths may vary)
   SRC="shadcn-editor/registry/new-york-v4"
   DEST="content-craft-rival/src"

   cp -R "$SRC/editor"        "$DEST/components/editor"
   cp -R "$SRC/ui"            "$DEST/components/ui-shadcn"
   cp -R "$SRC/hooks"         "$DEST/hooks/editor"
   cp -R "$SRC/lib"           "$DEST/lib/editor"
   ```
2. Re-run **`npx tsc --noEmit`** and **`npm run dev`** to surface any missing imports.

---

## 3.1 Highlight & AI Bubble Specification 🫧

**Requirement:**  
When the user highlights text inside the new Shadcn Editor, an **AI ACTION BUBBLE** must appear exactly as it does today in `NovelEditor`, offering the same commands (*Rewrite*, *Summarize*, *Expand*, etc.).

**Success Criteria:**
- Bubble appears on any text selection.
- All current AI commands execute successfully.
- Keyboard shortcuts and slash-command triggers continue to work.

---

## 4. Acceptance Criteria 🎯

- Application builds without errors (`vite build`).
- Shadcn Editor renders and functions in **Article Editor**, **Article Studio**, and any other editor screens.
- No leftover references to `NovelEditor` in source.
- Docs updated and team onboarded.

---

_This file should be kept up-to-date as integration progresses._ 