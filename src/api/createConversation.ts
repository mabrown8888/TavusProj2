import type { GOTE, ScriptSetup, ConversationResult } from "../types";
import { buildSystemPrompt, buildScriptPrompt } from "../utils/buildSystemPrompt";

const callTavusDirect = async (
  name: string,
  context: string
): Promise<ConversationResult> => {
  const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
  const replicaId = import.meta.env.VITE_REPLICA_ID;

  const res = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      replica_id: replicaId,
      conversation_name: name,
      conversational_context: context,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { conversation_url: string; conversation_id: string };
  return { conversationUrl: data.conversation_url, conversationId: data.conversation_id };
};

export const createConversation = async (
  setup: GOTE | ScriptSetup
): Promise<ConversationResult> => {
  const isScript = "aiCharacter" in setup;
  const name = isScript
    ? `Scene Partner — ${setup.aiCharacter}`
    : `Scene Partner — ${setup.characterName}`;
  const context = isScript ? buildScriptPrompt(setup) : buildSystemPrompt(setup);

  if (import.meta.env.DEV) {
    return callTavusDirect(name, context);
  }

  const res = await fetch("/api/create-conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(setup),
  });

  if (!res.ok) throw new Error((await res.text()) || "Failed to create conversation");
  return res.json() as Promise<ConversationResult>;
};
