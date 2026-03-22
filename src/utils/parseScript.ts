export interface ScriptTurn {
  character: string;
  dialogue: string;
}

// Parses a script into ordered turns by character.
// Handles standard screenplay format: ALL-CAPS name on its own line, dialogue below.
export const parseScript = (scriptText: string, aiCharacter: string, userCharacter: string): ScriptTurn[] => {
  const lines = scriptText.split(/[\n\r]+/).map((l) => l.trim());
  const turns: ScriptTurn[] = [];

  let currentChar: string | null = null;
  let currentLines: string[] = [];

  const matchCharacter = (line: string): string | null => {
    // Strip trailing parentheticals like (CONT'D), (V.O.)
    const cleaned = line.replace(/\s*\(.*?\)\s*$/, "").trim();
    if (cleaned === aiCharacter) return aiCharacter;
    if (cleaned === userCharacter) return userCharacter;
    return null;
  };

  for (const line of lines) {
    if (!line) continue;

    const charMatch = matchCharacter(line);

    if (charMatch) {
      // Save the previous turn before starting a new one
      if (currentChar && currentLines.length > 0) {
        turns.push({ character: currentChar, dialogue: currentLines.join(" ").trim() });
      }
      currentChar = charMatch;
      currentLines = [];
    } else if (currentChar) {
      // Skip pure stage directions in parentheses
      if (/^\(.*\)$/.test(line)) continue;
      currentLines.push(line);
    }
  }

  // Capture the last turn
  if (currentChar && currentLines.length > 0) {
    turns.push({ character: currentChar, dialogue: currentLines.join(" ").trim() });
  }

  return turns;
};
