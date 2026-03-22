import type { GOTE, ConversationResult } from "../types";
import { buildSystemPrompt } from "../utils/buildSystemPrompt";

// In dev, call Tavus directly (key is local-only, never deployed in the bundle).
// In production, use the serverless proxy so the key stays server-side.
export const createConversation = async (gote: GOTE): Promise<ConversationResult> => {
  if (import.meta.env.DEV) {
    const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
    const replicaId = import.meta.env.VITE_REPLICA_ID;

    const res = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        replica_id: replicaId,
        conversation_name: `Scene Partner — ${gote.characterName}`,
        conversational_context: buildSystemPrompt(gote),
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as { conversation_url: string; conversation_id: string };
    return { conversationUrl: data.conversation_url, conversationId: data.conversation_id };
  }

  const res = await fetch("/api/create-conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gote),
  });

  if (!res.ok) throw new Error((await res.text()) || "Failed to create conversation");
  return res.json() as Promise<ConversationResult>;
};
