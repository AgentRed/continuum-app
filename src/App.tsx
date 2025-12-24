import React, { useEffect, useState, useMemo } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import {
  AppShell,
  Collapse,
  Container,
  Group,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { AppIcons } from "./ui/iconMap";
import { Icons } from "./ui/icons";
import { sideNavSections, matchesRoute, type SideNavSection } from "./navigation/navConfig";
import SideNavItem from "./components/SideNavItem";
import GlossaryPage from "./pages/GlossaryPage";
import OverviewPage from "./pages/OverviewPage";
import AboutPage from "./pages/AboutPage";
import WorkspacesPage from "./pages/WorkspacesPage";
import NodesPage from "./pages/NodesPage";
import NodeDetailPage from "./pages/NodeDetailPage";
import SettingsPage from "./pages/SettingsPage";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentViewPage from "./pages/DocumentViewPage";
import EditorSpikePage from "./pages/EditorSpikePage";
import CanonicalDocumentsPage from "./pages/CanonicalDocumentsPage";
import CanonicalDocumentViewPage from "./pages/CanonicalDocumentViewPage";
import DevelopmentPlanPage from "./pages/DevelopmentPlanPage";
import ProposalsPage from "./pages/ProposalsPage";
import ProposalDetailPage from "./pages/ProposalDetailPage";
import ContentAuditPage from "./pages/ContentAuditPage";
import ContinuumGovernancePage from "./pages/ContinuumGovernancePage";
import WorkspaceGovernancePage from "./pages/WorkspaceGovernancePage";
import ChatSessionsPage from "./pages/ChatSessionsPage";
import ChatSessionPage from "./pages/ChatSessionPage";
import ConversationsPage from "./pages/ConversationsPage";
import ConversationDetailPage from "./pages/ConversationDetailPage";
import ModelsPage from "./pages/ModelsPage";
import ModelRegistryPage from "./pages/ModelRegistryPage";
import ChatPage from "./pages/ChatPage";
import SystemChatPage from "./pages/SystemChatPage";
import WorkspaceChatPage from "./pages/WorkspaceChatPage";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import WhitepapersPage from "./pages/WhitepapersPage";
import WhitepaperDetailPage from "./pages/WhitepaperDetailPage";
import LibraryPage from "./pages/LibraryPage";
import MediaLibraryPage from "./pages/MediaLibraryPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import PageFrame from "./layout/PageFrame";
import ContentRoot from "./layout/ContentRoot";
import AppFooter from "./layout/AppFooter";
import TopNav from "./components/TopNav";
import SoundtrackPlayer from "./components/SoundtrackPlayer";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import { FontSizeProvider } from "./context/FontSizeContext";
import { ContentQualityProvider } from "./context/ContentQualityContext";
import ContinuumWordmark from "./components/ContinuumWordmark";
import ErrorBoundary from "./components/ErrorBoundary";

// ---------- Types ----------

type Workspace = {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
  _count: {
    nodes: number;
  };
};

type Node = {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: string;
    name: string;
  };
  _count: {
    programs: number;
    modules: number;
    documents: number;
    integrations: number;
  };
};

// ---------- Palettes ----------

type PaletteKey =
  | "Muted Rose & Sage"
  | "Soft Slate & Petal"
  | "Pacific Teal"
  | "Evergreen Copper"
  | "Regal Navy & Gold";

type PaletteDef = {
  name: PaletteKey;
  background: string;
  surface: string;
  header: string;
  accent: string;
  accentSoft: string;
  text: string;
  textSoft: string;
  border: string;
};

const PALETTES: Record<PaletteKey, PaletteDef> = {
  "Muted Rose & Sage": {
    name: "Muted Rose & Sage",
    background: "#2c363f",
    surface: "#3a4651",
    header: "#2c363f",
    accent: "#e75a7c",
    accentSoft: "#f2f5ea",
    text: "#f2f5ea",
    textSoft: "#d6dbd2",
    border: "#bbc7a4",
  },
  "Soft Slate & Petal": {
    name: "Soft Slate & Petal",
    background: "#546a76",
    surface: "#35424b",
    header: "#546a76",
    accent: "#fad4d8",
    accentSoft: "#dbd3c9",
    text: "#fefefe",
    textSoft: "#dbd3c9",
    border: "#88a0a8",
  },
  "Pacific Teal": {
    name: "Pacific Teal",
    background: "#071013",
    surface: "#071821",
    header: "#071013",
    accent: "#23b5d3",
    accentSoft: "#75abbc",
    text: "#dfe0e2",
    textSoft: "#a2aebb",
    border: "#23b5d3",
  },
  "Evergreen Copper": {
    name: "Evergreen Copper",
    background: "#093824",
    surface: "#0b4530",
    header: "#093824",
    accent: "#bf4e30",
    accentSoft: "#ffcd78",
    text: "#e5eafa",
    textSoft: "#c6ccb2",
    border: "#bf4e30",
  },
  "Regal Navy & Gold": {
    name: "Regal Navy & Gold",
    background: "#000814",
    surface: "#001d3d",
    header: "#001d3d",
    accent: "#ffd60a",
    accentSoft: "#ffc300",
    text: "#f5f5f5",
    textSoft: "#d0d4e0",
    border: "#003566",
  },
};

const PALETTE_OPTIONS: { value: PaletteKey; label: string }[] = Object.keys(
  PALETTES
).map((key) => ({
  value: key as PaletteKey,
  label: key,
}));

import { API_BASE } from "./config";

// ---------- Vocabulary Map ----------

const TERMS = {
  tenant: "Owner",
  tenants: "Owners",
};


// ---------- Main Component ----------

const App: React.FC = () => {
  const location = useLocation();
  
  // Determine which section should be expanded based on current route
  const getActiveSection = (pathname: string): string | null => {
    for (const section of sideNavSections) {
      for (const item of section.items) {
        if (matchesRoute(pathname, item.matchers)) {
          return section.id;
        }
      }
    }
    return null;
  };
  
  const defaultActiveSection = useMemo(() => getActiveSection(location.pathname), [location.pathname]);
  
  // Track which sections are open (start with active section open)
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (defaultActiveSection) {
      initial.add(defaultActiveSection);
    }
    return initial;
  });
  
  // Update open sections when route changes
  useEffect(() => {
    if (defaultActiveSection) {
      setOpenSections((prev) => {
        const next = new Set(prev);
        next.add(defaultActiveSection);
        return next;
      });
    }
  }, [defaultActiveSection]);
  
  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };
  // Use only Regal Navy & Gold palette
  const palette = PALETTES["Regal Navy & Gold"];

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodesError, setNodesError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    try {
      setWorkspacesLoading(true);
      setWorkspacesError(null);

      const res = await fetch(`${API_BASE}/api/workspaces`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as Workspace[];
      setWorkspaces(data);
    } catch (err: any) {
      console.error("Error loading workspaces", err);
      setWorkspacesError(err?.message ?? "Failed to load workspaces");
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const fetchNodes = async (workspaceId: string) => {
    try {
      setNodesLoading(true);
      setNodesError(null);

      const res = await fetch(
        `${API_BASE}/api/nodes?workspaceId=${encodeURIComponent(workspaceId)}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as Node[];
      setNodes(data);
    } catch (err: any) {
      console.error("Error loading nodes", err);
      setNodesError(err?.message ?? "Failed to load nodes");
    } finally {
      setNodesLoading(false);
    }
  };

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWorkspaceClick = async (workspace: Workspace) => {
    console.log("Clicked workspace", workspace.id, workspace.name);
    setSelectedWorkspace(workspace);
    setNodes([]);
    setNodesError(null);
    await fetchNodes(workspace.id);
  };

  return (
    <AudioPlayerProvider>
      <FontSizeProvider>
        <ContentQualityProvider API_BASE={API_BASE}>
      <AppShell
      padding="md"
      header={{ height: 40 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
      }}
      styles={{
        main: {
          backgroundColor: palette.background,
          color: palette.text,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        },
        header: {
          backgroundColor: palette.header,
          borderBottom: `1px solid ${palette.border}`,
        },
      }}
    >
      {/* Header - Full width with top nav only */}
      <AppShell.Header>
        <div
          style={{
            height: "40px",
            backgroundColor: palette.header,
            borderBottom: `1px solid ${palette.border}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <TopNav palette={palette} />
        </div>
      </AppShell.Header>

      {/* Sidebar nav */}
      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: "#020617",
          borderRight: `1px solid ${palette.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack gap="md" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {/* Wordmark at top of sidebar */}
          <Group justify="center" align="center" style={{ padding: "12px 0", flexShrink: 0 }}>
            <ContinuumWordmark />
          </Group>

          {/* Side Navigation Sections - Scrollable */}
          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <Stack gap="md">
              {sideNavSections.map((section) => (
                <Stack key={section.id} gap={4}>
                  <Group
                    gap="xs"
                    onClick={() => toggleSection(section.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = palette.header;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    p={4}
                    style={{ cursor: "pointer", borderRadius: 8 }}
                  >
                    <Text
                      size="xs"
                      fw={600}
                      style={{ letterSpacing: 1, textTransform: "uppercase", flex: 1 }}
                      c={palette.textSoft}
                    >
                      {section.label}
                    </Text>
                    <Icons.ChevronDown
                      size={16}
                      color={palette.textSoft}
                      style={{
                        transform: openSections.has(section.id) ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </Group>
                  <Collapse in={openSections.has(section.id)}>
                    <Stack gap={4}>
                      {section.items.map((item) => (
                        <SideNavItem key={item.path} item={item} palette={palette} />
                      ))}
                    </Stack>
                  </Collapse>
                </Stack>
              ))}
            </Stack>
          </ScrollArea>

          {/* Soundtrack Player - Fixed at bottom */}
          <ErrorBoundary
            fallback={
              <div style={{ padding: 12, color: palette.textSoft, fontSize: "12px" }}>
                Player unavailable
              </div>
            }
            palette={palette}
          >
            <SoundtrackPlayer palette={palette} />
          </ErrorBoundary>
        </Stack>
      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <ContentRoot style={{ flex: 1 }}>
          <ErrorBoundary palette={palette}>
            <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route
            path="/overview"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <OverviewPage
                    workspaces={workspaces}
                    selectedWorkspace={selectedWorkspace}
                    nodes={nodes}
                    palette={palette}
                    API_BASE={API_BASE}
                    TERMS={TERMS}
                  />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/workspaces"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <Stack gap="md">
                    <Paper
                      shadow="sm"
                      p="md"
                      radius="md"
                      style={{
                        backgroundColor: palette.surface,
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <Stack gap="xs">
                        <Text size="sm" c={palette.textSoft}>
                          This is the first Continuum Surface. Select a palette, click a
                          workspace, and Continuum will fetch its nodes from Continuum
                          Core.
                        </Text>
                        <Text size="xs" c={palette.textSoft}>
                          API Base: {API_BASE}
                        </Text>
                      </Stack>
                    </Paper>
                    <WorkspacesPage
                      workspaces={workspaces}
                      workspacesLoading={workspacesLoading}
                      workspacesError={workspacesError}
                      selectedWorkspace={selectedWorkspace}
                      nodes={nodes}
                      nodesLoading={nodesLoading}
                      nodesError={nodesError}
                      onWorkspaceClick={handleWorkspaceClick}
                      onRefreshWorkspaces={fetchWorkspaces}
                      onRefreshNodes={selectedWorkspace ? () => fetchNodes(selectedWorkspace.id) : undefined}
                      palette={palette}
                      TERMS={TERMS}
                      API_BASE={API_BASE}
                    />
                  </Stack>
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/about"
            element={
              <div
                style={{
                  backgroundColor: palette.background,
                  minHeight: "100vh",
                }}
              >
                <Container size="xl" py="lg">
                  <PageFrame>
                    <AboutPage palette={palette} API_BASE={API_BASE} />
                  </PageFrame>
                </Container>
              </div>
            }
          />
          <Route
            path="/nodes"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <NodesPage
                    workspaces={workspaces}
                    palette={palette}
                    TERMS={TERMS}
                    API_BASE={API_BASE}
                  />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/nodes/:nodeId"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <NodeDetailPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/models"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ModelsPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/system/model-registry"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ModelRegistryPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/diagnostics"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <DiagnosticsPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/whitepapers"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <WhitepapersPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/whitepapers/:id"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <WhitepaperDetailPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/settings"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <SettingsPage palette={palette} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/documents"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <DocumentsPage palette={palette} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <DocumentViewPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/library"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <LibraryPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/media"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <MediaLibraryPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/media/playlists/:id"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <PlaylistDetailPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/canonical-documents"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <CanonicalDocumentsPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/canonical-documents/:id"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <CanonicalDocumentViewPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/proposals"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ProposalsPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/proposals/:id"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ProposalDetailPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/chat"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ChatPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/workspaces/:id/chat"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <WorkspaceChatPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/chat/:sessionId"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ChatSessionPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/conversations"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ConversationsPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/conversations/:id"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ConversationDetailPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/governance/continuum"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ContinuumGovernancePage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/governance/workspaces"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <WorkspaceGovernancePage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/content-audit"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <ContentAuditPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/development-plan"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <DevelopmentPlanPage palette={palette} API_BASE={API_BASE} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/editor-spike"
            element={
              <Container size="xl" py="lg">
                <PageFrame>
                  <EditorSpikePage palette={palette} />
                </PageFrame>
              </Container>
            }
          />
          <Route
            path="/glossary"
            element={
              <div
                style={{
                  backgroundColor: palette.background,
                  minHeight: "100vh",
                }}
              >
                <Container size="xl" py="lg">
                  <PageFrame>
                    <GlossaryPage palette={palette} API_BASE={API_BASE} />
                  </PageFrame>
                </Container>
              </div>
            }
          />
            </Routes>
          </ErrorBoundary>
        </ContentRoot>
        <AppFooter palette={palette} />
      </AppShell.Main>
    </AppShell>
      </ContentQualityProvider>
    </FontSizeProvider>
    </AudioPlayerProvider>
  );
};

export default App;
