// Sanitizes script text for Tavus TTS — removes formatting characters
// that get read aloud literally ("dot", "dash", spelling out words, etc.)
export const cleanScriptText = (text: string): string => {
  return text
    // Remove parenthetical stage directions: (softly), (beat), (V.O.), etc.
    .replace(/\(.*?\)/g, "")
    // Ellipsis → natural pause (em-dash reads better than three dots)
    .replace(/\.{2,}/g, "—")
    // Double dash → em-dash
    .replace(/--/g, "—")
    // Remove standalone page numbers (a line that's just a number)
    .replace(/^\s*\d+\s*$/gm, "")
    // Remove common script header artifacts: "CONTINUED:", "(MORE)", etc.
    .replace(/^\s*(CONTINUED:|CONT'D|MORE)\s*$/gim, "")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
