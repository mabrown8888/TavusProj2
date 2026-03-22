import { useState } from "react";
import type { GOTE } from "../types";

interface SetupProps {
  onStart: (gote: GOTE) => void;
  loading: boolean;
}

const FIELD_HINTS: Record<keyof GOTE, string> = {
  characterName: "e.g. Detective Sarah Cole",
  scenarioDescription: "e.g. An interrogation room. Detective Cole believes this suspect knows where the missing child is.",
  goal: "e.g. Get the suspect to reveal the child's location before it's too late.",
  obstacles: "e.g. The suspect is evasive, lawyered up, and the clock is running out.",
  tactics: "e.g. Start friendly, build false rapport, then pivot to hard pressure when they slip up.",
  endCondition: "e.g. The suspect breaks and gives up the location — or asks for a deal.",
};

const FIELD_LABELS: Record<keyof GOTE, string> = {
  characterName: "Character Name",
  scenarioDescription: "Scene Context",
  goal: "Goal",
  obstacles: "Obstacles",
  tactics: "Tactics",
  endCondition: "End",
};

const GOTE_DESCRIPTIONS: Record<keyof GOTE, string> = {
  characterName: "Who is the AI playing?",
  scenarioDescription: "Where are we? What's the situation?",
  goal: "What does the character want most in this scene?",
  obstacles: "What's standing in their way?",
  tactics: "How do they pursue their goal?",
  endCondition: "What does victory look like for this character?",
};

const EMPTY: GOTE = {
  characterName: "",
  scenarioDescription: "",
  goal: "",
  obstacles: "",
  tactics: "",
  endCondition: "",
};

export const Setup = ({ onStart, loading }: SetupProps) => {
  const [gote, setGote] = useState<GOTE>(EMPTY);

  const isValid = Object.values(gote).every((v) => v.trim().length > 0);

  const set = (field: keyof GOTE) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGote((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !loading) onStart(gote);
  };

  const goteOrder: (keyof GOTE)[] = ["characterName", "scenarioDescription", "goal", "obstacles", "tactics", "endCondition"];
  const multilineFields = new Set<keyof GOTE>(["scenarioDescription", "goal", "obstacles", "tactics", "endCondition"]);

  return (
    <div className="min-h-screen bg-stage-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <span className="text-stage-gold text-4xl">⬡</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Scene Partner</h1>
          <p className="text-stage-muted text-lg">Set up your AI scene partner's character and stakes.</p>
        </div>

        {/* GOTE label */}
        <div className="flex gap-2 mb-6 justify-center">
          {(["G", "O", "T", "E"] as const).map((letter, i) => {
            const labels = ["Goal", "Obstacles", "Tactics", "End"];
            return (
              <div key={letter} className="flex flex-col items-center">
                <span className="text-stage-gold font-bold text-lg w-8 h-8 flex items-center justify-center border border-stage-gold rounded">{letter}</span>
                <span className="text-stage-muted text-xs mt-1">{labels[i]}</span>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {goteOrder.map((field) => (
            <div key={field}>
              <label className="block mb-1">
                <span className="text-white font-semibold text-sm">{FIELD_LABELS[field]}</span>
                <span className="text-stage-muted text-xs ml-2">{GOTE_DESCRIPTIONS[field]}</span>
              </label>
              {multilineFields.has(field) ? (
                <textarea
                  value={gote[field]}
                  onChange={set(field)}
                  placeholder={FIELD_HINTS[field]}
                  rows={2}
                  className="w-full bg-stage-card border border-stage-border rounded-lg px-4 py-3 text-white placeholder-stage-muted text-sm focus:outline-none focus:border-stage-gold resize-none transition-colors"
                />
              ) : (
                <input
                  type="text"
                  value={gote[field]}
                  onChange={set(field)}
                  placeholder={FIELD_HINTS[field]}
                  className="w-full bg-stage-card border border-stage-border rounded-lg px-4 py-3 text-white placeholder-stage-muted text-sm focus:outline-none focus:border-stage-gold transition-colors"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-4 rounded-lg font-semibold text-base transition-all mt-4"
            style={{
              background: isValid && !loading ? "linear-gradient(135deg, #C9A84C, #E8C86A)" : "#2A2A3A",
              color: isValid && !loading ? "#0D0D14" : "#6B6B8A",
              cursor: isValid && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Setting the stage..." : "Begin Scene"}
          </button>
        </form>
      </div>
    </div>
  );
};
