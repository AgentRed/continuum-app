/**
 * Icon Map - Centralized icon definitions for Continuum
 * 
 * AUDIT SUMMARY:
 * 
 * Navigation Section Icons (must be unique per section):
 * - Overview: IconLayoutDashboard (App.tsx) ✓
 * - Chat: IconMessageCircle (App.tsx)
 * - Conversations: IconMessages (App.tsx) - Changed from IconMessageCircle
 * - About: IconInfoCircle (App.tsx) ✓
 * - Glossary: IconBook2 (App.tsx) - Changed from IconBook
 * - Workspaces: IconBuildingWarehouse (App.tsx) - Changed from IconBox
 * - Nodes: IconHierarchy2 (App.tsx) - Changed from IconBox
 * - Documents: IconFileText (App.tsx)
 * - Canonical Docs: IconCertificate (App.tsx) - Changed from IconFileText
 * - Continuum Governance: IconShield (App.tsx)
 * - Workspace Governance: IconShieldCheck (App.tsx) - Changed from IconShield
 * - Proposals: IconGitPullRequest (App.tsx) - Changed from IconSend
 * - Models: IconBrain (App.tsx)
 * - Settings: IconSettings (App.tsx) ✓
 * 
 * Key Duplicates Found (FIXED):
 * - Chat & Conversations: Both used IconMessageCircle → Fixed: Chat=IconMessageCircle, Conversations=IconMessages
 * - Workspaces & Nodes: Both used IconBox → Fixed: Workspaces=IconBuildingWarehouse, Nodes=IconHierarchy2
 * - Documents & Canonical Docs: Both used IconFileText → Fixed: Documents=IconFileText, CanonicalDocs=IconCertificate
 * - Continuum & Workspace Governance: Both used IconShield → Fixed: Continuum=IconShield, Workspace=IconShieldCheck
 * 
 * Icon Selection Principles:
 * - Prefer outline icons for consistency
 * - Each navigation section has a unique, semantically appropriate icon
 * - Icons should be visually distinct from each other
 * - Maintain existing hover/active styling and sizing (18px in nav)
 */

import {
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
  IconActivity,
  IconBooks,
  IconFileDescription,
  IconCpu,
  IconMusic,
} from "@tabler/icons-react";

/**
 * AppIcons - Centralized icon map for navigation sections
 * 
 * All navigation section icons are unique and semantically appropriate.
 * Icons are outline style for visual consistency.
 */
export const AppIcons = {
  // Navigation Sections (unique per section)
  overview: IconLayoutDashboard,
  chat: IconMessageCircle,
  conversations: IconMessages,
  about: IconInfoCircle,
  glossary: IconBook2,
  workspaces: IconBuildingWarehouse,
  nodes: IconHierarchy2,
  documents: IconFileText,
  canonical: IconCertificate,
  continuumGovernance: IconShield,
  workspaceGovernance: IconShieldCheck,
  proposals: IconGitPullRequest,
  models: IconBrain,
  settings: IconSettings,
  diagnostics: IconActivity,
  whitepapers: IconBooks,
  whitepaper: IconFileDescription,
  media: IconMusic,
} as const;

