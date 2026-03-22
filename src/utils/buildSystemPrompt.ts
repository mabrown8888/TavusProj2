import type { GOTE, ScriptSetup } from "../types";
import { cleanScriptText } from "./cleanScriptText";
import { parseScript } from "./parseScript";

export const buildSystemPrompt = (gote: GOTE): string => {
  return `You are playing ${gote.characterName} in a live acting scene rehearsal.

SCENE CONTEXT: ${gote.scenarioDescription}

YOUR CHARACTER'S GOTE:
- GOAL: ${gote.goal}
- OBSTACLES: ${gote.obstacles}
- TACTICS: ${gote.tactics}
- END (what your victory looks like): ${gote.endCondition}

IMPORTANT INSTRUCTIONS:
- Stay completely in character at all times. You ARE ${gote.characterName}.
- Pursue your goal actively using your tactics. Do not be passive.
- React authentically to what the other person says and does.
- Let the scene have real emotional stakes — the goal matters deeply to you.
- Do not break character, acknowledge you are an AI, or refer to the GOTE framework.
- This is a live scene rehearsal. Play it as if the stakes are real.`;
};

export const buildScriptPrompt = (setup: ScriptSetup): string => {
  const turns = parseScript(setup.scriptText, setup.aiCharacter, setup.userCharacter);

  if (turns.length === 0) {
    // Fallback if parsing finds nothing — use cleaned raw text
    return `You are playing ${setup.aiCharacter} in a script rehearsal with ${setup.userCharacter}. Deliver your lines one at a time and wait for the other actor to respond before continuing.

SCRIPT:
${cleanScriptText(setup.scriptText)}`;
  }

  // Build a numbered turn-by-turn list so the AI knows exactly what to say and when to wait
  const turnList = turns.map((turn, i) => {
    const clean = cleanScriptText(turn.dialogue);
    if (turn.character === setup.aiCharacter) {
      return `[${i + 1}] YOU SAY: "${clean}"`;
    }
    return `[${i + 1}] WAIT — ${setup.userCharacter} speaks`;
  }).join("\n");

  return `You are playing ${setup.aiCharacter} in a two-person script rehearsal. The other actor is playing ${setup.userCharacter}.

YOUR SCENE — perform these turns in exact order:

${turnList}

RULES (follow strictly):
- Deliver ONLY your own lines. Never say ${setup.userCharacter}'s lines.
- Say ONE line at a time, then stop and wait for the other actor.
- Do not combine or skip turns. Do not rush ahead.
- If the actor hesitates, wait in silence. Do not fill the gap.
- If they go off-script, stay in character, then return to your next scripted line.
- If asked to repeat a line, repeat it exactly.
- Speak naturally — never read punctuation marks aloud (not "dot", "comma", "dash", etc.).
- Do not break character or acknowledge you are an AI.`;
};
