# AI Mode Backend Implementation

## Overview

AI Mode is computed server-side from Workspace Readiness and Workspace Canon governance state. It is included directly in the Workspace API response, not as a separate endpoint.

## AI Mode Derivation Rules

Three modes are defined:
- **GUARDED**: Most restrictive, default fail-safe
- **ADVISORY**: Intermediate, allows recommendations but not governed actions
- **OPERATIONAL**: Full capabilities when workspace is ready and canon is governed

### Derivation Logic

```typescript
function resolveAIMode(workspace: Workspace, workspaceCanonDoc: Document | null): "GUARDED" | "ADVISORY" | "OPERATIONAL" {
  // Rule A: If workspace.readiness === "NOT_READY" => GUARDED
  if (workspace.readiness === "NOT_READY") {
    return "GUARDED";
  }

  // Rule B: If readiness === "READY" and Workspace Canon exists but NOT governed => ADVISORY
  if (workspace.readiness === "READY") {
    if (!workspaceCanonDoc) {
      // Canon missing but workspace is ready (edge case) => default to GUARDED
      console.warn(`Workspace ${workspace.id} is READY but Workspace Canon is missing, defaulting to GUARDED`);
      return "GUARDED";
    }
    
    if (!workspaceCanonDoc.isGovernance) {
      return "ADVISORY";
    }
    
    // Rule C: If readiness === "READY" and Workspace Canon exists and IS governed => OPERATIONAL
    if (workspaceCanonDoc.isGovernance) {
      return "OPERATIONAL";
    }
  }

  // Fail-safe default
  console.warn(`Could not determine AI mode for workspace ${workspace.id}, defaulting to GUARDED`);
  return "GUARDED";
}
```

## Implementation Steps

### 1. Create Service Function

Create or update a workspace service file:

```typescript
// services/workspaceService.ts or similar

import { getWorkspaceReadiness } from './readinessService'; // Reuse existing function

/**
 * Resolves AI mode for a workspace based on readiness and canon governance.
 * Fail-safe: defaults to GUARDED on any uncertainty.
 */
export async function resolveAIMode(workspaceId: string): Promise<"GUARDED" | "ADVISORY" | "OPERATIONAL"> {
  try {
    // Get workspace readiness (reuse existing function)
    const readiness = await getWorkspaceReadiness(workspaceId);
    
    // Rule A: NOT_READY => GUARDED
    if (readiness.status === "NOT_READY") {
      return "GUARDED";
    }

    // Find Workspace Canon document
    // Check for: "Workspace-Canon-Template.md" OR "Workspace Canon.md"
    const workspaceCanonDoc = await findWorkspaceCanonDocument(workspaceId);
    
    if (!workspaceCanonDoc) {
      // Edge case: READY but no canon doc => default to GUARDED
      console.warn(`Workspace ${workspaceId} is READY but Workspace Canon is missing, defaulting to GUARDED`);
      return "GUARDED";
    }

    // Rule B: READY + canon exists but NOT governed => ADVISORY
    if (!workspaceCanonDoc.isGovernance) {
      return "ADVISORY";
    }

    // Rule C: READY + canon exists and IS governed => OPERATIONAL
    return "OPERATIONAL";
  } catch (error) {
    console.error(`Error resolving AI mode for workspace ${workspaceId}:`, error);
    // Fail-safe: default to GUARDED
    return "GUARDED";
  }
}

/**
 * Finds the Workspace Canon document in a workspace.
 * Checks for "Workspace-Canon-Template.md" or "Workspace Canon.md" across all nodes.
 */
async function findWorkspaceCanonDocument(workspaceId: string): Promise<Document | null> {
  // Implementation depends on your data access layer
  // Example: query documents across all nodes in the workspace
  const nodes = await getNodesByWorkspace(workspaceId);
  for (const node of nodes) {
    const documents = await getDocumentsByNode(node.id);
    const canonDoc = documents.find(
      doc => doc.title === "Workspace-Canon-Template.md" || doc.title === "Workspace Canon.md"
    );
    if (canonDoc) {
      return canonDoc;
    }
  }
  return null;
}
```

### 2. Update Workspace API Response

Modify the workspace GET endpoint to include `aiMode`:

```typescript
// routes/workspaces.ts or similar

router.get('/workspaces', async (req, res) => {
  try {
    const workspaces = await getAllWorkspaces();
    
    // Enrich each workspace with readiness and aiMode
    const enrichedWorkspaces = await Promise.all(
      workspaces.map(async (workspace) => {
        const readiness = await getWorkspaceReadiness(workspace.id);
        const aiMode = await resolveAIMode(workspace.id);
        
        return {
          ...workspace,
          readiness: readiness.status, // "READY" | "NOT_READY"
          aiMode, // "GUARDED" | "ADVISORY" | "OPERATIONAL"
        };
      })
    );
    
    res.json(enrichedWorkspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workspaces/:id', async (req, res) => {
  try {
    const workspace = await getWorkspaceById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    
    const readiness = await getWorkspaceReadiness(workspace.id);
    const aiMode = await resolveAIMode(workspace.id);
    
    res.json({
      ...workspace,
      readiness: readiness.status,
      aiMode,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Update Node API Response

Ensure node responses include workspace with `readiness` and `aiMode`:

```typescript
router.get('/nodes/:id', async (req, res) => {
  try {
    const node = await getNodeById(req.params.id);
    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }
    
    // Include workspace with readiness and aiMode
    const workspace = await getWorkspaceById(node.workspaceId);
    const readiness = await getWorkspaceReadiness(workspace.id);
    const aiMode = await resolveAIMode(workspace.id);
    
    res.json({
      ...node,
      workspace: {
        ...workspace,
        readiness: readiness.status,
        aiMode,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Testing

### Unit Tests for `resolveAIMode`

```typescript
describe('resolveAIMode', () => {
  it('should return GUARDED when readiness is NOT_READY', async () => {
    const mockReadiness = { status: "NOT_READY", reasons: ["Workspace Canon missing"] };
    const result = await resolveAIMode("workspace-1");
    expect(result).toBe("GUARDED");
  });

  it('should return ADVISORY when READY and canon exists but not governed', async () => {
    const mockReadiness = { status: "READY", reasons: [] };
    const mockCanonDoc = { id: "doc-1", title: "Workspace-Canon-Template.md", isGovernance: false };
    const result = await resolveAIMode("workspace-1");
    expect(result).toBe("ADVISORY");
  });

  it('should return OPERATIONAL when READY and canon exists and is governed', async () => {
    const mockReadiness = { status: "READY", reasons: [] };
    const mockCanonDoc = { id: "doc-1", title: "Workspace-Canon-Template.md", isGovernance: true };
    const result = await resolveAIMode("workspace-1");
    expect(result).toBe("OPERATIONAL");
  });

  it('should default to GUARDED on error', async () => {
    // Mock error scenario
    const result = await resolveAIMode("invalid-workspace");
    expect(result).toBe("GUARDED");
  });
});
```

### Test Commands

```bash
# Run backend tests
npm test -- resolveAIMode

# Or if using a different test runner
yarn test resolveAIMode
```

## Response Format

Workspace API responses should include:

```json
{
  "id": "workspace-123",
  "name": "My Workspace",
  "readiness": "READY",
  "aiMode": "OPERATIONAL",
  ...
}
```

Node API responses should include workspace with these fields:

```json
{
  "id": "node-456",
  "name": "My Node",
  "workspace": {
    "id": "workspace-123",
    "name": "My Workspace",
    "readiness": "READY",
    "aiMode": "OPERATIONAL"
  },
  ...
}
```

## Important Notes

1. **Fail-safe default**: Always default to `GUARDED` on any uncertainty or error
2. **Reuse existing logic**: Call `getWorkspaceReadiness()` - do not duplicate readiness rules
3. **No storage**: `aiMode` is computed dynamically, never stored in the database
4. **No user control**: `aiMode` cannot be manually set or edited by users
5. **Document matching**: Check for both "Workspace-Canon-Template.md" and "Workspace Canon.md" (exact title match, case-sensitive)
