export type WorkspaceReadinessStatus = "READY" | "NOT_READY";

export type WorkspaceReadinessResponse = {
  status: WorkspaceReadinessStatus;
  reasons: string[];
};

/**
 * Fetches workspace readiness status from the backend.
 *
 * Source of truth is GET /api/workspaces/:id, which already includes
 * readiness, aiMode and readinessReasons.
 */
export async function fetchWorkspaceReadiness(
  apiBase: string,
  workspaceId: string
): Promise<WorkspaceReadinessResponse> {
  try {
    const res = await fetch(`${apiBase}/api/workspaces/${workspaceId}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as {
      readiness?: WorkspaceReadinessStatus;
      readinessReasons?: string[];
    };

    return {
      status: data.readiness ?? "NOT_READY",
      reasons: data.readiness === "READY" ? [] : data.readinessReasons ?? [],
    };
  } catch (err: any) {
    console.error("Error fetching workspace readiness", err);
    return {
      status: "NOT_READY",
      reasons: [err?.message || "Failed to check readiness"],
    };
  }
}
