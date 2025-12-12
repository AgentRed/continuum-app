import React, { useEffect, useState } from "react";
import {
  AppShell,
  Badge,
  Button,
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
  IconLayoutDashboard,
  IconStack2,
  IconFileText,
  IconStack3,
  IconPlug,
  IconSettings,
} from "@tabler/icons-react";

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

const PALETTE_OPTIONS: { value: PaletteKey; label: string }[] =
  Object.keys(PALETTES).map((key) => ({
    value: key as PaletteKey,
    label: key,
  }));

const API_BASE = "http://localhost:8080";

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

// ---------- Main Component ----------

export default function App() {
  const [paletteKey, setPaletteKey] = useState<PaletteKey>("Regal Navy & Gold");
  const palette = PALETTES[paletteKey];

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [nodesLoading, setNodesLoading] = useState(false);

  useEffect(() => {
    setWorkspacesLoading(true);
    fetch(`${API_BASE}/api/workspaces`)
      .then((r) => r.json())
      .then((data) => {
        console.log("Loaded workspaces:", data);
        setWorkspaces(data);
        setWorkspacesLoading(false);
      })
      .catch((err) => {
        console.error("Workspace error:", err);
        setWorkspacesLoading(false);
      });
  }, []);

  const loadNodes = (ws: Workspace) => {
    console.log("Clicked workspace:", ws.id);
    setSelectedWorkspace(ws);
    setNodesLoading(true);
    setNodes([]);

    fetch(`${API_BASE}/api/nodes?workspaceId=${ws.id}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("Loaded nodes:", data);
        setNodes(data);
        setNodesLoading(false);
      })
      .catch((err) => {
        console.error("Node error:", err);
        setNodesLoading(false);
      });
  };

  return (
    <AppShell
      padding={0}
      navbar={{
        width: 256,
        breakpoint: "sm",
      }}
      styles={{
        main: {
          backgroundColor: "#f1f5f9",
          minHeight: "100vh",
        },
      }}
    >
      {/* Sidebar */}
      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        <Stack gap="xl">
          {/* Logo Section */}
          <Group gap="xs">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                backgroundColor: palette.header,
                color: palette.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              NC
            </div>
            <Stack gap={0}>
              <Text size="sm" fw={600} c="#0f172a">
                Nucleus Continuum
              </Text>
              <Button
                variant="subtle"
                size="xs"
                p={0}
                h="auto"
                style={{ justifyContent: "flex-start" }}
              >
                <Text size="xs" c="#64748b">
                  Current Tenant
                </Text>
              </Button>
            </Stack>
          </Group>

          {/* Navigation Section */}
          <div>
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              c="#64748b"
              mb="xs"
              style={{ letterSpacing: "0.05em" }}
            >
              Navigation
            </Text>
            <Stack gap={4}>
              <NavLink
                label="Home"
                leftSection={<IconLayoutDashboard size={16} />}
                variant="subtle"
              />
              <NavLink
                label="Workspaces"
                leftSection={<IconStack2 size={16} />}
                active
                variant="filled"
                style={{
                  backgroundColor: palette.header,
                  color: palette.text,
                }}
              />
              <NavLink
                label="Programs"
                leftSection={<IconStack3 size={16} />}
                variant="subtle"
              />
              <NavLink
                label="Knowledge"
                leftSection={<IconFileText size={16} />}
                variant="subtle"
              />
              <NavLink
                label="Modules"
                leftSection={<IconPlug size={16} />}
                variant="subtle"
              />
              <NavLink
                label="Integrations"
                leftSection={<IconSettings size={16} />}
                variant="subtle"
              />
              <NavLink
                label="Settings"
                leftSection={<IconSettings size={16} />}
                variant="subtle"
              />
            </Stack>
          </div>

          {/* Shortcuts Section */}
          <div>
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              c="#64748b"
              mb="xs"
              style={{ letterSpacing: "0.05em" }}
            >
              Shortcuts
            </Text>
            <Stack gap={4}>
              {workspaces.slice(0, 2).map((ws) => (
                <Button
                  key={ws.id}
                  variant="subtle"
                  justify="flex-start"
                  fullWidth
                  p="xs"
                  h="auto"
                  style={{
                    color: "#334155",
                    fontSize: 12,
                  }}
                >
                  <Group gap="xs" w="100%">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: palette.accent,
                      }}
                    />
                    <Text size="xs" truncate>
                      {ws.name}
                    </Text>
                  </Group>
                </Button>
              ))}
            </Stack>
          </div>
        </Stack>
      </AppShell.Navbar>

      {/* Header */}
      <AppShell.Header
        p="md"
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container size="xl" style={{ height: "100%" }}>
          <Group justify="space-between" align="center" style={{ height: "100%" }}>
            <Stack gap={0}>
              <Text fw={600} size="lg" c="#0f172a">
                Continuum
              </Text>
              <Text size="xs" c="#64748b">
                Workspace Browser
              </Text>
            </Stack>
            <Group gap="xs" align="center">
              <Text size="sm" c="#64748b">
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
                }}
              />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* Main Content */}
      <AppShell.Main>
        <Container size="xl" py="lg">
          <Stack gap="lg">
            {/* Banner */}
            <Paper
              shadow="sm"
              p="md"
              radius="md"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Text size="sm" c="#475569">
                This is the first Continuum Surface. Select a palette, then browse
                Tenants, Workspaces, and Nodes coming from Continuum Core.
              </Text>
            </Paper>

            {/* Workspaces Card */}
            <Paper
              shadow="sm"
              p="md"
              radius="md"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Stack gap="md">
                <Stack gap={4}>
                  <Text fw={600} size="lg" c="#0f172a">
                    Workspaces
                  </Text>
                  <Text size="xs" c="#64748b">
                    Fetched from Continuum Core at {API_BASE}
                  </Text>
                </Stack>

                {workspacesLoading && (
                  <Group gap="xs">
                    <Loader size="sm" />
                    <Text size="sm" c="#475569">
                      Loading workspaces...
                    </Text>
                  </Group>
                )}

                {!workspacesLoading && (
                  <Table
                    highlightOnHover
                    styles={{
                      thead: {
                        backgroundColor: "#f8fafc",
                      },
                      th: {
                        color: "#64748b",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      },
                      td: {
                        color: "#334155",
                        fontSize: 12,
                      },
                    }}
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Tenant</Table.Th>
                        <Table.Th>Workspace</Table.Th>
                        <Table.Th>Nodes</Table.Th>
                        <Table.Th>Created</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {workspaces.map((ws) => {
                        const isSelected = selectedWorkspace?.id === ws.id;
                        return (
                          <Table.Tr
                            key={ws.id}
                            style={{
                              backgroundColor: isSelected
                                ? palette.accentSoft
                                : "transparent",
                              cursor: "pointer",
                            }}
                            onClick={() => loadNodes(ws)}
                          >
                            <Table.Td>{ws.tenant.name}</Table.Td>
                            <Table.Td fw={isSelected ? 600 : 400}>
                              {ws.name}
                            </Table.Td>
                            <Table.Td>
                              <Badge variant="filled" color="blue" size="sm">
                                {ws._count.nodes}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              {new Date(ws.createdAt).toLocaleString()}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            </Paper>

            {/* Nodes Card */}
            <Paper
              shadow="sm"
              p="md"
              radius="md"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Stack gap="md">
                <Text fw={600} size="lg" c="#0f172a">
                  {selectedWorkspace
                    ? `Nodes for ${selectedWorkspace.name}`
                    : "Nodes"}
                </Text>

                {!selectedWorkspace && (
                  <Text size="sm" c="#64748b">
                    Select a workspace above to see its nodes.
                  </Text>
                )}

                {selectedWorkspace && nodesLoading && (
                  <Group gap="xs">
                    <Loader size="sm" />
                    <Text size="sm" c="#475569">
                      Loading nodes...
                    </Text>
                  </Group>
                )}

                {selectedWorkspace && !nodesLoading && nodes.length === 0 && (
                  <Text size="sm" c="#64748b">
                    No nodes found.
                  </Text>
                )}

                {selectedWorkspace && !nodesLoading && nodes.length > 0 && (
                  <Table
                    highlightOnHover
                    styles={{
                      thead: {
                        backgroundColor: "#f8fafc",
                      },
                      th: {
                        color: "#64748b",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      },
                      td: {
                        color: "#334155",
                        fontSize: 12,
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
                      {nodes.map((n) => (
                        <Table.Tr key={n.id}>
                          <Table.Td>{n.name}</Table.Td>
                          <Table.Td>{n._count.programs}</Table.Td>
                          <Table.Td>{n._count.modules}</Table.Td>
                          <Table.Td>{n._count.documents}</Table.Td>
                          <Table.Td>{n._count.integrations}</Table.Td>
                          <Table.Td>
                            {new Date(n.createdAt).toLocaleString()}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
