export interface GOTE {
  characterName: string;
  scenarioDescription: string;
  goal: string;
  obstacles: string;
  tactics: string;
  endCondition: string;
}

export interface ScriptSetup {
  aiCharacter: string;
  userCharacter: string;
  scriptText: string;
  scriptTitle: string;
}

export type SetupMode = "gote" | "script";

export interface ConversationResult {
  conversationUrl: string;
  conversationId: string;
}
