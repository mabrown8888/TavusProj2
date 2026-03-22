import { useState } from "react";
import { CVIProvider } from "./components/cvi/components/cvi-provider";
import { Setup } from "./pages/Setup";
import { Scene } from "./pages/Scene";
import { Debrief } from "./pages/Debrief";
import { createConversation } from "./api/createConversation";
import type { GOTE, ScriptSetup } from "./types";

type View = "setup" | "scene" | "debrief";
type AnySetup = GOTE | ScriptSetup;

const App = () => {
  const [view, setView] = useState<View>("setup");
  const [setup, setSetup] = useState<AnySetup | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (newSetup: AnySetup) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createConversation(newSetup);
      setSetup(newSetup);
      setConversationUrl(result.conversationUrl);
      setView("scene");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scene. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunAgain = async () => {
    if (setup) await handleStart(setup);
  };

  const handleNewScene = () => {
    setConversationUrl(null);
    setSetup(null);
    setView("setup");
  };

  return (
    <CVIProvider>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-50 text-sm shadow-lg">
          {error}
        </div>
      )}

      {view === "setup" && <Setup onStart={handleStart} loading={loading} />}

      {view === "scene" && conversationUrl && setup && (
        <Scene conversationUrl={conversationUrl} setup={setup} onLeave={() => setView("debrief")} />
      )}

      {view === "debrief" && setup && (
        <Debrief setup={setup} onRunAgain={handleRunAgain} onNewScene={handleNewScene} />
      )}
    </CVIProvider>
  );
};

export default App;
