import { useState, useEffect } from "react";
import { fetchAIMode, checkGovernedActionAllowed, type AIMode } from "../utils/aiMode";

/**
 * Hook to get AI mode and check if governed actions are allowed.
 * Use this in components that need to guard AI actions.
 */
export function useAIModeGuard(apiBase: string, workspaceId: string | null) {
  const [aiMode, setAiMode] = useState<AIMode | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setAiMode(null);
      setReasons([]);
      return;
    }

    const fetchMode = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAIMode(apiBase, workspaceId);
        setAiMode(response.mode);
        setReasons(response.reasons);
      } catch (err: any) {
        console.error("Error fetching AI mode", err);
        setError(err?.message || "Failed to fetch AI mode");
        // Default to GUARDED on error
        setAiMode("GUARDED");
        setReasons(["Failed to check AI mode"]);
      } finally {
        setLoading(false);
      }
    };

    fetchMode();
  }, [apiBase, workspaceId]);

  const checkAction = (action?: string) => {
    if (!aiMode) {
      return "AI mode not yet loaded";
    }
    return checkGovernedActionAllowed(aiMode, reasons);
  };

  const isGoverned = aiMode === "GOVERNED";
  const isGuarded = aiMode === "GUARDED";

  return {
    aiMode,
    reasons,
    loading,
    error,
    checkAction,
    isGoverned,
    isGuarded,
  };
}
