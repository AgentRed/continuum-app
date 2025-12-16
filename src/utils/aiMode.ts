export type AIMode = "GUARDED" | "GOVERNED";

export type AIModeResponse = {
  mode: AIMode;
  reasons: string[];
};

/**
 * Fetches AI mode for a workspace from the backend.
 * @param apiBase - Base URL for the API
 * @param workspaceId - ID of the workspace
 * @returns AI mode and reasons
 */
export async function fetchAIMode(
  apiBase: string,
  workspaceId: string
): Promise<AIModeResponse> {
  try {
    const res = await fetch(`${apiBase}/api/workspaces/${workspaceId}/ai-mode`);
    
    if (!res.ok) {
      // If endpoint doesn't exist yet, return GUARDED with a helpful message
      if (res.status === 404) {
        return {
          mode: "GUARDED",
          reasons: ["AI mode endpoint not yet implemented"],
        };
      }
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = (await res.json()) as AIModeResponse;
    return data;
  } catch (err: any) {
    console.error("Error fetching AI mode", err);
    return {
      mode: "GUARDED",
      reasons: [err?.message || "Failed to check AI mode"],
    };
  }
}

/**
 * Guard function to check if an action requiring governance is allowed.
 * Returns null if allowed, or an error message if blocked.
 * @param aiMode - Current AI mode
 * @param reasons - Readiness reasons (if GUARDED mode)
 * @returns Error message if blocked, null if allowed
 */
export function checkGovernedActionAllowed(
  aiMode: AIMode,
  reasons: string[] = []
): string | null {
  if (aiMode === "GUARDED") {
    const baseMessage = "Workspace is NOT_READY, govern Workspace Canon and Scope Boundaries to unlock governed actions.";
    if (reasons.length > 0) {
      return `${baseMessage} Current issues: ${reasons.join(", ")}`;
    }
    return baseMessage;
  }
  return null;
}

/**
 * Actions that require governance (canon artifacts, governance edits, schema changes, etc.)
 */
export const GOVERNED_ACTIONS = {
  CREATE_CANON_DOC: "create_canon_doc",
  MODIFY_CANON_DOC: "modify_canon_doc",
  GOVERNANCE_EDIT: "governance_edit",
  SCHEMA_CHANGE: "schema_change",
  WORKSPACE_MODEL_CHANGE: "workspace_model_change",
  NODE_MODEL_CHANGE: "node_model_change",
} as const;

export type GovernedAction = typeof GOVERNED_ACTIONS[keyof typeof GOVERNED_ACTIONS];

/**
 * Check if a specific governed action is allowed.
 * @param aiMode - Current AI mode
 * @param action - The action to check
 * @param reasons - Readiness reasons (if GUARDED mode)
 * @returns Error message if blocked, null if allowed
 */
export function checkActionAllowed(
  aiMode: AIMode,
  action: GovernedAction,
  reasons: string[] = []
): string | null {
  return checkGovernedActionAllowed(aiMode, reasons);
}
