import React, { useEffect, useState } from "react";
import {
  Group,
  Loader,
  Paper,
  Select,
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

type NodesPageProps = {
  workspaces: Workspace[];
  palette: any;
  API_BASE: string;
};

export default function NodesPage({
  workspaces,
  palette,
  API_BASE,
}: NodesPageProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null
  );
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodesError, setNodesError] = useState<string | null>(null);

  // Fetch all nodes or filtered by workspace
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setNodesLoading(true);
        setNodesError(null);

        const url = selectedWorkspaceId
          ? `${API_BASE}/api/nodes?workspaceId=${encodeURIComponent(
              selectedWorkspaceId
            )}`
          : `${API_BASE}/api/nodes`;

        const res = await fetch(url);
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

    fetchNodes();
  }, [selectedWorkspaceId, API_BASE]);

  const workspaceOptions = [
    { value: "", label: "All Workspaces" },
    ...workspaces.map((ws) => ({
      value: ws.id,
      label: `${ws.tenant.name} / ${ws.name}`,
    })),
  ];

  return (
    <Paper
      shadow="sm"
      p="md"
      radius="md"
      style={{
        backgroundColor: palette.surface,
        border: `1px solid ${palette.border}`,
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={600} size="lg">
            Node Explorer
          </Text>
          <Select
            placeholder="Filter by workspace"
            value={selectedWorkspaceId || ""}
            onChange={(value) => setSelectedWorkspaceId(value || null)}
            data={workspaceOptions}
            clearable
            size="sm"
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
              },
              dropdown: {
                backgroundColor: palette.surface,
              },
            }}
          />
        </Group>

        <Text size="sm" c={palette.textSoft}>
          {selectedWorkspaceId
            ? `Showing nodes for selected workspace`
            : "Showing all nodes across all workspaces"}
        </Text>

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
            {selectedWorkspaceId
              ? "This workspace has no nodes yet."
              : "No nodes found."}
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
                <Table.Th>Workspace</Table.Th>
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
                  <Table.Td>{node.workspace.name}</Table.Td>
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
  );
}
