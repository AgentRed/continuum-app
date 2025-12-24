/**
 * Navigation Configuration
 * 
 * Single source of truth for all navigation items.
 * Defines top nav (infrequent/reference) and side nav (frequent/operational).
 */

import React from "react";
import { AppIcons } from "../ui/iconMap";

export type RouteMatcher = string | ((pathname: string) => boolean);

export interface TopNavItem {
  label: string;
  path: string;
  matchers: RouteMatcher[]; // Routes that should activate this nav item
}

export interface SideNavItem {
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  path: string;
  matchers: RouteMatcher[]; // Routes that should activate this nav item
}

export interface SideNavSection {
  id: string;
  label: string;
  items: SideNavItem[];
}

/**
 * Top Navigation Items
 * For infrequent, reference, and system-level pages
 */
export const topNavItems: TopNavItem[] = [
  {
    label: "Library",
    path: "/library",
    matchers: [
      "/library",
      (pathname) => pathname.startsWith("/library/"),
      "/whitepapers",
      (pathname) => pathname.startsWith("/whitepapers/"),
      "/canonical-documents",
      (pathname) => pathname.startsWith("/canonical-documents/"),
      "/whitepaper",
    ],
  },
  {
    label: "System",
    path: "/overview",
    matchers: [
      "/overview",
      "/settings",
      "/models",
      "/diagnostics",
      "/development-plan",
      "/governance/continuum",
    ],
  },
  {
    label: "About",
    path: "/about",
    matchers: ["/about"],
  },
  {
    label: "Glossary",
    path: "/glossary",
    matchers: ["/glossary"],
  },
];

/**
 * Side Navigation Sections
 * For frequent, operational, and work surfaces
 */
export const sideNavSections: SideNavSection[] = [
  {
    id: "orientation",
    label: "Orientation",
    items: [
      {
        label: "Overview",
        description: "System overview",
        icon: AppIcons.overview,
        path: "/overview",
        matchers: ["/overview"],
      },
      {
        label: "Chat",
        description: "Converse with Continuum",
        icon: AppIcons.chat,
        path: "/chat",
        matchers: [
          "/chat",
          (pathname) => pathname.startsWith("/chat/"),
          (pathname) => pathname.startsWith("/workspaces/") && pathname.includes("/chat"),
        ],
      },
      {
        label: "Conversations",
        description: "Chat and thread history",
        icon: AppIcons.conversations,
        path: "/conversations",
        matchers: [
          "/conversations",
          (pathname) => pathname.startsWith("/conversations/"),
        ],
      },
    ],
  },
  {
    id: "structure",
    label: "Structure",
    items: [
      {
        label: "Owners and Workspaces",
        description: "Owners and surfaces", // Note: TERMS.tenants would be "Owners" here
        icon: AppIcons.workspaces,
        path: "/workspaces",
        matchers: [
          "/workspaces",
          (pathname) => pathname.startsWith("/workspaces/") && !pathname.includes("/chat"),
        ],
      },
      {
        label: "Nodes",
        description: "Active cores",
        icon: AppIcons.nodes,
        path: "/nodes",
        matchers: [
          "/nodes",
          (pathname) => pathname.startsWith("/nodes/"),
        ],
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        label: "Documents",
        description: "Browse node documents",
        icon: AppIcons.documents,
        path: "/documents",
        matchers: [
          "/documents",
          (pathname) => pathname.startsWith("/documents/"),
        ],
      },
      {
        label: "Media",
        description: "Library and playlists",
        icon: AppIcons.media,
        path: "/media",
        matchers: [
          "/media",
          (pathname) => pathname.startsWith("/media/"),
        ],
      },
      // Note: Canonical Documents is in Library (top nav), not here
      // This Content section is for node-level documents only
    ],
  },
  {
    id: "governance",
    label: "Governance",
    items: [
      {
        label: "Continuum Governance",
        description: "System-wide governance",
        icon: AppIcons.continuumGovernance,
        path: "/governance/continuum",
        matchers: ["/governance/continuum"],
      },
      {
        label: "Workspace Governance",
        description: "Workspace-level governance",
        icon: AppIcons.workspaceGovernance,
        path: "/governance/workspaces",
        matchers: ["/governance/workspaces"],
      },
      {
        label: "Proposals",
        description: "Governed change workflow",
        icon: AppIcons.proposals,
        path: "/proposals",
        matchers: [
          "/proposals",
          (pathname) => pathname.startsWith("/proposals/"),
        ],
      },
    ],
  },
];

/**
 * Helper function to check if a route matches any matcher
 */
export function matchesRoute(pathname: string, matchers: RouteMatcher[]): boolean {
  return matchers.some((matcher) => {
    if (typeof matcher === "string") {
      return pathname === matcher || pathname.startsWith(matcher + "/");
    }
    return matcher(pathname);
  });
}

/**
 * Get the active top nav item for a given pathname
 */
export function getActiveTopNavItem(pathname: string): TopNavItem | null {
  for (const item of topNavItems) {
    if (matchesRoute(pathname, item.matchers)) {
      return item;
    }
  }
  return null;
}

/**
 * Get the active side nav item for a given pathname
 */
export function getActiveSideNavItem(pathname: string): SideNavItem | null {
  for (const section of sideNavSections) {
    for (const item of section.items) {
      if (matchesRoute(pathname, item.matchers)) {
        return item;
      }
    }
  }
  return null;
}

