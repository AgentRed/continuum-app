/**
 * Model Provider Type
 * 
 * Represents an LLM provider (OpenAI, Google, Anthropic, etc.)
 */
export type ModelProviderId = "openai" | "google" | "anthropic" | string;

export interface ModelProvider {
  id: ModelProviderId;
  displayName: string;
}





