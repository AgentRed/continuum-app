/**
 * Model Registry Loader
 * 
 * Loads model registry from:
 * 1. Canonical document "continuum-llm-model-registry.md" (preferred)
 * 2. Local JSON fallback: src/content/modelRegistry.default.json
 */

import type { ModelProvider } from "../types/ModelProvider";
import type { ModelDefinition } from "../types/ModelDefinition";

export interface ModelRegistry {
  providers: ModelProvider[];
  models: ModelDefinition[];
}

let cachedRegistry: ModelRegistry | null = null;
let registrySource: "canonical" | "local" | null = null;
let registryError: string | null = null;

/**
 * Extract JSON from markdown fenced code block
 */
function extractJsonFromMarkdown(markdown: string): ModelRegistry | null {
  // Look for first ```json block
  const jsonBlockMatch = markdown.match(/```json\s*([\s\S]*?)```/);
  if (!jsonBlockMatch) {
    return null;
  }

  try {
    const json = JSON.parse(jsonBlockMatch[1].trim());
    if (json.providers && json.models) {
      return json as ModelRegistry;
    }
  } catch (err) {
    console.error("Failed to parse JSON from markdown:", err);
  }

  return null;
}

/**
 * Load registry from canonical document
 */
async function loadFromCanonical(API_BASE: string): Promise<ModelRegistry | null> {
  try {
    // First, try to find the canonical document
    const listRes = await fetch(`${API_BASE}/api/canonical-documents`);
    if (!listRes.ok) {
      return null;
    }

    const documents = await listRes.json();
    const registryDoc = documents.find(
      (doc: any) => doc.key === "continuum-llm-model-registry.md"
    );

    if (!registryDoc) {
      return null;
    }

    // Fetch the document content
    const contentRes = await fetch(`${API_BASE}/api/canonical-documents/${registryDoc.id}`);
    if (!contentRes.ok) {
      return null;
    }

    const docData = await contentRes.json();
    const markdown = docData.content || "";

    const registry = extractJsonFromMarkdown(markdown);
    if (registry) {
      registrySource = "canonical";
      return registry;
    }
  } catch (err) {
    console.error("Error loading canonical registry:", err);
  }

  return null;
}

// Import default registry statically
import defaultRegistryData from "../content/modelRegistry.default.json";

/**
 * Load registry from local JSON fallback
 */
async function loadFromLocal(): Promise<ModelRegistry | null> {
  try {
    registrySource = "local";
    return defaultRegistryData as ModelRegistry;
  } catch (err) {
    console.error("Error loading local registry:", err);
    return null;
  }
}

/**
 * Load model registry
 * 
 * Tries canonical document first, falls back to local JSON.
 * Returns cached result if already loaded.
 */
export async function loadModelRegistry(API_BASE: string): Promise<{
  registry: ModelRegistry;
  source: "canonical" | "local";
  error: string | null;
}> {
  // Return cached if available
  if (cachedRegistry && registrySource) {
    return {
      registry: cachedRegistry,
      source: registrySource,
      error: registryError,
    };
  }

  registryError = null;

  // Try canonical first
  const canonicalRegistry = await loadFromCanonical(API_BASE);
  if (canonicalRegistry) {
    cachedRegistry = canonicalRegistry;
    return {
      registry: canonicalRegistry,
      source: "canonical",
      error: null,
    };
  }

  // Fall back to local
  const localRegistry = await loadFromLocal();
  if (localRegistry) {
    cachedRegistry = localRegistry;
    registryError = "Using local default registry. Add canonical document 'continuum-llm-model-registry.md' to manage in Continuum.";
    return {
      registry: localRegistry,
      source: "local",
      error: registryError,
    };
  }

  // Both failed - return empty registry with error
  registryError = "Failed to load model registry from both canonical document and local fallback.";
  const emptyRegistry: ModelRegistry = {
    providers: [],
    models: [],
  };
  cachedRegistry = emptyRegistry;
  return {
    registry: emptyRegistry,
    source: "local",
    error: registryError,
  };
}

/**
 * Clear cached registry (useful for testing or reloading)
 */
export function clearModelRegistryCache(): void {
  cachedRegistry = null;
  registrySource = null;
  registryError = null;
}

