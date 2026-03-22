import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSystemPrompt } from "../src/utils/buildSystemPrompt";
import type { GOTE } from "../src/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const gote = req.body as GOTE;

  if (!gote?.characterName || !gote?.goal) {
    return res.status(400).send("Missing required GOTE fields");
  }

  const apiKey = process.env.TAVUS_API_KEY ?? process.env.VITE_TAVUS_API_KEY;
  const replicaId = process.env.REPLICA_ID ?? process.env.VITE_REPLICA_ID;

  if (!apiKey) return res.status(500).send("TAVUS_API_KEY not configured");
  if (!replicaId) return res.status(500).send("REPLICA_ID not configured");

  const conversationalContext = buildSystemPrompt(gote);

  const tavusRes = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      replica_id: replicaId,
      conversation_name: `Scene Partner — ${gote.characterName}`,
      conversational_context: conversationalContext,
    }),
  });

  if (!tavusRes.ok) {
    const msg = await tavusRes.text();
    return res.status(tavusRes.status).send(msg);
  }

  const data = (await tavusRes.json()) as {
    conversation_url: string;
    conversation_id: string;
  };

  return res.status(200).json({
    conversationUrl: data.conversation_url,
    conversationId: data.conversation_id,
  });
}
