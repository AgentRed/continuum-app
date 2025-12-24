/**
 * LLM Model Router
 * 
 * This module provides intelligent model selection based on task requirements.
 * It abstracts away provider-specific details and enables Continuum to route
 * tasks to the optimal model for each use case.
 * 
 * Architecture Benefits:
 * - Capability-based routing: Select models based on what they can do, not who makes them
 * - Provider flexibility: Tasks can be routed to any provider without code changes
 * - Optimal performance: Match tasks to models that excel at specific capabilities
 * - Future-proof: New models are automatically available for routing once added to registry
 * 
 * Usage Examples:
 * - Math problems → Gemini (strong math capabilities)
 * - Prose writing → Claude (excellent prose generation)
 * - General reasoning → GPT-5.2 Pro (default, well-rounded)
 * - Fast responses → Models with FAST_RESPONSE capability
 * - Long documents → Models with LONG_CONTEXT capability
 */

import { LLM_MODELS, type LLMModel, Provider, ModelCapability } from "./llmModels";

/**
 * Task request for model selection
 */
export interface ModelSelectionRequest {
  /** Required capabilities for this task */
  desiredCapabilities: ModelCapability[];
  /** Preferred provider (if any) */
  preferredProvider?: Provider;
  /** Whether to allow fallback to other providers if preferred is unavailable */
  fallbackAllowed?: boolean;
}

/**
 * Select the best-fit model for a given task
 * 
 * Selection logic:
 * 1. Filter models that have ALL desired capabilities
 * 2. If preferredProvider is specified, prefer models from that provider
 * 3. If no preferred provider or fallbackAllowed=true, consider all providers
 * 4. Prefer default model if it matches requirements
 * 5. Prefer models with more capabilities (better fit)
 * 6. Prefer models with larger context windows (more versatile)
 * 
 * This ensures tasks are routed to optimal models while maintaining
 * flexibility for provider preferences and fallbacks.
 * 
 * @param request Task requirements and preferences
 * @returns Best-fit model, or null if no suitable model found
 */
export function selectModelForTask(
  request: ModelSelectionRequest
): LLMModel | null {
  const { desiredCapabilities, preferredProvider, fallbackAllowed = true } = request;

  if (desiredCapabilities.length === 0) {
    return getDefaultModel();
  }

  // Filter models that have all desired capabilities
  let candidates = LLM_MODELS.filter((model) =>
    desiredCapabilities.every((cap) => model.capabilities.includes(cap))
  );

  if (candidates.length === 0) {
    // No model has all capabilities, try to find models with at least some
    candidates = LLM_MODELS.filter((model) =>
      desiredCapabilities.some((cap) => model.capabilities.includes(cap))
    );
  }

  if (candidates.length === 0) {
    return getDefaultModel();
  }

  // If preferred provider is specified, prioritize those models
  if (preferredProvider) {
    const preferredCandidates = candidates.filter(
      (model) => model.provider === preferredProvider
    );

    if (preferredCandidates.length > 0) {
      candidates = preferredCandidates;
    } else if (!fallbackAllowed) {
      // Preferred provider required but no matches, return null
      return null;
    }
    // If fallbackAllowed, continue with all candidates
  }

  // Score candidates:
  // 1. Prefer default model if it matches
  // 2. Prefer models with more capabilities (better fit)
  // 3. Prefer models with larger context windows
  candidates.sort((a, b) => {
    // Default model gets highest priority
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;

    // More capabilities = better fit
    const aCapabilityCount = a.capabilities.length;
    const bCapabilityCount = b.capabilities.length;
    if (aCapabilityCount !== bCapabilityCount) {
      return bCapabilityCount - aCapabilityCount;
    }

    // Larger context window = more versatile
    const aContext = a.contextWindowTokens || 0;
    const bContext = b.contextWindowTokens || 0;
    return bContext - aContext;
  });

  return candidates[0];
}

/**
 * Get the default model for general tasks
 * 
 * The default model is used when no specific capabilities are required
 * or when the task doesn't benefit from specialized routing.
 * 
 * @returns Default LLM model
 */
export function getDefaultModel(): LLMModel {
  const defaultModel = LLM_MODELS.find((model) => model.isDefault);
  if (!defaultModel) {
    throw new Error("No default model configured in LLM_MODELS registry");
  }
  return defaultModel;
}

/**
 * Get all models from a specific provider
 * 
 * Useful for provider-specific operations, UI filtering, or when
 * you need to list available models from a single provider.
 * 
 * @param provider Provider to filter by
 * @returns Array of models from the specified provider
 */
export function getModelsByProvider(provider: Provider): LLMModel[] {
  return LLM_MODELS.filter((model) => model.provider === provider);
}

/**
 * Get all models that support a specific capability
 * 
 * Useful for discovering which models can handle a particular task type.
 * 
 * @param capability Capability to filter by
 * @returns Array of models that support the capability
 */
export function getModelsByCapability(capability: ModelCapability): LLMModel[] {
  return LLM_MODELS.filter((model) => model.capabilities.includes(capability));
}










