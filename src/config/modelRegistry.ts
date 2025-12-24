/**
 * Model Registry Configuration
 * 
 * This file defines the default model registry with provider-aware model definitions.
 * Model IDs are internal registry keys, not necessarily vendor API IDs.
 * These will be mapped to actual API model names in core or via adapters.
 */

export type ProviderId = "openai" | "anthropic" | "google";

export interface ModelDef {
  id: string;
  label: string;
  provider: ProviderId;
  family?: string;
  notes?: string;
  enabled: boolean;
}

/**
 * Default model registry seeded with latest model families
 * 
 * Updated: December 2025
 * These are the most recent models available from each provider.
 */
export const defaultModelRegistry: ModelDef[] = [
  // OpenAI Models
  {
    id: "gpt-5.2",
    label: "GPT-5.2",
    provider: "openai",
    family: "GPT-5",
    notes: "Latest: Enhanced intelligence, improved coding, long-context",
    enabled: true,
  },
  {
    id: "gpt-5.1",
    label: "GPT-5.1",
    provider: "openai",
    family: "GPT-5",
    notes: "Previous generation with strong performance",
    enabled: true,
  },

  // Anthropic Models
  {
    id: "claude-opus-4.5",
    label: "Claude Opus 4.5",
    provider: "anthropic",
    family: "Claude 4.5",
    notes: "Latest: Advanced coding, autonomous tool use, long-horizon workflows",
    enabled: true,
  },
  {
    id: "claude-sonnet-4.5",
    label: "Claude Sonnet 4.5",
    provider: "anthropic",
    family: "Claude 4.5",
    notes: "Balanced performance for general tasks",
    enabled: true,
  },
  {
    id: "claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "anthropic",
    family: "Claude 4.5",
    notes: "Fast and efficient for simple tasks",
    enabled: true,
  },

  // Google Models
  {
    id: "gemini-3-pro",
    label: "Gemini 3 Pro",
    provider: "google",
    family: "Gemini 3",
    notes: "Latest: Advanced reasoning and multimodal capabilities",
    enabled: true,
  },
  {
    id: "gemini-3-flash",
    label: "Gemini 3 Flash",
    provider: "google",
    family: "Gemini 3",
    notes: "High-speed performance with sophisticated reasoning",
    enabled: true,
  },
];






