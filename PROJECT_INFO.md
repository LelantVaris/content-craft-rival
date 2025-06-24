
# Metakit.ai – Developer Info

## 1. What We're Building

Metakit is an **AI‑powered content suite for SEO teams**. The first release focuses on a multi‑step blog‑article generator; stand‑alone helpers like an LLM‑generated `llm.txt`, automatic image alt‑text, and meta‑info generation will follow.

Repo: [https://github.com/LelantVaris/content-craft-rival](https://github.com/LelantVaris/content-craft-rival)

---

## 2. Core Feature – Multi‑Step Blog Writer

| Step                 | Purpose                           | Credits Used (Pro Plan) |
| -------------------- | --------------------------------- | ----------------------- |
| 1 — Keyword research | Pull SERP, cluster intents        | **0**                   |
| 2 — Outline          | H2/H3 structure, metadata         | **0**                   |
| 3 — Draft            | \~1 200 words, references         | **0**                   |
| 4 — SEO polish       | Entities, FAQ, internal links     | **0**                   |
| 5 — Meta info        | Title, description, schema markup | **0** (part of flow)    |
| 6 — Publish webhook  | Push to CMS                       | **0**                   |

> **Note:** Meta‑info can also be called as a stand‑alone tool (see §3) and then consumes credits.

### API Skeleton (tRPC excerpt)

```ts
// /trpc/blogWriter.ts
export const blogWriter = router({
  keyword: protectedProcedure
    .input(z.object({ topic: z.string() }))
    .mutation(async ({ ctx, input }) => runKeywordResearch(input.topic)),
  outline: protectedProcedure
    .input(z.object({ keywordData: z.any() }))
    .mutation(async ({ ctx, input }) => generateOutline(input.keywordData)),
  draft: /* … */,  // consumes no credits
  polish: /* … */, // consumes no credits
  metaInfo: /* … */, // part of flow, no credits
  publish: /* … */
});
```

---

## 3. Stand‑Alone Tools & Credit Costs

| Tool                | Endpoint       | Credit Cost   |
| ------------------- | -------------- | ------------- |
| `llm.txt` Generator | `/seo/llm-txt` | **1 / page**  |
| Alt‑Text Batch      | `/images/alt`  | **1 / image** |
| Meta‑Info Generator | `/seo/meta`    | **1 / page**  |

Each workspace receives **100 free credits every month** for these stand‑alone tools. Unused credits expire at the end of the billing cycle.

---

## 4. Pricing & Credits

### Plans

| Plan         | Price              | Intro Offer                      | Monthly Stand‑Alone Credits¹ | Notes                                                                     |
| ------------ | ------------------ | -------------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| **Pro**      | **\$99 / mo**      | 7‑day free ➜ first month **\$1** | **100**                      | Unlimited article generation; credits apply **only** to stand‑alone tools |
| **Lifetime** | **\$699 one‑time** | –                                | **100 / mo**                 | Same rules as Pro after purchase                                          |

¹Unused credits **do not** roll over.

### Credit Packs (add‑on)

| Pack     | Credits | Price |
| -------- ------- | ----- |
| 100‑Pack | 100     | \$10  |
| 250‑Pack | 250     | \$25  |
| 500‑Pack | 500     | \$50  |

---

## 5. Architecture Snapshot

* **Stack:** Next.js 14 (App Router) + tRPC + Prisma → Postgres. Queue: BullMQ (Redis). Workers: Node.js / Python. Dev workflow powered by **Lovable** + **Cursor**.
* **Services:** OpenAI GPT‑4o, DALL·E 3, SERP API.
* **Auth:** NextAuth (Email + OAuth).
* **Billing:** Stripe – subscriptions (`price_Pro`, `price_Lifetime`) + one‑off credit SKUs.
* **Edge Functions:** Vercel Edge middleware for credit checking.
* **CMS Push:** WordPress, Shopify, Framer **and** Webflow (direct integration; users can connect **multiple Webflow sites**). The app works fine without Webflow, but we keep this detail out of public marketing.

### Data Model (Prisma excerpt)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  credits       Int      @default(100)   // reset monthly
  lifetime      Boolean  @default(false)
  createdAt     DateTime @default(now())
  transactions  CreditTransaction[]
  webflowTokens WebflowToken[]
}
```

---

## 6. Dev Milestones

1. **Week 1** – Repo setup, auth, Stripe test mode, credit middleware.
2. **Week 2** – Implement blog‑writer flow (keyword ➜ meta info).
3. **Week 3** – CMS integrations + stand‑alone tools.
4. **Week 4** – Dashboard (credit usage), onboarding flow: 7‑day trial ➜ \$1 month, launch beta.

---

## 7. Deployment

* Vercel for web/API.
* Supabase for Postgres (daily backups).
* Upstash for Redis (queue).
* Workers: Vercel Cron → queue consumers on Fly.io.

---

## 8. Roadmap After GA

* Bulk topic import
* Brand‑voice fine‑tuning per workspace
* Team roles & permissions
* AI image styles library
* Analytics endpoints (impressions, CTR)
