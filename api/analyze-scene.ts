import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import type { GOTE } from "../src/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { gote, reflection } = req.body as { gote: GOTE; reflection: string };

  if (!gote?.characterName) {
    return res.status(400).send("Missing GOTE data");
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).send("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });

  const prompt = `You are a theatrical director and acting coach analyzing a scene rehearsal.

THE AI CHARACTER PLAYED: ${gote.characterName}
SCENE CONTEXT: ${gote.scenarioDescription}

THE CHARACTER'S GOTE:
- Goal: ${gote.goal}
- Obstacles: ${gote.obstacles}
- Tactics: ${gote.tactics}
- End (what victory looked like): ${gote.endCondition}

${reflection ? `ACTOR'S REFLECTION:\n${reflection}\n` : ""}

Please provide a director's debrief covering:

1. **How the character likely pursued their goal** — which tactics would have driven the scene's momentum
2. **Tension peaks** — moments where the scene probably reached its highest stakes
3. **Tactic shifts** — where the character would have changed approach based on resistance
4. **Goal achievement** — whether the character achieved their goal, and what likely decided it
5. **Coaching for the actor** — 2-3 specific, actionable notes on how to play against this character more effectively

Keep it sharp, theatrical, and under 400 words. Speak as a director giving notes after a run.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const analysis = message.content[0].type === "text" ? message.content[0].text : "";

  return res.status(200).json({ analysis });
}
