# Refactor AI Endpoint Plan

This document tracks the progress of refactoring the AI endpoint to use a unified, reliable Supabase function.

---

### Phase 0: Prep

- [x] Verify that the Supabase function `generate` works from the browser.
- [ ] Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in all environments.

---

### Phase 1: Extract Shared Fetch Logic

- [x] Create `src/utils/aiClient.ts`.
- [x] Move logic from `aiApi.ts` (`getApiUrl`, `getHeaders`, `streamCompletion`) into `aiClient.ts`.
- [x] Export a single high-level helper: `export async function callAiFunction(body: object): Promise<Response> { ... }`.
- [x] Update `testAiFunction.ts` to use the new `aiClient.ts` utility.

---

### Phase 2: Replace Broken Edge Route

- [ ] Delete or backup the contents of `src/api/generate.ts`.
- [ ] Re-implement `POST` in `src/api/generate.ts` as a thin proxy to the Supabase function.

---

### Phase 3: Point Frontend to New Endpoint

- [ ] In `src/utils/aiConfig.ts`, update `getAiEndpoint` to always return the Supabase function URL.
- [ ] Remove the conditional logic that returned `/api/generate`.

---

### Phase 4: Clean-up & Test

- [ ] Run the app locally (`npm run dev`) and test the AI features in the Novel editor.
- [ ] Verify all five AI commands ("Improve writing", "Fix grammar", etc.) work correctly.
- [ ] Remove unused dependencies: `@ai-sdk/openai`, `@upstash/ratelimit`, `@vercel/kv`.
- [ ] Commit the changes with a descriptive message: `refactor: proxy /api/generate to Supabase function; unify AI client`.

---

### Optional Hardening

- [ ] Add retry/timeout logic to `callAiFunction`.
- [ ] Implement server-side logging for Supabase errors. 