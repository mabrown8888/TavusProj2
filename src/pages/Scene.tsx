import { Conversation } from "../components/cvi/components/conversation";
import type { GOTE } from "../types";

interface SceneProps {
  conversationUrl: string;
  gote: GOTE;
  onLeave: () => void;
}

export const Scene = ({ conversationUrl, gote, onLeave }: SceneProps) => {
  return (
    <div className="min-h-screen bg-stage-bg flex flex-col">
      {/* Character badge */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stage-border">
        <div className="flex items-center gap-3">
          <span className="text-stage-gold text-xs font-semibold uppercase tracking-widest">Playing</span>
          <span className="text-white font-bold">{gote.characterName}</span>
        </div>
        <div className="text-stage-muted text-xs max-w-xs truncate hidden md:block">
          {gote.scenarioDescription}
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Conversation conversationUrl={conversationUrl} onLeave={onLeave} />
        </div>
      </div>
    </div>
  );
};
