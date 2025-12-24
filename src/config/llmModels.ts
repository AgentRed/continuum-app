/**
 * LLM Model Configuration
 * 
 * This file defines the available LLM models for the frontend UI.
 * Models can be updated here without requiring code changes elsewhere.
 * 
 * Note: Model IDs are configurable and may not match actual API model names.
 * These are UI-facing identifiers that can be mapped to backend model names.
 */

export type ProviderId = "openai" | "anthropic" | "google";

export interface LlmModel {
  id: string;
  label: string;
  provider: ProviderId;
  family?: string;
  isDefault?: boolean;
  notes?: string;
}

/**
 * Get the default set of LLM models
 * 
 * These models are configurable and can be updated in this file.
 * Model IDs are placeholders that can be mapped to actual API model names.
 */
export function getDefaultModels(): LlmModel[] {
  return [
    // Google Models
    {
      id: "gemini-3-flash",
      label: "Gemini 3 Flash",
      provider: "google",
      family: "gemini-3",
      isDefault: true,
      notes: "Latest: High-speed performance with sophisticated reasoning (Dec 2025)",
    },
    {
      id: "gemini-3-pro",
      label: "Gemini 3 Pro",
      provider: "google",
      family: "gemini-3",
      notes: "Advanced reasoning and multimodal capabilities",
    },
    {
      id: "gemini-2.0-flash-pro",
      label: "Gemini 2.0 Flash Pro",
      provider: "google",
      family: "gemini-2.0",
      notes: "Fast, efficient model for real-time applications",
    },

    // Anthropic Models
    {
      id: "claude-opus-4.5",
      label: "Claude Opus 4.5",
      provider: "anthropic",
      family: "opus",
      notes: "Latest: Advanced coding, autonomous tool use, long-horizon workflows (Nov 2025)",
    },
    {
      id: "claude-3.5-sonnet",
      label: "Claude 3.5 Sonnet",
      provider: "anthropic",
      family: "sonnet",
      notes: "Balanced performance for general tasks",
    },
    {
      id: "claude-3.5-haiku",
      label: "Claude 3.5 Haiku",
      provider: "anthropic",
      family: "haiku",
      notes: "Fast and efficient for simple tasks",
    },

    // OpenAI Models
    {
      id: "gpt-5.2",
      label: "GPT-5.2",
      provider: "openai",
      family: "gpt-5",
      notes: "Latest: Enhanced intelligence, improved coding, long-context (Dec 2025)",
    },
    {
      id: "gpt-4o",
      label: "GPT-4o",
      provider: "openai",
      family: "gpt-4",
      notes: "Optimized for speed and performance",
    },
    {
      id: "gpt-4-turbo",
      label: "GPT-4 Turbo",
      provider: "openai",
      family: "gpt-4",
      notes: "Enhanced capabilities with larger context window",
    },
  ];
}

