// LLM Provider and Model Registry
// UI-owned, editable defaults for LLM providers and models

export type LlmProviderKey = "openai" | "anthropic" | "google";

export type LlmModel = {
  id: string;
  label: string;
  recommended?: boolean;
  notes?: string;
};

export type LlmProvider = {
  key: LlmProviderKey;
  label: string;
  models: LlmModel[];
};

export const DEFAULT_LLM_PROVIDERS: LlmProvider[] = [
  {
    key: "openai",
    label: "OpenAI",
    models: [
      { id: "gpt-5.2", label: "GPT-5.2", recommended: true },
      { id: "gpt-5.1", label: "GPT-5.1" },
    ],
  },
  {
    key: "anthropic",
    label: "Anthropic",
    models: [
      { id: "claude-opus-4.5", label: "Claude Opus 4.5", recommended: true },
      { id: "claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
    ],
  },
  {
    key: "google",
    label: "Google",
    models: [
      { id: "gemini-3", label: "Gemini 3", recommended: true },
      { id: "gemini-3-pro", label: "Gemini 3 Pro" },
    ],
  },
];

const STORAGE_KEY = "continuum.llmProviders.v1";

/**
 * Load providers from localStorage or return defaults
 */
export function loadProviders(): LlmProvider[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load LLM providers from localStorage", e);
  }
  return DEFAULT_LLM_PROVIDERS;
}

/**
 * Save providers to localStorage
 */
export function saveProviders(providers: LlmProvider[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
  } catch (e) {
    console.error("Failed to save LLM providers to localStorage", e);
  }
}

/**
 * Reset providers to defaults
 */
export function resetProviders(): void {
  saveProviders(DEFAULT_LLM_PROVIDERS);
}







