// Extracts character names from a script by finding ALL-CAPS names
// on their own line (standard screenplay/stage play format).
export const extractCharacters = (scriptText: string): string[] => {
  const lines = scriptText.split(/[\n\r]+/);
  const counts = new Map<string, number>();

  for (const line of lines) {
    // Strip parentheticals like (CONT'D), (V.O.), (O.S.) before testing
    const trimmed = line.trim().replace(/\s*\(.*?\)\s*$/, "").trim();

    if (trimmed.length < 2 || trimmed.length > 40) continue;

    // Must be all caps: letters, spaces, apostrophes, periods, hyphens
    if (!/^[A-Z][A-Z\s'./-]{1,39}$/.test(trimmed)) continue;

    // Skip common stage directions that happen to be all-caps
    const skip = new Set(["INT", "EXT", "INT.", "EXT.", "CUT TO", "FADE IN", "FADE OUT",
      "SMASH CUT", "DISSOLVE TO", "TITLE CARD", "THE END", "ACT ONE", "ACT TWO",
      "SCENE", "END OF", "CONTINUED", "MORE"]);
    if (skip.has(trimmed)) continue;

    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }

  // Only keep names that appear at least twice
  return Array.from(counts.entries())
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
};
