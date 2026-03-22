import type { GOTE } from "../types";

const buildAnalysisPrompt = (gote: GOTE, reflection: string): string => `You are a theatrical director and acting coach analyzing a scene rehearsal.

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

export const analyzeScene = async (gote: GOTE, reflection: string): Promise<string> => {
  if (import.meta.env.DEV) {
    // Call Claude directly in dev — key stays in local .env, never deployed
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: buildAnalysisPrompt(gote, reflection) }],
    });
    return message.content[0].type === "text" ? message.content[0].text : "";
  }

  const res = await fetch("/api/analyze-scene", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gote, reflection }),
  });

  if (!res.ok) throw new Error((await res.text()) || "Failed to analyze scene");
  const data = (await res.json()) as { analysis: string };
  return data.analysis;
};
