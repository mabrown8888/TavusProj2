import { useState } from "react";
import { CVIProvider } from "./components/cvi/components/cvi-provider";
import { Setup } from "./pages/Setup";
import { Scene } from "./pages/Scene";
import { Debrief } from "./pages/Debrief";
import { createConversation } from "./api/createConversation";
import type { GOTE } from "./types";

type View = "setup" | "scene" | "debrief";

const App = () => {
  const [view, setView] = useState<View>("setup");
  const [gote, setGote] = useState<GOTE | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (newGote: GOTE) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createConversation(newGote);
      setGote(newGote);
      setConversationUrl(result.conversationUrl);
      setView("scene");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scene. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    setView("debrief");
  };

  const handleRunAgain = async () => {
    if (!gote) return;
    await handleStart(gote);
  };

  const handleNewScene = () => {
    setConversationUrl(null);
    setGote(null);
    setView("setup");
  };

  return (
    <CVIProvider>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-50 text-sm shadow-lg">
          {error}
        </div>
      )}

      {view === "setup" && (
        <Setup onStart={handleStart} loading={loading} />
      )}

      {view === "scene" && conversationUrl && gote && (
        <Scene conversationUrl={conversationUrl} gote={gote} onLeave={handleLeave} />
      )}

      {view === "debrief" && gote && (
        <Debrief gote={gote} onRunAgain={handleRunAgain} onNewScene={handleNewScene} />
      )}
    </CVIProvider>
  );
};

export default App;
