import React, { useEffect, useState } from "react";
import {
  AppShell,
  Group,
  Title,
  Text,
  Select,
  Table,
  Badge,
  Loader,
  Center,
  Container,
  Stack,
  Paper,
} from "@mantine/core";

// Palette definitions using Jason's 5 palettes
const CONTINUUM_PALETTES = [
  {
    id: "soft-noir-rose",
    label: "Soft Noir & Rose",
    colors: {
      background: "#2c363f", // Jet Black
      surface: "#2c363f",
      surfaceSoft: "#3a4650",
      accent: "#e75a7c", // Blush Rose
      accentSoft: "#f2f5ea", // Ivory
      border: "#d6dbd2", // Dust Grey
      text: "#f2f5ea",
      textMuted: "#bbc7a4", // Dry Sage
    },
  },
  {
    id: "slate-celadon",
    label: "Slate & Celadon",
    colors: {
      background: "#546a76", // Blue Slate
      surface: "#546a76",
      surfaceSoft: "#88a0a8", // Cool Steel
      accent: "#b4ceb3", // Celadon
      accentSoft: "#fad4d8", // Petal Frost
      border: "#dbd3c9", // Dust Grey
      text: "#fdfdfd",
      textMuted: "#dbd3c9",
    },
  },
  {
    id: "pacific",
    label: "Pacific Circuit",
    colors: {
      background: "#071013", // Ink Black
      surface: "#071013",
      surfaceSoft: "#23b5d3", // Turquoise Surf
      accent: "#75abbc", // Pacific Blue
      accentSoft: "#dfe0e2", // Alabaster Grey
      border: "#a2aebb", // Cool Steel
      text: "#fdfdfd",
      textMuted: "#a2aebb",
    },
  },
  {
    id: "evergreen-copper",
    label: "Evergreen & Copper",
    colors: {
      background: "#093824", // Evergreen
      surface: "#093824",
      surfaceSoft: "#c6ccb2", // Ash Grey
      accent: "#bf4e30", // Rosy Copper
      accentSoft: "#ffcd78", // Apricot Cream
      border: "#e5eafa", // Lavender
      text: "#fdfdfd",
      textMuted: "#c6ccb2",
    },
  },
  {
    id: "regal-navy-gold",
    label: "Regal Navy & Gold",
    colors: {
      background: "#000814", // Ink Black
      surface: "#001d3d", // Prussian Blue
      surfaceSoft: "#003566", // Regal Navy
      accent: "#ffc300", // School Bus Yellow
      accentSoft: "#ffd60a", // Gold
      border: "#003566",
      text: "#fdfdfd",
      textMuted: "#a2aebb",
    },
  },
];

const CORE_URL = "http://localhost:8080";

function useWorkspaces() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${CORE_URL}/api/workspaces`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (isMounted) {
          setData(Array.isArray(json) ? json : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

function ChevronMark({ color }) {
  return (
    <Group gap="xs">
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: 18,
          height: 18,
          borderTop: `3px solid ${color}`,
          borderRight: `3px solid ${color}`,
          transform: "rotate(135deg)",
          borderRadius: 4,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: 18,
          height: 18,
          borderBottom: `3px solid ${color}`,
          borderLeft: `3px solid ${color}`,
          transform: "rotate(135deg)",
          borderRadius: 4,
        }}
      />
    </Group>
  );
}

function WorkspaceTable({ workspaces, colors, loading, error }) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader color={colors.accent} />
      </Center>
    );
  }

  if (error) {
    return (
      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          border: `1px solid ${colors.accent}`,
          background: colors.surface,
        }}
      >
        <Text c={colors.accent} fw={500}>
          Could not load workspaces
        </Text>
        <Text size="sm" c={colors.textMuted}>
          {error.message}
        </Text>
      </Paper>
    );
  }

  if (!workspaces.length) {
    return (
      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          border: `1px dashed ${colors.border}`,
          background: colors.surface,
        }}
      >
        <Text c={colors.textMuted}>No workspaces found yet.</Text>
      </Paper>
    );
  }

  const rows = workspaces.map((ws) => (
    <Table.Tr key={ws.id}>
      <Table.Td>
        <Text fw={500}>{ws.tenant?.name ?? "Unknown owner"}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{ws.name}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color="gray" variant="light">
          {ws._count?.nodes ?? 0}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={colors.textMuted}>
          {ws.createdAt
            ? new Date(ws.createdAt).toLocaleString()
            : "Unknown"}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper
      shadow="sm"
      radius="md"
      p="md"
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
      }}
    >
      <Group justify="space-between" mb="sm" align="baseline">
        <div>
          <Text fw={600} c={colors.text}>
            Workspaces
          </Text>
          <Text size="xs" c={colors.textMuted}>
            Fetched from Continuum Core at {CORE_URL}
          </Text>
        </div>
      </Group>
      <Table
        highlightOnHover
        verticalSpacing="sm"
        horizontalSpacing="md"
        withTableBorder
        withColumnBorders
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Owner</Table.Th>
            <Table.Th>Workspace</Table.Th>
            <Table.Th>Nodes</Table.Th>
            <Table.Th>Created</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Paper>
  );
}

export default function App() {
  const [paletteId, setPaletteId] = useState("regal-navy-gold");
  const palette =
    CONTINUUM_PALETTES.find((p) => p.id === paletteId) ||
    CONTINUUM_PALETTES[0];
  const { colors } = palette;

  const { data: workspaces, loading, error } = useWorkspaces();

  return (
    <AppShell
      padding="md"
      header={{ height: 64 }}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <AppShell.Header
        style={{
          background: `linear-gradient(90deg, ${colors.surfaceSoft}, ${colors.surface})`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <ChevronMark color={colors.accent} />
            <div>
              <Title order={4} c={colors.text} style={{ letterSpacing: 0.5 }}>
                Continuum
              </Title>
              <Text size="xs" c={colors.textMuted}>
                Workspace Browser
              </Text>
            </div>
          </Group>
          <Group gap="sm">
            <Text size="sm" c={colors.textMuted}>
              Palette
            </Text>
            <Select
              size="xs"
              value={paletteId}
              onChange={(value) => value && setPaletteId(value)}
              data={CONTINUUM_PALETTES.map((p) => ({
                value: p.id,
                label: p.label,
              }))}
              styles={{
                input: {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.border,
                  color: colors.text,
                },
                dropdown: {
                  backgroundColor: colors.surface,
                },
              }}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="md">
          <Stack gap="md">
            <Paper
              radius="md"
              p="md"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Text size="sm" c={colors.textMuted}>
                This is the first Continuum Surface. Select a palette, then
                browse Owners, Workspaces, and Nodes coming from Continuum
                Core.
              </Text>
            </Paper>

            <WorkspaceTable
              workspaces={workspaces}
              colors={colors}
              loading={loading}
              error={error}
            />
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
