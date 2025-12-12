import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  Badge,
  Container,
  Group,
  Loader,
  NavLink,
  Paper,
  Select,
  Stack,
  Table,
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
  const navigate = useNavigate();
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

  type NavKey = "overview" | "workspaces" | "nodes" | "settings";
  const [activeNav, setActiveNav] = useState<NavKey>("workspaces");

  // Sync activeNav with route
  useEffect(() => {
    if (location.pathname === "/glossary") {
      // Don't set activeNav for glossary, it's separate
    } else if (location.pathname === "/") {
      // Keep current activeNav for workspace browser
    }
  }, [location.pathname]);

  // Fetch workspaces on mount
  useEffect(() => {
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

    fetchWorkspaces();
  }, []);

  const handleWorkspaceClick = async (workspace: Workspace) => {
    console.log("Clicked workspace", workspace.id, workspace.name);
    setSelectedWorkspace(workspace);
    setNodes([]);
    setNodesError(null);
    setNodesLoading(true);
    setActiveNav("nodes");

    try {
      const res = await fetch(
        `${API_BASE}/api/nodes?workspaceId=${encodeURIComponent(
          workspace.id
        )}`
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
            active={activeNav === "overview" && location.pathname === "/"}
            onClick={() => {
              navigate("/");
              setActiveNav("overview");
            }}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  activeNav === "overview" && location.pathname === "/"
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
            active={activeNav === "workspaces" && location.pathname === "/"}
            onClick={() => {
              navigate("/");
              setActiveNav("workspaces");
            }}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  activeNav === "workspaces" && location.pathname === "/"
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
            active={activeNav === "nodes" && location.pathname === "/"}
            onClick={() => {
              navigate("/");
              setActiveNav("nodes");
            }}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  activeNav === "nodes" && location.pathname === "/"
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
            active={activeNav === "settings" && location.pathname === "/"}
            onClick={() => {
              navigate("/");
              setActiveNav("settings");
            }}
            styles={{
              root: {
                borderRadius: 8,
                backgroundColor:
                  activeNav === "settings" && location.pathname === "/"
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
            active={location.pathname === "/glossary"}
            onClick={() => navigate("/glossary")}
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
          <Route
            path="/"
            element={
              <Container size="xl" py="lg">
                <Stack gap="md">
                  {/* Banner */}
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

            {/* Overview card */}
            {activeNav === "overview" && (
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
                  <Text fw={600} size="lg">
                    Overview
                  </Text>
                  <Text size="sm" c={palette.textSoft}>
                    Continuum at a glance
                  </Text>
                  <Group gap="md" mt="md">
                    <Paper
                      p="md"
                      radius="md"
                      style={{
                        backgroundColor: palette.header,
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <Stack gap={4}>
                        <Text size="xs" c={palette.textSoft}>
                          Total Workspaces
                        </Text>
                        <Text fw={700} size="xl" c={palette.text}>
                          {workspaces.length}
                        </Text>
                      </Stack>
                    </Paper>
                    {selectedWorkspace && (
                      <Paper
                        p="md"
                        radius="md"
                        style={{
                          backgroundColor: palette.header,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <Stack gap={4}>
                          <Text size="xs" c={palette.textSoft}>
                            Selected Workspace
                          </Text>
                          <Text fw={700} size="xl" c={palette.text}>
                            {selectedWorkspace.name}
                          </Text>
                        </Stack>
                      </Paper>
                    )}
                    {selectedWorkspace && nodes.length > 0 && (
                      <Paper
                        p="md"
                        radius="md"
                        style={{
                          backgroundColor: palette.header,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <Stack gap={4}>
                          <Text size="xs" c={palette.textSoft}>
                            Nodes Loaded
                          </Text>
                          <Text fw={700} size="xl" c={palette.text}>
                            {nodes.length}
                          </Text>
                        </Stack>
                      </Paper>
                    )}
                  </Group>
                </Stack>
              </Paper>
            )}

            {/* Workspaces card */}
            {activeNav === "workspaces" && (
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
                  <Group justify="space-between" align="center">
                    <Text fw={600} size="lg">
                      Workspaces
                    </Text>
                    {selectedWorkspace && (
                      <Badge color="yellow" variant="light">
                        {selectedWorkspace.tenant.name} /{" "}
                        {selectedWorkspace.name}
                      </Badge>
                    )}
                  </Group>

                  <Text size="xs" c={palette.textSoft}>
                    Fetched from Continuum Core at {API_BASE}
                  </Text>

                  {workspacesLoading && (
                    <Group gap="xs">
                      <Loader size="sm" />
                      <Text size="sm">Loading workspaces…</Text>
                    </Group>
                  )}

                  {workspacesError && (
                    <Text size="sm" c="red.3">
                      {workspacesError}
                    </Text>
                  )}

                  {!workspacesLoading && !workspacesError && (
                    <Table
                      highlightOnHover
                      verticalSpacing="xs"
                      horizontalSpacing="md"
                      withTableBorder
                      withColumnBorders
                      styles={{
                        table: {
                          backgroundColor: "transparent",
                        },
                        th: {
                          backgroundColor: palette.header,
                          color: palette.textSoft,
                          borderColor: palette.border,
                        },
                        td: {
                          borderColor: palette.border,
                          color: palette.text,
                        },
                      }}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>{TERMS.tenant}</Table.Th>
                          <Table.Th>Workspace</Table.Th>
                          <Table.Th style={{ textAlign: "center" }}>
                            Nodes
                          </Table.Th>
                          <Table.Th>Created</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {workspaces.map((workspace) => {
                          const isSelected =
                            selectedWorkspace?.id === workspace.id;
                          return (
                            <Table.Tr
                              key={workspace.id}
                              onClick={() => handleWorkspaceClick(workspace)}
                              style={{
                                cursor: "pointer",
                                backgroundColor: isSelected
                                  ? palette.accentSoft
                                  : "transparent",
                                fontWeight: isSelected ? 600 : "normal",
                              }}
                            >
                              <Table.Td>
                                <Text fw={isSelected ? 600 : "normal"}>
                                  {workspace.tenant.name}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text fw={isSelected ? 600 : "normal"}>
                                  {workspace.name}
                                </Text>
                              </Table.Td>
                              <Table.Td style={{ textAlign: "center" }}>
                                <Badge
                                  color="yellow"
                                  variant="filled"
                                  radius="xl"
                                >
                                  {workspace._count.nodes}
                                </Badge>
                              </Table.Td>
                              <Table.Td>
                                {new Date(
                                  workspace.createdAt
                                ).toLocaleString()}
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Nodes card */}
            {activeNav === "nodes" && (
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
                  <Group justify="space-between" align="center">
                    <Text fw={600} size="lg">
                      {selectedWorkspace
                        ? `Nodes for ${selectedWorkspace.name}`
                        : "Nodes"}
                    </Text>
                  </Group>

                  {!selectedWorkspace && (
                    <Text size="sm" c={palette.textSoft}>
                      Select a workspace above to see its nodes.
                    </Text>
                  )}

                  {selectedWorkspace && nodesLoading && (
                    <Group gap="xs">
                      <Loader size="sm" />
                      <Text size="sm">Loading nodes…</Text>
                    </Group>
                  )}

                  {selectedWorkspace && nodesError && (
                    <Text size="sm" c="red.3">
                      {nodesError}
                    </Text>
                  )}

                  {selectedWorkspace &&
                    !nodesLoading &&
                    !nodesError &&
                    nodes.length === 0 && (
                      <Text size="sm" c={palette.textSoft}>
                        This workspace has no nodes yet.
                      </Text>
                    )}

                  {selectedWorkspace &&
                    !nodesLoading &&
                    !nodesError &&
                    nodes.length > 0 && (
                      <Table
                        highlightOnHover
                        verticalSpacing="xs"
                        horizontalSpacing="md"
                        withTableBorder
                        withColumnBorders
                        styles={{
                          table: {
                            backgroundColor: "transparent",
                          },
                          th: {
                            backgroundColor: palette.header,
                            color: palette.textSoft,
                            borderColor: palette.border,
                          },
                          td: {
                            borderColor: palette.border,
                            color: palette.text,
                          },
                        }}
                      >
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Node</Table.Th>
                            <Table.Th>Programs</Table.Th>
                            <Table.Th>Modules</Table.Th>
                            <Table.Th>Documents</Table.Th>
                            <Table.Th>Integrations</Table.Th>
                            <Table.Th>Created</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {nodes.map((node) => (
                            <Table.Tr key={node.id}>
                              <Table.Td>{node.name}</Table.Td>
                              <Table.Td>{node._count.programs}</Table.Td>
                              <Table.Td>{node._count.modules}</Table.Td>
                              <Table.Td>{node._count.documents}</Table.Td>
                              <Table.Td>{node._count.integrations}</Table.Td>
                              <Table.Td>
                                {new Date(node.createdAt).toLocaleString()}
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    )}
                </Stack>
              </Paper>
            )}

            {/* Settings card */}
            {activeNav === "settings" && (
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
                  <Text fw={600} size="lg">
                    Settings
                  </Text>
                  <Text size="sm" c={palette.textSoft}>
                    Continuum options and configuration
                  </Text>
                  <Text size="sm" c={palette.textSoft} mt="md">
                    Settings panel coming soon.
                  </Text>
                </Stack>
              </Paper>
            )}
                </Stack>
              </Container>
            }
          />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
