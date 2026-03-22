# TODOs — Scene Partner

## TODO-1: Serverless API proxy for Tavus key
**What:** Add a Vercel serverless function (`/api/create-conversation.ts`) that makes Tavus API calls server-side so the API key is never bundled into client JS.

**Why:** `VITE_TAVUS_API_KEY` currently ships in the JS bundle and is visible in any browser's DevTools or network tab. Acceptable for a demo, not for public launch.

**Pros:** Key is never client-visible; rate limiting can be added server-side; can validate inputs before forwarding.

**Cons:** Adds a serverless function + CORS handling; small latency increase; Vercel deploy config needed.

**Context:** The current client calls `https://tavusapi.com/v2/conversations` directly. The proxy would be a thin pass-through: receive the conversation params, add the API key server-side, forward to Tavus. MaizePrep (TavusProj1) has the same vulnerability and would benefit from the same fix.

**Depends on:** None. Can be done any time before a public-facing launch.

---

## TODO-2: Debrief screen (post-scene analysis)
**What:** After the scene ends, show a debrief screen that uses the Claude API to analyze how the AI character pursued their GOTE — which lines had the most tension, where tactics shifted, and whether the goal was achieved.

**Why:** Turns the app from a live rehearsal tool into a full coaching loop. Actors can reflect, adjust tactics, and run again — the core learning cycle.

**Pros:** High demo value; differentiates from "just a chatbot"; replayability with different GOTE inputs.

**Cons:** Requires Claude API key + additional env var; adds a third page/view; API call latency (~2-3s) at scene end.

**Context:** The plan already outlined this as Hour 10 / stretch goal. The Claude API call would receive the GOTE, the AI character's lines, and a summary prompt. The `buildSystemPrompt` utility already has all the data needed to construct this analysis prompt. See plan section "Hour 10 — Stretch: Debrief Screen" for the full spec.

**Depends on:** Core scene flow working end-to-end (Hours 1-8).
