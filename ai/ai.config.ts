import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export function getAgentModel() {
  const modelId = process.env.OPENROUTER_DEFAULT_MODEL;
  if (!process.env.OPENROUTER_API_KEY || !modelId) {
    throw new Error(
      "Set OPENROUTER_API_KEY and OPENROUTER_DEFAULT_MODEL in .env before using an AI mode.",
    );
  }
  const provider = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  return provider(modelId);
}
