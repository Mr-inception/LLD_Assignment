# AI Usage Report

This project was built with heavy use of an AI assistant (Claude) for scaffolding, debugging, and code generation, and uses Google's Gemini API as a core product feature (not just a dev tool). Below are the key AI-assisted decisions and where AI usage mattered most.

## 1. Gemini as the feedback engine (product decision)

The core hard problem in this assignment is "useful, explainable feedback" — not just accepting a submission. I used Gemini (`gemini-2.5-flash`) as the evaluation engine, but designed the prompt myself to avoid generic LLM grading:

- The prompt strictly scopes evaluation to a fixed, pre-written rubric per problem — Gemini isn't free to invent its own criteria.
- It's required to return `covered` / `partial` / `missing` per criterion with a reason **grounded in the actual submission text**, not generic advice. This was a deliberate constraint to make feedback explainable and non-hallucinated.
- Output is enforced as strict JSON (with a fallback strip of markdown fences) so it can be reliably parsed and rendered — I explicitly told the model not to add preamble or code fences.

## 2. Scaffolding with AI assistance

Used Claude to scaffold the Next.js project structure, SQLite schema, and API routes incrementally — building and testing one piece at a time (DB → Gemini integration → API routes → frontend) rather than generating the whole app at once, so each layer could be verified before building on it.

## 3. Debugging real issues (not just "asked AI for code")

A significant part of the AI-assisted work was diagnosing real environment/API issues that came up during the build:

- **Gemini API key migration**: Google is currently migrating API keys from the legacy `AIzaSy...` format to a new `AQ....` (Authentication Key) format. The older `@google/generative-ai` SDK doesn't handle the new key format correctly, which caused persistent `API key not valid` errors. Diagnosed by testing the key directly against the REST API (`models.list` succeeded, `generateContent` failed — isolating the SDK, not the key, as the problem), then confirmed via Google's own developer forums that this is a known, active rollout issue. Fixed by migrating to the newer `@google/genai` SDK.
- **ES module import ordering bug**: After switching SDKs, hit a Google Cloud "Application Default Credentials" error — caused by `import` statements in ES modules being hoisted above `dotenv.config()`, so the Gemini client was constructed before the API key was loaded into `process.env`. Fixed by lazily constructing the client inside the function instead of at module load time.
- **Windows PowerShell wildcard bug**: `Remove-Item "app\problem\[slug]\route.js"` silently did nothing because PowerShell interprets `[slug]` as a character-class wildcard, not a literal folder name. Diagnosed by checking `git status`/`Get-ChildItem` output showing the file still present after a "successful" delete, then fixed using `-LiteralPath`.
- **Next.js route/page conflict**: A stray `route.js` file inside `app/problem/[slug]/` (alongside `page.js`) caused a Next.js build error, since a folder can't be both a page and an API route. Diagnosed by listing the full `app/` tree and spotting the duplicate file.

## 4. What I wrote/decided myself

- Rubric content (the 5 evaluation criteria per problem) — written manually to reflect real LLD concerns (entity modeling, extensibility, concurrency, etc.), not AI-generated.
- Overall architecture decision (Next.js monolith, SQLite, no microservices) — made upfront based on the assignment brief's "keep it simple" guidance.
- Final review and manual testing of every API route and the full user flow (submit → feedback) before considering each step complete.

## Tools used

- **Claude** (Anthropic) — code scaffolding, debugging, architecture discussion
- **Gemini API** (`gemini-2.5-flash`, via `@google/genai`) — the product's core feedback-generation feature