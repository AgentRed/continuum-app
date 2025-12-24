/**
 * Model Registry Store
 * 
 * Manages persistence of the model registry in localStorage.
 * Provides functions to load, save, and reset the registry.
 */

import { defaultModelRegistry, type ModelDef } from "../config/modelRegistry";

const STORAGE_KEY = "continuum.modelRegistry.v1";

/**
 * Load the model registry from localStorage, or return defaults
 * 
 * @returns Array of model definitions
 */
export function loadRegistry(): ModelDef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ModelDef[];
      // Validate structure
      if (Array.isArray(parsed) && parsed.every((m) => m.id && m.label && m.provider)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error loading model registry from localStorage", err);
  }
  return defaultModelRegistry;
}

/**
 * Save the model registry to localStorage
 * 
 * @param models Array of model definitions to save
 */
export function saveRegistry(models: ModelDef[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  } catch (err) {
    console.error("Error saving model registry to localStorage", err);
    throw new Error("Failed to save model registry");
  }
}

/**
 * Reset the model registry to defaults
 * 
 * @returns The default model registry
 */
export function resetRegistry(): ModelDef[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return defaultModelRegistry;
  } catch (err) {
    console.error("Error resetting model registry", err);
    return defaultModelRegistry;
  }
}

/**
 * Get enabled models, optionally filtered by provider
 * 
 * @param provider Optional provider to filter by
 * @returns Array of enabled model definitions
 */
export function getEnabledModels(provider?: string): ModelDef[] {
  const registry = loadRegistry();
  let models = registry.filter((m) => m.enabled);
  if (provider) {
    models = models.filter((m) => m.provider === provider);
  }
  return models;
}

/**
 * Get all providers that have at least one enabled model
 * 
 * @returns Array of provider IDs
 */
export function getEnabledProviders(): string[] {
  const registry = loadRegistry();
  const providers = new Set<string>();
  registry.filter((m) => m.enabled).forEach((m) => providers.add(m.provider));
  return Array.from(providers).sort();
}










