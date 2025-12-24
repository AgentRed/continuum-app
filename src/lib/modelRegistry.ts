/**
 * Model Registry
 * 
 * Provides utilities for accessing and filtering LLM models by provider.
 * This abstraction allows the UI to work with models without hardcoding
 * provider-specific logic.
 */

import { getDefaultModels, type LlmModel, type ProviderId } from "../config/llmModels";

let cachedModels: LlmModel[] | null = null;

/**
 * Get all available models
 */
function getAllModels(): LlmModel[] {
  if (!cachedModels) {
    cachedModels = getDefaultModels();
  }
  return cachedModels;
}

/**
 * List all available providers
 * 
 * @returns Array of unique provider IDs
 */
export function listProviders(): ProviderId[] {
  const models = getAllModels();
  const providers = new Set<ProviderId>();
  models.forEach((model) => providers.add(model.provider));
  return Array.from(providers).sort();
}

/**
 * List models, optionally filtered by provider
 * 
 * @param provider Optional provider to filter by
 * @returns Array of models, filtered by provider if specified
 */
export function listModels(provider?: ProviderId): LlmModel[] {
  const models = getAllModels();
  if (!provider) {
    return models;
  }
  return models.filter((model) => model.provider === provider);
}

/**
 * Get the default model for a provider, or the global default
 * 
 * Selection logic:
 * 1. If provider is specified, find the default model for that provider
 * 2. If no provider default, return the first model for that provider
 * 3. If no provider specified, return the global default (isDefault: true)
 * 4. If no global default, return the first model in the list
 * 
 * @param provider Optional provider to get default model for
 * @returns Default model, or first model if no default is set
 */
export function getDefaultModel(provider?: ProviderId): LlmModel {
  const models = getAllModels();

  if (provider) {
    // Find default for specific provider
    const providerModels = models.filter((model) => model.provider === provider);
    const providerDefault = providerModels.find((model) => model.isDefault);
    if (providerDefault) {
      return providerDefault;
    }
    // No default for provider, return first model
    if (providerModels.length > 0) {
      return providerModels[0];
    }
  }

  // Find global default
  const globalDefault = models.find((model) => model.isDefault);
  if (globalDefault) {
    return globalDefault;
  }

  // Fallback to first model
  if (models.length > 0) {
    return models[0];
  }

  throw new Error("No models available in registry");
}

/**
 * Get a model by ID
 * 
 * @param id Model ID
 * @returns Model if found, null otherwise
 */
export function getModelById(id: string): LlmModel | null {
  const models = getAllModels();
  return models.find((model) => model.id === id) || null;
}










