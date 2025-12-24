/**
 * Icon Registry - Centralized icon definitions for Continuum
 * 
 * AUDIT NOTES:
 * 
 * Navigation Section Icons (must be unique per section):
 * - Overview: IconLayoutDashboard (App.tsx:424)
 * - Chat: IconMessageCircle (App.tsx:459) - DUPLICATE with Conversations
 * - Conversations: IconMessageCircle (App.tsx:493) - DUPLICATE with Chat
 * - About: IconInfoCircle (App.tsx:527)
 * - Glossary: IconBook (App.tsx:561)
 * - Workspaces: IconBox (App.tsx:632) - DUPLICATE with Nodes
 * - Nodes: IconBox (App.tsx:666) - DUPLICATE with Workspaces
 * - Documents: IconFileText (App.tsx:737) - DUPLICATE with Canonical Docs
 * - Canonical Docs: IconFileText (App.tsx:771) - DUPLICATE with Documents
 * - Continuum Governance: IconShield (App.tsx:842) - DUPLICATE with Workspace Governance
 * - Workspace Governance: IconShield (App.tsx:876) - DUPLICATE with Continuum Governance
 * - Proposals: IconSend (App.tsx:910)
 * - Models: IconBrain (App.tsx:960)
 * - Settings: IconSettings (App.tsx:994)
 * 
 * Action Icons (verbs, can be reused):
 * - Edit: IconEdit (GlossaryPage.tsx, AboutPage.tsx, EditorSpikePage.tsx)
 * - Save: IconDeviceFloppy (not found, using IconCheck as alternative)
 * - Cancel: IconX (not found in audit, but available)
 * - Refresh: IconRefresh (multiple files)
 * - Approve: IconCircleCheck (DocumentHealthIndicator.tsx)
 * - Reject: IconCircleX (not found in audit, but available)
 * - Apply: IconBolt (not found in audit, but available)
 * - Plus/Add: IconPlus (multiple files)
 * - Trash/Delete: IconTrash (SettingsPage.tsx)
 * - Send: IconSend (multiple chat files)
 * - ArrowLeft: IconArrowLeft (NodeDetailPage.tsx)
 * - ArrowUpRight: IconArrowUpRight (WorkspaceGovernancePage.tsx, ContinuumGovernancePage.tsx)
 * - AlertTriangle: IconAlertTriangle (ErrorBoundary.tsx, ContentAuditPage.tsx, DocumentHealthIndicator.tsx)
 * - Eye: IconEye (EditorSpikePage.tsx)
 * - Minus: IconMinus (FontSizeControl.tsx)
 * - LetterA: IconLetterA (FontSizeControl.tsx)
 * - Circle: IconCircle (DocumentHealthIndicator.tsx, DevelopmentPlanPage.tsx)
 * - Check: IconCheck (DevelopmentPlanPage.tsx)
 * 
 * Semantic Rules:
 * - Section icons represent navigation sections only - each section must have a unique icon
 * - Action icons represent verbs only - can be reused across different contexts
 * - Do not reuse section icons for actions
 */

import {
  // Navigation Section Icons
  IconLayoutDashboard,
  IconMessageCircle,
  IconMessages,
  IconInfoCircle,
  IconBook2,
  IconBuildingWarehouse,
  IconHierarchy2,
  IconFileText,
  IconCertificate,
  IconShield,
  IconShieldCheck,
  IconGitPullRequest,
  IconBrain,
  IconSettings,
  // Action Icons
  IconEdit,
  IconPencil,
  IconCheck,
  IconX,
  IconRefresh,
  IconCircleCheck,
  IconCircleX,
  IconBolt,
  IconPlus,
  IconTrash,
  IconSend,
  IconArrowLeft,
  IconArrowUpRight,
  IconAlertTriangle,
  IconEye,
  IconMinus,
  IconLetterA,
  IconCircle,
  IconChevronDown,
  IconCopy,
  IconCode,
  IconPlayerPlay,
  IconLink,
} from "@tabler/icons-react";

/**
 * Centralized icon registry
 * 
 * Section icons: Each navigation section has a unique icon
 * Action icons: Reusable verbs for UI actions
 */
export const Icons = {
  // ============================================================================
  // Navigation Section Icons (unique per section)
  // ============================================================================
  Overview: IconLayoutDashboard,
  Chat: IconMessageCircle,
  Conversations: IconMessages, // Changed from IconMessageCircle to avoid duplicate
  About: IconInfoCircle,
  Glossary: IconBook2, // Changed from IconBook to IconBook2 for clarity
  Workspaces: IconBuildingWarehouse, // Changed from IconBox
  Nodes: IconHierarchy2, // Changed from IconBox
  Documents: IconFileText,
  CanonicalDocs: IconCertificate, // Changed from IconFileText
  ContinuumGovernance: IconShield,
  WorkspaceGovernance: IconShieldCheck, // Changed from IconShield to differentiate
  Proposals: IconGitPullRequest, // Changed from IconSend
  Models: IconBrain,
  Settings: IconSettings,

  // ============================================================================
  // Action Icons (verbs, reusable)
  // ============================================================================
  Edit: IconPencil, // Prefer IconPencil over IconEdit for consistency
  Save: IconCheck, // Using IconCheck as IconDeviceFloppy may not be available
  Cancel: IconX,
  Refresh: IconRefresh,
  Approve: IconCircleCheck,
  Reject: IconCircleX,
  Apply: IconBolt,
  Add: IconPlus,
  Delete: IconTrash,
  Send: IconSend,
  ArrowLeft: IconArrowLeft,
  ArrowUpRight: IconArrowUpRight,
  Alert: IconAlertTriangle,
  View: IconEye,
  Minus: IconMinus,
  LetterA: IconLetterA,
  Circle: IconCircle,
  ChevronDown: IconChevronDown,
  Copy: IconCopy,
  Code: IconCode,
  Play: IconPlayerPlay,
  Link: IconLink,
} as const;

