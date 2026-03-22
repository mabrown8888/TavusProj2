import type { GOTE, ScriptSetup } from "../types";

type AnySetup = GOTE | ScriptSetup;

const buildAnalysisPrompt = (setup: AnySetup, reflection: string): string => {
  const isScript = "aiCharacter" in setup;

  const context = isScript
    ? `SCRIPT SCENE
AI played: ${setup.aiCharacter}
Actor played: ${setup.userCharacter}
Script title: ${setup.scriptTitle}`
    : `IMPROV SCENE
AI played: ${setup.characterName}
Scene context: ${setup.scenarioDescription}
Goal: ${setup.goal}
Obstacles: ${setup.obstacles}
Tactics: ${setup.tactics}
End: ${setup.endCondition}`;

  return `You are a theatrical director and acting coach analyzing a scene rehearsal.

${context}

${reflection ? `ACTOR'S REFLECTION:\n${reflection}\n` : ""}
Please provide a director's debrief covering:

1. **Character pursuit** — how the AI character likely drove the scene's momentum
2. **Tension peaks** — moments where stakes were probably highest
3. **Tactic shifts** — where the character would have changed approach
4. **Outcome** — whether the character achieved their goal (improv) or delivered the script authentically
5. **Coaching notes** — 2-3 specific, actionable notes for the actor

Keep it sharp, theatrical, and under 400 words. Speak as a director giving notes after a run.`;
};

export const analyzeScene = async (setup: AnySetup, reflection: string): Promise<string> => {
  if (import.meta.env.DEV) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: buildAnalysisPrompt(setup, reflection) }],
    });
    return message.content[0].type === "text" ? message.content[0].text : "";
  }

  const res = await fetch("/api/analyze-scene", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ setup, reflection }),
  });

  if (!res.ok) throw new Error((await res.text()) || "Failed to analyze scene");
  const data = (await res.json()) as { analysis: string };
  return data.analysis;
};
