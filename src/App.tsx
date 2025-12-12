import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import {
  AppShell,
  Container,
  Group,
  NavLink,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconChevronUp,
  IconChevronDown,
  IconLayoutDashboard,
  IconBox,
  IconSettings,
  IconBook,
} from "@tabler/icons-react";
import GlossaryPage from "./pages/GlossaryPage";
import OverviewPage from "./pages/OverviewPage";
import WorkspacesPage from "./pages/WorkspacesPage";
import NodesPage from "./pages/NodesPage";
import SettingsPage from "./pages/SettingsPage";

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

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080";

// ---------- Vocabulary Map ----------

const TERMS = {
  tenant: "Owner",
  tenants: "Owners",
};

// ---------- Main Component ----------

const App: React.FC = () => {
  const location = useLocation();
  const [paletteKey, setPaletteKey] =
    useState<PaletteKey>("Regal Navy & Gold");
  const palette = PALETTES[paletteKey];

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
    <AppShell
      padding="md"
      header={{ height: 70 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
      }}
      styles={{
        main: {
          backgroundColor: palette.background,
          color: palette.text,
          minHeight: "100vh",
        },
      }}
    >
      {/* Header */}
      <AppShell.Header
        style={{
          backgroundColor: palette.header,
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Container size="xl" style={{ height: "100%" }}>
          <Group
            justify="space-between"
            align="center"
            style={{ height: "100%" }}
          >
            <Group gap="xs" align="center">
              <Group gap={4}>
                <IconChevronUp size={22} color={palette.accentSoft} />
                <IconChevronDown size={22} color={palette.accentSoft} />
              </Group>
              <Stack gap={0}>
                <Text fw={700} size="xl" c={palette.text}>
                  Continuum
                </Text>
                <Text size="sm" c={palette.textSoft}>
                  Workspace Browser
                </Text>
              </Stack>
            </Group>

            <Group gap="xs" align="center">
              <Text size="sm" c={palette.textSoft}>
                Palette
              </Text>
              <Select
                value={paletteKey}
                onChange={(value) =>
                  value && setPaletteKey(value as PaletteKey)
                }
                data={PALETTE_OPTIONS}
                allowDeselect={false}
                size="sm"
                styles={{
                  input: {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                  dropdown: {
                    backgroundColor: palette.surface,
                  },
                }}
              />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* Sidebar nav */}
      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: "#020617",
          borderRight: `1px solid ${palette.border}`,
        }}
      >
        <Stack gap="xs">
          <Text
            size="xs"
            fw={600}
            style={{ letterSpacing: 1, textTransform: "uppercase" }}
            c={palette.textSoft}
          >
            Navigation
          </Text>

          <NavLink
            label="Overview"
            description="Continuum at a glance"
            leftSection={
              <IconLayoutDashboard size={18} color={palette.textSoft} />
            }
            component={Link}
            to="/overview"
            active={location.pathname === "/overview"}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  location.pathname === "/overview"
                    ? palette.surface
                    : "transparent",
              },
              label: { color: palette.text },
              description: { color: palette.textSoft },
            }}
          />

          <NavLink
            label="Workspaces"
            description={`${TERMS.tenants} and surfaces`}
            leftSection={<IconBox size={18} color={palette.textSoft} />}
            component={Link}
            to="/workspaces"
            active={location.pathname === "/workspaces"}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  location.pathname === "/workspaces"
                    ? palette.surface
                    : "transparent",
              },
              label: { color: palette.text },
              description: { color: palette.textSoft },
            }}
          />

          <NavLink
            label="Nodes"
            description="Active cores"
            leftSection={<IconBox size={18} color={palette.textSoft} />}
            component={Link}
            to="/nodes"
            active={location.pathname === "/nodes"}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  location.pathname === "/nodes"
                    ? palette.surface
                    : "transparent",
              },
              label: { color: palette.text },
              description: { color: palette.textSoft },
            }}
          />

          <NavLink
            label="Settings"
            description="Continuum options"
            leftSection={<IconSettings size={18} color={palette.textSoft} />}
            component={Link}
            to="/settings"
            active={location.pathname === "/settings"}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  location.pathname === "/settings"
                    ? palette.surface
                    : "transparent",
              },
              label: { color: palette.text },
              description: { color: palette.textSoft },
            }}
          />

          <NavLink
            label="Glossary"
            description="Continuum terminology"
            leftSection={<IconBook size={18} color={palette.textSoft} />}
            component={Link}
            to="/glossary"
            active={location.pathname === "/glossary"}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  location.pathname === "/glossary"
                    ? palette.surface
                    : "transparent",
              },
              label: { color: palette.text },
              description: { color: palette.textSoft },
            }}
          />
        </Stack>
      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/workspaces" replace />} />
          <Route
            path="/overview"
            element={
              <Container size="xl" py="lg">
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
                  <OverviewPage
                    workspacesCount={workspaces.length}
                    selectedWorkspaceName={selectedWorkspace?.name}
                    nodesCount={nodes.length > 0 ? nodes.length : undefined}
                    palette={palette}
                  />
                </Stack>
              </Container>
            }
          />
          <Route
            path="/workspaces"
            element={
              <Container size="xl" py="lg">
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
              </Container>
            }
          />
          <Route
            path="/nodes"
            element={
              <Container size="xl" py="lg">
                <NodesPage
                  workspaces={workspaces}
                  palette={palette}
                  TERMS={TERMS}
                  API_BASE={API_BASE}
                />
              </Container>
            }
          />
          <Route
            path="/settings"
            element={
              <Container size="xl" py="lg">
                <SettingsPage palette={palette} />
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
                <GlossaryPage />
              </div>
            }
          />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
