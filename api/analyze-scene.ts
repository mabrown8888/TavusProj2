import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import type { GOTE, ScriptSetup } from "../src/types";

type AnySetup = GOTE | ScriptSetup;

const buildAnalysisPrompt = (setup: AnySetup, reflection: string): string => {
  const isScript = "aiCharacter" in setup;

  const context = isScript
    ? `SCRIPT SCENE\nAI played: ${setup.aiCharacter}\nActor played: ${setup.userCharacter}\nScript title: ${setup.scriptTitle}`
    : `IMPROV SCENE\nAI played: ${setup.characterName}\nScene context: ${setup.scenarioDescription}\nGoal: ${setup.goal}\nObstacles: ${setup.obstacles}\nTactics: ${setup.tactics}\nEnd: ${setup.endCondition}`;

  return `You are a theatrical director and acting coach analyzing a scene rehearsal.\n\n${context}\n\n${reflection ? `ACTOR'S REFLECTION:\n${reflection}\n` : ""}
Please provide a director's debrief covering:
1. **Character pursuit** — how the AI character likely drove the scene's momentum
2. **Tension peaks** — moments where stakes were probably highest
3. **Tactic shifts** — where the character would have changed approach
4. **Outcome** — whether the character achieved their goal or delivered the script authentically
5. **Coaching notes** — 2-3 specific, actionable notes for the actor

Keep it sharp, theatrical, and under 400 words.`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).send("ANTHROPIC_API_KEY not configured");

  const { setup, reflection } = req.body as { setup: AnySetup; reflection: string };
  if (!setup) return res.status(400).send("Missing setup data");

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: buildAnalysisPrompt(setup, reflection) }],
  });

  const analysis = message.content[0].type === "text" ? message.content[0].text : "";
  return res.status(200).json({ analysis });
}
