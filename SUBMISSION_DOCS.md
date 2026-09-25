# README
# LLD Practice Platform

An MVP tool for practicing Low-Level Design problems (Parking Lot, Elevator System) and getting AI-generated, rubric-grounded feedback on your solution.

## What it does

1. Pick a problem from the list (Parking Lot System, Elevator System)
2. Read the problem statement and the rubric of what a strong solution covers
3. Write your design (classes, relationships, key decisions) as free text
4. Submit it and get structured feedback: each rubric criterion marked `covered` / `partial` / `missing`, with a reason grounded in what you actually wrote — not generic advice

## Tech stack

- **Next.js** (App Router) — single monolith app, frontend + API routes together
- **SQLite** (`better-sqlite3`) — stores problems, rubrics, submissions, feedback
- **Gemini API** (`@google/genai`, model `gemini-2.5-flash`) — generates the rubric-grounded feedback

## Architecture

app/
├── page.js # Home — list of problems
├── problem/[slug]/
│ ├── page.js # Problem detail + rubric + submission form
│ └── SubmissionForm.js # Client component: textarea, submit, feedback display
└── api/
├── problems/route.js # GET all problems
├── problems/[slug]/route.js # GET one problem + its rubric
└── submit/route.js # POST solution → Gemini → saves + returns feedback

lib/
├── db.js # SQLite connection + schema
└── gemini.js # Gemini client + evaluation prompt


This is a monolith by design (per the assignment brief) — no separate backend service, no microservices. SQLite keeps setup to zero external dependencies.

## Running locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your Gemini API key

Create a `.env.local` file in the project root:

GEMINI_API_KEY=your_key_here

Get a key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 3. Seed the database

```bash
node scripts/seed.js
```

This creates `lld.db` with the Parking Lot and Elevator System problems and their rubrics.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key design decisions

- **Rubric-grounded feedback, not open-ended grading.** Each problem has a fixed rubric (5 criteria). The Gemini prompt requires evaluating *only* against these criteria and grounding each verdict in a specific part of the learner's submission — this is what makes the feedback "explainable" rather than a vague score.
- **Monolith over microservices.** A single Next.js app with API routes avoids running multiple services for a 2-day MVP scope, per the assignment brief.
- **SQLite over a hosted DB.** Zero setup, file-based, sufficient for an MVP with two problems and a small number of submissions.

## Limitations

- Only 2 problems seeded (Parking Lot, Elevator System) — adding more just means extending `scripts/seed.js`.
- No user accounts/auth — submissions aren't tied to a learner identity.
- No diagram/UML input — solutions are submitted as text/pseudocode only, not visual class diagrams.
- Feedback quality depends on Gemini's output; the prompt enforces JSON structure and grounding, but occasional malformed responses are possible (handled with a try/catch that surfaces a clear error rather than crashing).
- Retries transient Gemini failures (503/429) up to twice with exponential backoff before returning a 502; other errors (e.g. malformed JSON response) fail immediately without retrying.

## AI usage

See [AI_USAGE.md](./AI_USAGE.md) for details on how AI tools were used in building this project.


---

# AI Usage Report
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
