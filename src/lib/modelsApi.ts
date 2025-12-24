/**
 * Models API
 * 
 * Handles communication with continuum-core /api/models endpoints
 */

export interface ModelDef {
  id: string;
  label: string;
  provider: "openai" | "anthropic" | "google";
  family?: string;
  notes?: string;
  enabled: boolean;
}

/**
 * Get all models from core
 */
export async function getModels(API_BASE: string): Promise<ModelDef[]> {
  const response = await fetch(`${API_BASE}/api/models`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch models: ${response.status} ${errorText}`);
  }
  return response.json();
}

/**
 * Update models (partial update)
 */
export async function updateModels(
  API_BASE: string,
  updates: Partial<ModelDef>[]
): Promise<ModelDef[]> {
  const response = await fetch(`${API_BASE}/api/models`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update models: ${response.status} ${errorText}`);
  }
  return response.json();
}

/**
 * Reset models to defaults
 */
export async function resetModels(API_BASE: string): Promise<ModelDef[]> {
  const response = await fetch(`${API_BASE}/api/models/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to reset models: ${response.status} ${errorText}`);
  }
  return response.json();
}









