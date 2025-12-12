import React from "react";
import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";

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

type WorkspacesPageProps = {
  workspaces: Workspace[];
  workspacesLoading: boolean;
  workspacesError: string | null;
  selectedWorkspace: Workspace | null;
  nodes: Node[];
  nodesLoading: boolean;
  nodesError: string | null;
  onWorkspaceClick: (workspace: Workspace) => void;
  palette: any;
  TERMS: { tenant: string; tenants: string };
  API_BASE: string;
};

export default function WorkspacesPage({
  workspaces,
  workspacesLoading,
  workspacesError,
  selectedWorkspace,
  nodes,
  nodesLoading,
  nodesError,
  onWorkspaceClick,
  palette,
  TERMS,
  API_BASE,
}: WorkspacesPageProps) {
  return (
    <Stack gap="md">
      {/* Workspaces card */}
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
                {selectedWorkspace.tenant.name} / {selectedWorkspace.name}
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
                  <Table.Th style={{ textAlign: "center" }}>Nodes</Table.Th>
                  <Table.Th>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {workspaces.map((workspace) => {
                  const isSelected = selectedWorkspace?.id === workspace.id;
                  return (
                    <Table.Tr
                      key={workspace.id}
                      onClick={() => onWorkspaceClick(workspace)}
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
                        {new Date(workspace.createdAt).toLocaleString()}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Nodes card */}
      {selectedWorkspace && (
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
                Nodes for {selectedWorkspace.name}
              </Text>
            </Group>

            {nodesLoading && (
              <Group gap="xs">
                <Loader size="sm" />
                <Text size="sm">Loading nodes…</Text>
              </Group>
            )}

            {nodesError && (
              <Text size="sm" c="red.3">
                {nodesError}
              </Text>
            )}

            {!nodesLoading && !nodesError && nodes.length === 0 && (
              <Text size="sm" c={palette.textSoft}>
                This workspace has no nodes yet.
              </Text>
            )}

            {!nodesLoading && !nodesError && nodes.length > 0 && (
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
    </Stack>
  );
}
