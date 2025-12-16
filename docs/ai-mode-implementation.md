# AI Behavior Modes Implementation

## Frontend Implementation (Complete)

The frontend is fully implemented to display and enforce AI behavior modes.

### Files Created:
1. `src/utils/aiMode.ts` - Utility functions for AI mode checking
2. `src/utils/aiMode.test.ts` - Unit tests for AI mode utilities
3. `src/hooks/useAIModeGuard.ts` - React hook for guarding AI actions

### Files Modified:
1. `src/pages/WorkspacesPage.tsx` - Added AI Mode column to workspace table
2. `src/pages/NodeDetailPage.tsx` - Added AI Mode display next to workspace info

### Features:
- Displays "GOVERNED" (blue) or "GUARDED" (orange) badges
- Shows tooltips with reasons when GUARDED
- Automatically refreshes AI mode after document governance changes
- Provides guard functions for future AI routes to check action permissions

## Backend Implementation Required

The backend needs to implement the following:

### Function: `resolveAIMode(workspaceId)`

**Signature:**
```typescript
function resolveAIMode(workspaceId: string): { mode: "GUARDED" | "GOVERNED", reasons: string[] }
```

**Logic:**
1. Call existing `getWorkspaceReadiness(workspaceId)` function (reuse, do not duplicate)
2. If readiness status is "NOT_READY" → return `{ mode: "GUARDED", reasons: readiness.reasons }`
3. If readiness status is "READY" → return `{ mode: "GOVERNED", reasons: [] }`

**Implementation Notes:**
- Must reuse existing readiness logic, not duplicate it
- Reasons array should be empty when mode is "GOVERNED"
- Reasons array should contain readiness reasons when mode is "GUARDED"

### Endpoint: `GET /api/workspaces/:id/ai-mode`

**Response Format:**
```json
{
  "mode": "GUARDED" | "GOVERNED",
  "reasons": string[]
}
```

**Example Implementation (pseudo-code):**
```javascript
// In your workspace routes file
router.get('/workspaces/:id/ai-mode', async (req, res) => {
  try {
    const { id } = req.params;
    const result = resolveAIMode(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In your workspace service/utils
function resolveAIMode(workspaceId) {
  const readiness = getWorkspaceReadiness(workspaceId);
  
  if (readiness.status === "NOT_READY") {
    return {
      mode: "GUARDED",
      reasons: readiness.reasons
    };
  }
  
  return {
    mode: "GOVERNED",
    reasons: []
  };
}
```

## Guard Function Usage

Future AI routes should use the guard function to check permissions:

```typescript
import { checkGovernedActionAllowed } from '../utils/aiMode';

// In an AI route handler
const error = checkGovernedActionAllowed(aiMode, reasons);
if (error) {
  return { error, blocked: true };
}
// Proceed with action
```

## Behavior Specifications

### GUARDED Mode:
- ✅ Allow: Q&A about existing governed docs, summarization
- ❌ Block: Generate/modify canon artifacts, governance edits, schema changes, workspace/node model changes
- Response when blocked: "Workspace is NOT_READY, govern Workspace Canon and Scope Boundaries to unlock governed actions. Current issues: [reasons]"

### GOVERNED Mode:
- ✅ Allow: Canon updates when user explicitly invokes proper change pathway
- ⚠️ Default: Recommend correct change classification step, do not auto-apply changes

## Testing Checklist

1. **Backend Function:**
   - [ ] `resolveAIMode()` calls `getWorkspaceReadiness()` (reuses logic)
   - [ ] NOT_READY → returns GUARDED with reasons
   - [ ] READY → returns GOVERNED with empty reasons

2. **Backend Endpoint:**
   - [ ] `GET /api/workspaces/:id/ai-mode` returns correct format
   - [ ] Returns GUARDED when workspace is NOT_READY
   - [ ] Returns GOVERNED when workspace is READY

3. **Frontend Display:**
   - [ ] Navigate to `/workspaces` → see AI Mode column
   - [ ] Navigate to `/nodes/:nodeId` → see AI Mode badge
   - [ ] Hover over badges → see tooltips with reasons

4. **Dynamic Updates:**
   - [ ] Govern required documents → AI mode flips to GOVERNED immediately
   - [ ] Ungovern required documents → AI mode flips to GUARDED immediately

5. **Guard Function:**
   - [ ] `checkGovernedActionAllowed("GUARDED", reasons)` returns error message
   - [ ] `checkGovernedActionAllowed("GOVERNED")` returns null (allowed)
   - [ ] Error message includes reasons when provided
