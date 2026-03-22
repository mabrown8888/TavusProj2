// Extracts character names from a script by finding ALL-CAPS names
// that appear on their own line (standard screenplay/stage play format).
export const extractCharacters = (scriptText: string): string[] => {
  const lines = scriptText.split(/[\n\r]+/);
  const counts = new Map<string, number>();

  for (const line of lines) {
    const trimmed = line.trim();
    // All-caps, 2–40 chars, letters + spaces only, no stage directions like "INT." etc.
    if (/^[A-Z][A-Z\s]{1,39}$/.test(trimmed) && !trimmed.includes("  ")) {
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }

  // Only keep names that appear at least twice — filters out one-off stage directions
  return Array.from(counts.entries())
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
};
