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
- No retry/rate-limit handling for the Gemini API call — a transient API failure returns a 502 to the client rather than retrying.

## AI usage

See [AI_USAGE.md](./AI_USAGE.md) for details on how AI tools were used in building this project.
