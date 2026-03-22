import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSystemPrompt, buildScriptPrompt } from "../src/utils/buildSystemPrompt";
import type { GOTE, ScriptSetup } from "../src/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const apiKey = process.env.TAVUS_API_KEY ?? process.env.VITE_TAVUS_API_KEY;
  const replicaId = process.env.REPLICA_ID ?? process.env.VITE_REPLICA_ID;
  if (!apiKey) return res.status(500).send("TAVUS_API_KEY not configured");
  if (!replicaId) return res.status(500).send("REPLICA_ID not configured");

  const body = req.body as GOTE | ScriptSetup;
  const isScript = "aiCharacter" in body;
  const name = isScript ? `Scene Partner — ${body.aiCharacter}` : `Scene Partner — ${body.characterName}`;
  const context = isScript ? buildScriptPrompt(body) : buildSystemPrompt(body);

  const tavusRes = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ replica_id: replicaId, conversation_name: name, conversational_context: context }),
  });

  if (!tavusRes.ok) return res.status(tavusRes.status).send(await tavusRes.text());

  const data = (await tavusRes.json()) as { conversation_url: string; conversation_id: string };
  return res.status(200).json({ conversationUrl: data.conversation_url, conversationId: data.conversation_id });
}
