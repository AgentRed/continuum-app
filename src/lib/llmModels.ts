/**
 * LLM Model Registry
 * 
 * This module serves as the single source of truth for all LLM models
 * available in Continuum. It provides a provider-agnostic abstraction
 * that enables seamless switching between different LLM providers without
 * losing context or requiring code changes throughout the application.
 * 
 * Architecture Benefits:
 * - Centralized model definitions prevent hardcoding model IDs elsewhere
 * - Capability-based selection allows routing tasks to optimal models
 * - Provider abstraction enables multi-provider workflows (e.g., Gemini for math,
 *   Claude for prose, GPT for general reasoning)
 * - Future-proof: new models can be added without refactoring existing code
 */

/**
 * Supported LLM providers in Continuum
 */
export enum Provider {
  OPENAI = "OPENAI",
  GOOGLE = "GOOGLE",
  ANTHROPIC = "ANTHROPIC",
}

/**
 * Model capabilities that can be used for task routing
 * 
 * These capabilities enable Continuum to select the optimal model for each task:
 * - GENERAL_REASONING: Standard reasoning and problem-solving
 * - DEEP_REASONING: Complex multi-step reasoning, planning, analysis
 * - CODE: Code generation, review, debugging, refactoring
 * - MATH: Mathematical problem-solving, calculations, proofs
 * - PROSE: High-quality writing, editing, creative content
 * - LONG_CONTEXT: Handles very long context windows (100k+ tokens)
 * - FAST_RESPONSE: Optimized for low latency, quick responses
 * - MULTIMODAL: Supports images, audio, video inputs
 */
export enum ModelCapability {
  GENERAL_REASONING = "GENERAL_REASONING",
  DEEP_REASONING = "DEEP_REASONING",
  CODE = "CODE",
  MATH = "MATH",
  PROSE = "PROSE",
  LONG_CONTEXT = "LONG_CONTEXT",
  FAST_RESPONSE = "FAST_RESPONSE",
  MULTIMODAL = "MULTIMODAL",
}

/**
 * LLM Model definition
 * 
 * Represents a single LLM model with its capabilities and metadata.
 * This interface is provider-agnostic, allowing Continuum to work with
 * models from any provider without coupling to provider-specific details.
 */
export interface LLMModel {
  /** Unique identifier for the model (e.g., "gpt-5.2-pro") */
  id: string;
  /** Provider that hosts this model */
  provider: Provider;
  /** Human-readable display name */
  displayName: string;
  /** Capabilities this model supports */
  capabilities: ModelCapability[];
  /** Maximum context window size in tokens (if known) */
  contextWindowTokens?: number;
  /** Additional notes about the model */
  notes?: string;
  /** Whether this is the default model for general tasks */
  isDefault?: boolean;
}

/**
 * Registry of all available LLM models in Continuum
 * 
 * This is the single source of truth for model definitions.
 * All model selection and routing logic should reference this registry.
 * 
 * Future-proofing: New models can be added here without requiring
 * changes to routing logic or UI components.
 */
export const LLM_MODELS: LLMModel[] = [
  // OpenAI Models
  {
    id: "gpt-5.2-pro",
    provider: Provider.OPENAI,
    displayName: "GPT-5.2 Pro",
    capabilities: [
      ModelCapability.GENERAL_REASONING,
      ModelCapability.DEEP_REASONING,
      ModelCapability.CODE,
      ModelCapability.PROSE,
      ModelCapability.LONG_CONTEXT,
    ],
    contextWindowTokens: 200000,
    notes: "Flagship reasoning, planning, coding, long-context",
    isDefault: true, // Default model for general tasks
  },
  {
    id: "gpt-5.2-thinking",
    provider: Provider.OPENAI,
    displayName: "GPT-5.2 Thinking",
    capabilities: [
      ModelCapability.DEEP_REASONING,
      ModelCapability.CODE,
      ModelCapability.MATH,
      ModelCapability.LONG_CONTEXT,
    ],
    contextWindowTokens: 200000,
    notes: "Flagship reasoning, planning, coding, long-context",
  },
  {
    id: "gpt-5.2-instant",
    provider: Provider.OPENAI,
    displayName: "GPT-5.2 Instant",
    capabilities: [
      ModelCapability.GENERAL_REASONING,
      ModelCapability.CODE,
      ModelCapability.FAST_RESPONSE,
    ],
    contextWindowTokens: 128000,
    notes: "Flagship reasoning, planning, coding, long-context",
  },

  // Google Gemini Models
  {
    id: "gemini-3-pro",
    provider: Provider.GOOGLE,
    displayName: "Gemini 3 Pro",
    capabilities: [
      ModelCapability.GENERAL_REASONING,
      ModelCapability.MATH,
      ModelCapability.PROSE,
      ModelCapability.LONG_CONTEXT,
      ModelCapability.MULTIMODAL,
    ],
    contextWindowTokens: 1000000,
    notes: "Strong math, long-context, multimodal, speed variants",
  },
  {
    id: "gemini-3-flash",
    provider: Provider.GOOGLE,
    displayName: "Gemini 3 Flash",
    capabilities: [
      ModelCapability.GENERAL_REASONING,
      ModelCapability.MATH,
      ModelCapability.FAST_RESPONSE,
      ModelCapability.MULTIMODAL,
    ],
    contextWindowTokens: 1000000,
    notes: "Strong math, long-context, multimodal, speed variants",
  },
  {
    id: "gemini-3-deepthink",
    provider: Provider.GOOGLE,
    displayName: "Gemini 3 DeepThink",
    capabilities: [
      ModelCapability.DEEP_REASONING,
      ModelCapability.MATH,
      ModelCapability.LONG_CONTEXT,
    ],
    contextWindowTokens: 1000000,
    notes: "Strong math, long-context, multimodal, speed variants",
  },

  // Anthropic Claude Models
  {
    id: "claude-opus-4.5",
    provider: Provider.ANTHROPIC,
    displayName: "Claude Opus 4.5",
    capabilities: [
      ModelCapability.GENERAL_REASONING,
      ModelCapability.DEEP_REASONING,
      ModelCapability.PROSE,
      ModelCapability.LONG_CONTEXT,
    ],
    contextWindowTokens: 200000,
    notes: "Strong prose, reasoning, alignment, efficient variants",
  },
  {
    id: "claude-sonnet-4.5",
    provider: Provider.ANTHROPIC,
    displayName: "Claude Sonnet 4.5",
    capabilities: [
      ModelCapability.GENERAL_REASONING,
      ModelCapability.PROSE,
      ModelCapability.CODE,
      ModelCapability.LONG_CONTEXT,
    ],
    contextWindowTokens: 200000,
    notes: "Strong prose, reasoning, alignment, efficient variants",
  },
  {
    id: "claude-haiku-4.5",
    provider: Provider.ANTHROPIC,
    displayName: "Claude Haiku 4.5",
    capabilities: [
      ModelCapability.GENERAL_REASONING,
      ModelCapability.PROSE,
      ModelCapability.FAST_RESPONSE,
    ],
    contextWindowTokens: 200000,
    notes: "Strong prose, reasoning, alignment, efficient variants",
  },
];










