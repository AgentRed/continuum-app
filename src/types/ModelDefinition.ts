/**
 * Model Definition Type
 * 
 * Represents a single LLM model with its capabilities and metadata.
 */
import type { ModelProviderId } from "./ModelProvider";

export type ModelStatus = "active" | "deprecated" | "experimental";

export interface ModelDefinition {
  id: string; // Stable internal ID, e.g., "openai:gpt-5.2-thinking"
  providerId: ModelProviderId;
  displayName: string; // Human-friendly name
  apiModelName?: string; // What we send to provider, if applicable
  capabilities: string[]; // e.g., ["chat", "reasoning", "vision", "tools"]
  status: ModelStatus;
  notes?: string;
}





