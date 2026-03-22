import { useState, useRef } from "react";
import type { GOTE, ScriptSetup, SetupMode } from "../types";
import { extractTextFromPdf, getPdfPageCount } from "../utils/pdfExtract";
import { extractCharacters } from "../utils/extractCharacters";

interface SetupProps {
  onStart: (setup: GOTE | ScriptSetup) => void;
  loading: boolean;
}

// ─── GOTE form ────────────────────────────────────────────────────────────────

const GOTE_LABELS: Record<keyof GOTE, string> = {
  characterName: "Character Name",
  scenarioDescription: "Scene Context",
  goal: "Goal",
  obstacles: "Obstacles",
  tactics: "Tactics",
  endCondition: "End",
};
const GOTE_DESC: Record<keyof GOTE, string> = {
  characterName: "Who is the AI playing?",
  scenarioDescription: "Where are we? What's the situation?",
  goal: "What does the character want most?",
  obstacles: "What's standing in their way?",
  tactics: "How do they pursue their goal?",
  endCondition: "What does victory look like?",
};
const GOTE_HINTS: Record<keyof GOTE, string> = {
  characterName: "e.g. Detective Sarah Cole",
  scenarioDescription: "e.g. An interrogation room. Cole thinks the suspect knows where the child is.",
  goal: "e.g. Get the suspect to give up the location before time runs out.",
  obstacles: "e.g. The suspect is evasive, lawyered up, and the clock is ticking.",
  tactics: "e.g. Start friendly, build false rapport, then pivot to hard pressure.",
  endCondition: "e.g. The suspect breaks and gives up the location.",
};
const GOTE_ORDER: (keyof GOTE)[] = ["characterName", "scenarioDescription", "goal", "obstacles", "tactics", "endCondition"];
const GOTE_MULTILINE = new Set<keyof GOTE>(["scenarioDescription", "goal", "obstacles", "tactics", "endCondition"]);
const EMPTY_GOTE: GOTE = { characterName: "", scenarioDescription: "", goal: "", obstacles: "", tactics: "", endCondition: "" };

const GoteForm = ({ onStart, loading }: SetupProps) => {
  const [gote, setGote] = useState<GOTE>(EMPTY_GOTE);
  const isValid = Object.values(gote).every((v) => v.trim().length > 0);
  const set = (field: keyof GOTE) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setGote((p) => ({ ...p, [field]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (isValid && !loading) onStart(gote); }} className="space-y-4">
      <div className="flex gap-2 mb-4">
        {(["G", "O", "T", "E"] as const).map((l, i) => (
          <div key={l} className="flex flex-col items-center">
            <span className="text-stage-gold font-bold text-base w-7 h-7 flex items-center justify-center border border-stage-gold rounded">{l}</span>
            <span className="text-stage-muted text-xs mt-1">{["Goal", "Obstacles", "Tactics", "End"][i]}</span>
          </div>
        ))}
      </div>

      {GOTE_ORDER.map((field) => (
        <div key={field}>
          <label className="block mb-1">
            <span className="text-white font-semibold text-sm">{GOTE_LABELS[field]}</span>
            <span className="text-stage-muted text-xs ml-2">{GOTE_DESC[field]}</span>
          </label>
          {GOTE_MULTILINE.has(field) ? (
            <textarea value={gote[field]} onChange={set(field)} placeholder={GOTE_HINTS[field]} rows={2}
              className="w-full bg-stage-card border border-stage-border rounded-lg px-4 py-3 text-white placeholder-stage-muted text-sm focus:outline-none focus:border-stage-gold resize-none transition-colors" />
          ) : (
            <input type="text" value={gote[field]} onChange={set(field)} placeholder={GOTE_HINTS[field]}
              className="w-full bg-stage-card border border-stage-border rounded-lg px-4 py-3 text-white placeholder-stage-muted text-sm focus:outline-none focus:border-stage-gold transition-colors" />
          )}
        </div>
      ))}

      <StartButton valid={isValid} loading={loading} />
    </form>
  );
};

// ─── Script form ──────────────────────────────────────────────────────────────

const ScriptForm = ({ onStart, loading }: SetupProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [scriptText, setScriptText] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const [aiCharacter, setAiCharacter] = useState("");
  const [userCharacter, setUserCharacter] = useState("");
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setParsing(true);
    try {
      const count = await getPdfPageCount(f);
      setPageCount(count);
      setStartPage(1);
      setEndPage(count);
      const text = await extractTextFromPdf(f, 1, count);
      setScriptText(text);
      const found = extractCharacters(text);
      setCharacters(found);
      if (found[0]) setAiCharacter(found[0]);
      if (found[1]) setUserCharacter(found[1]);
    } finally {
      setParsing(false);
    }
  };

  const handlePageRangeChange = async (start: number, end: number) => {
    if (!file) return;
    setParsing(true);
    try {
      const text = await extractTextFromPdf(file, start, end);
      setScriptText(text);
      const found = extractCharacters(text);
      setCharacters(found);
      if (found[0]) setAiCharacter(found[0]);
      if (found[1]) setUserCharacter(found[1]);
    } finally {
      setParsing(false);
    }
  };

  const isValid = !!scriptText && !!aiCharacter && !!userCharacter && aiCharacter !== userCharacter;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    onStart({ aiCharacter, userCharacter, scriptText, scriptTitle: file?.name ?? "Script" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Upload */}
      <div>
        <label className="block text-white font-semibold text-sm mb-1">Script PDF</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full bg-stage-card border border-dashed border-stage-border rounded-lg px-4 py-6 text-center cursor-pointer hover:border-stage-gold transition-colors"
        >
          {file ? (
            <div>
              <p className="text-white font-medium text-sm">{file.name}</p>
              {pageCount > 0 && <p className="text-stage-muted text-xs mt-1">{pageCount} pages</p>}
            </div>
          ) : (
            <div>
              <p className="text-stage-muted text-sm">Click to upload a PDF script</p>
              <p className="text-stage-muted text-xs mt-1">Screenplay or stage play format</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      {/* Page range */}
      {pageCount > 1 && (
        <div>
          <label className="block text-white font-semibold text-sm mb-1">
            Page Range <span className="text-stage-muted font-normal">(narrow to a scene)</span>
          </label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <p className="text-stage-muted text-xs mb-1">From</p>
              <input type="number" min={1} max={pageCount} value={startPage}
                onChange={(e) => { const v = Number(e.target.value); setStartPage(v); handlePageRangeChange(v, endPage); }}
                className="w-full bg-stage-card border border-stage-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-stage-gold" />
            </div>
            <div className="flex-1">
              <p className="text-stage-muted text-xs mb-1">To</p>
              <input type="number" min={1} max={pageCount} value={endPage}
                onChange={(e) => { const v = Number(e.target.value); setEndPage(v); handlePageRangeChange(startPage, v); }}
                className="w-full bg-stage-card border border-stage-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-stage-gold" />
            </div>
            <div className="text-stage-muted text-xs pt-4">of {pageCount}</div>
          </div>
        </div>
      )}

      {parsing && <p className="text-stage-muted text-sm text-center">Reading script...</p>}

      {/* Character selection */}
      {characters.length > 0 && !parsing && (
        <>
          <div>
            <label className="block text-white font-semibold text-sm mb-1">
              AI plays <span className="text-stage-gold">—</span> which character?
            </label>
            <select value={aiCharacter} onChange={(e) => setAiCharacter(e.target.value)}
              className="w-full bg-stage-card border border-stage-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-stage-gold">
              {characters.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-1">
              You play <span className="text-stage-gold">—</span> which character?
            </label>
            <select value={userCharacter} onChange={(e) => setUserCharacter(e.target.value)}
              className="w-full bg-stage-card border border-stage-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-stage-gold">
              {characters.filter((c) => c !== aiCharacter).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </>
      )}

      {file && !parsing && characters.length === 0 && (
        <p className="text-amber-400 text-sm">No character names detected. Make sure the script uses ALL-CAPS names before each line.</p>
      )}

      <StartButton valid={isValid} loading={loading} />
    </form>
  );
};

// ─── Shared ───────────────────────────────────────────────────────────────────

const StartButton = ({ valid, loading }: { valid: boolean; loading: boolean }) => (
  <button type="submit" disabled={!valid || loading}
    className="w-full py-4 rounded-lg font-semibold text-base transition-all mt-2"
    style={{
      background: valid && !loading ? "linear-gradient(135deg, #C9A84C, #E8C86A)" : "#2A2A3A",
      color: valid && !loading ? "#0D0D14" : "#6B6B8A",
      cursor: valid && !loading ? "pointer" : "not-allowed",
    }}>
    {loading ? "Setting the stage..." : "Begin Scene"}
  </button>
);

// ─── Main Setup ───────────────────────────────────────────────────────────────

export const Setup = ({ onStart, loading }: SetupProps) => {
  const [mode, setMode] = useState<SetupMode>("gote");

  return (
    <div className="min-h-screen bg-stage-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-stage-gold text-4xl">⬡</span>
          <h1 className="text-4xl font-bold text-white tracking-tight mt-2 mb-1">Scene Partner</h1>
          <p className="text-stage-muted text-base">Practice with an AI that has real stakes.</p>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {([
            { id: "gote" as SetupMode, label: "Improv Scene", sub: "Give the AI a character + GOTE" },
            { id: "script" as SetupMode, label: "Script Scene", sub: "Upload a PDF and run lines" },
          ] as const).map(({ id, label, sub }) => (
            <button key={id} type="button" onClick={() => setMode(id)}
              className="flex flex-col items-start p-4 rounded-xl border transition-all text-left"
              style={{
                background: mode === id ? "rgba(201,168,76,0.1)" : "#16161F",
                borderColor: mode === id ? "#C9A84C" : "#2A2A3A",
              }}>
              <span className="font-semibold text-white text-sm">{label}</span>
              <span className="text-stage-muted text-xs mt-1">{sub}</span>
            </button>
          ))}
        </div>

        {mode === "gote"
          ? <GoteForm onStart={onStart} loading={loading} />
          : <ScriptForm onStart={onStart} loading={loading} />}
      </div>
    </div>
  );
};
