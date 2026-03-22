import { Conversation } from "../components/cvi/components/conversation";
import type { GOTE, ScriptSetup } from "../types";

type AnySetup = GOTE | ScriptSetup;

interface SceneProps {
  conversationUrl: string;
  setup: AnySetup;
  onLeave: () => void;
}

const getBadge = (setup: AnySetup) => {
  if ("aiCharacter" in setup) {
    return { label: "Playing", name: setup.aiCharacter, sub: `You are ${setup.userCharacter}` };
  }
  return { label: "Playing", name: setup.characterName, sub: setup.scenarioDescription };
};

export const Scene = ({ conversationUrl, setup, onLeave }: SceneProps) => {
  const badge = getBadge(setup);

  return (
    <div className="min-h-screen bg-stage-bg flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stage-border">
        <div className="flex items-center gap-3">
          <span className="text-stage-gold text-xs font-semibold uppercase tracking-widest">{badge.label}</span>
          <span className="text-white font-bold">{badge.name}</span>
        </div>
        <div className="text-stage-muted text-xs max-w-xs truncate hidden md:block">{badge.sub}</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Conversation conversationUrl={conversationUrl} onLeave={onLeave} />
        </div>
      </div>
    </div>
  );
};
