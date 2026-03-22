import { useState } from "react";
import type { GOTE, ScriptSetup } from "../types";
import { analyzeScene } from "../api/analyzeScene";

type AnySetup = GOTE | ScriptSetup;

interface DebriefProps {
  setup: AnySetup;
  onRunAgain: () => void;
  onNewScene: () => void;
}

const SummaryCard = ({ setup }: { setup: AnySetup }) => {
  if ("aiCharacter" in setup) {
    return (
      <div className="bg-stage-card border border-stage-border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-stage-gold text-xs font-semibold uppercase tracking-widest">Script Scene</span>
          <span className="text-white font-bold">{setup.aiCharacter}</span>
          <span className="text-stage-muted text-xs">vs</span>
          <span className="text-white font-bold">{setup.userCharacter}</span>
        </div>
        <p className="text-stage-muted text-sm">{setup.scriptTitle}</p>
      </div>
    );
  }

  return (
    <div className="bg-stage-card border border-stage-border rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-stage-gold text-xs font-semibold uppercase tracking-widest">Character</span>
        <span className="text-white font-bold">{setup.characterName}</span>
      </div>
      <p className="text-stage-muted text-sm italic mb-3">"{setup.scenarioDescription}"</p>
      <div className="grid grid-cols-1 gap-2">
        {([["G — Goal", setup.goal], ["O — Obstacles", setup.obstacles], ["T — Tactics", setup.tactics], ["E — End", setup.endCondition]] as const).map(([label, value]) => (
          <div key={label}>
            <span className="text-stage-gold text-xs font-semibold">{label}: </span>
            <span className="text-gray-300 text-sm">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Debrief = ({ setup, onRunAgain, onNewScene }: DebriefProps) => {
  const [reflection, setReflection] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeScene(setup, reflection);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stage-bg flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-stage-gold text-3xl">⬡</span>
          <h2 className="text-3xl font-bold text-white mt-2">Scene Debrief</h2>
          <p className="text-stage-muted mt-1">Scene ended. Time to reflect.</p>
        </div>

        <SummaryCard setup={setup} />

        {!analysis ? (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold text-sm mb-1">
                Your Reflection <span className="text-stage-muted font-normal">(optional)</span>
              </label>
              <p className="text-stage-muted text-xs mb-2">What moments stood out? Where did you struggle?</p>
              <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
                placeholder="The scene felt tense when the character started pushing harder..."
                rows={4}
                className="w-full bg-stage-card border border-stage-border rounded-lg px-4 py-3 text-white placeholder-stage-muted text-sm focus:outline-none focus:border-stage-gold resize-none transition-colors" />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            <button onClick={handleAnalyze} disabled={loading}
              className="w-full py-4 rounded-lg font-semibold text-base transition-all"
              style={{
                background: loading ? "#2A2A3A" : "linear-gradient(135deg, #C9A84C, #E8C86A)",
                color: loading ? "#6B6B8A" : "#0D0D14",
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? "Reading the room..." : "Analyze Scene"}
            </button>
          </div>
        ) : (
          <div className="bg-stage-card border border-stage-border rounded-xl p-5">
            <h3 className="text-stage-gold font-semibold text-sm uppercase tracking-widest mb-3">Director's Notes</h3>
            <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onRunAgain}
            className="flex-1 py-3 rounded-lg border border-stage-border text-white font-semibold text-sm hover:border-stage-gold hover:text-stage-gold transition-colors">
            Run Scene Again
          </button>
          <button onClick={onNewScene}
            className="flex-1 py-3 rounded-lg border border-stage-gold text-stage-gold font-semibold text-sm hover:bg-stage-gold hover:text-stage-bg transition-colors">
            New Scene
          </button>
        </div>
      </div>
    </div>
  );
};
