# Workspace Readiness Implementation

## Frontend Implementation (Complete)

The frontend is fully implemented to display workspace readiness status.

### Files Modified:
1. `src/utils/workspaceReadiness.ts` - Utility function to fetch readiness from backend
2. `src/pages/WorkspacesPage.tsx` - Added readiness status column to workspace table
3. `src/pages/NodeDetailPage.tsx` - Added readiness status badge next to workspace name

### Features:
- Displays "READY" (green) or "NOT READY" (yellow) badges
- Shows tooltips with reasons when NOT READY
- Automatically refreshes readiness after document governance changes
- Handles missing backend endpoint gracefully (shows "NOT READY" with helpful message)

## Backend Implementation Required

The backend needs to implement the following endpoint:

### Endpoint: `GET /api/workspaces/:id/readiness`

**Response Format:**
```json
{
  "status": "READY" | "NOT_READY",
  "reasons": string[]
}
```

**Readiness Logic:**
A Workspace is READY if and only if:
1. **Workspace Canon** (or **Workspace-Canon-Template**) exists AND is GOVERNED
   - Document title must be exactly: `Workspace-Canon-Template.md` OR `Workspace Canon.md`
   - `isGovernance` field must be `true`
2. **Workspace Scope Boundaries** exists AND is GOVERNED
   - Document title must be exactly: `Workspace Scope Boundaries.md`
   - `isGovernance` field must be `true`

**Implementation Notes:**
- Check documents across all nodes in the workspace
- Return empty `reasons` array when status is "READY"
- Return specific reasons when "NOT READY", e.g.:
  - `["Workspace Canon missing"]`
  - `["Workspace Canon not governed"]`
  - `["Workspace Scope Boundaries missing"]`
  - `["Workspace Scope Boundaries not governed"]`

**Example Implementation (pseudo-code):**
```javascript
// Find all documents in workspace (across all nodes)
const workspaceDocuments = await findDocumentsByWorkspace(workspaceId);

// Check for Workspace Canon
const workspaceCanon = workspaceDocuments.find(
  doc => doc.title === "Workspace-Canon-Template.md" || doc.title === "Workspace Canon.md"
);
const hasGovernedCanon = workspaceCanon && workspaceCanon.isGovernance === true;

// Check for Workspace Scope Boundaries
const scopeBoundaries = workspaceDocuments.find(
  doc => doc.title === "Workspace Scope Boundaries.md"
);
const hasGovernedScope = scopeBoundaries && scopeBoundaries.isGovernance === true;

// Build reasons
const reasons = [];
if (!workspaceCanon) {
  reasons.push("Workspace Canon missing");
} else if (!workspaceCanon.isGovernance) {
  reasons.push("Workspace Canon not governed");
}
if (!scopeBoundaries) {
  reasons.push("Workspace Scope Boundaries missing");
} else if (!scopeBoundaries.isGovernance) {
  reasons.push("Workspace Scope Boundaries not governed");
}

return {
  status: reasons.length === 0 ? "READY" : "NOT_READY",
  reasons
};
```

## Testing Checklist

1. **Backend Endpoint:**
   - [ ] Implement `GET /api/workspaces/:id/readiness`
   - [ ] Test with workspace that has both required documents governed → returns READY
   - [ ] Test with missing documents → returns NOT_READY with reasons
   - [ ] Test with ungoverned documents → returns NOT_READY with reasons

2. **Frontend Display:**
   - [ ] Navigate to `/workspaces` → see readiness status in table
   - [ ] Navigate to `/nodes/:nodeId` → see readiness status next to workspace name
   - [ ] Hover over NOT READY badge → see reasons in tooltip

3. **Dynamic Updates:**
   - [ ] Govern "Workspace-Canon-Template.md" → readiness should update to READY
   - [ ] Ungovern "Workspace-Canon-Template.md" → readiness should update to NOT READY
   - [ ] Govern "Workspace Scope Boundaries.md" → readiness should update to READY

## Document Title Matching

The backend should match document titles exactly (case-sensitive):
- `Workspace-Canon-Template.md` OR `Workspace Canon.md` (for Workspace Canon)
- `Workspace Scope Boundaries.md` (for Scope Boundaries)
