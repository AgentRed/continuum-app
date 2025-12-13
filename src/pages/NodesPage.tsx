import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { displayOwnerName } from "../App";

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
  TERMS: { tenant: string; tenants: string };
  API_BASE: string;
};

const STORAGE_KEY_NODE_ID = "continuum.selectedNodeId";
const STORAGE_KEY_WORKSPACE_ID = "continuum.selectedWorkspaceId";

export default function NodesPage({
  workspaces,
  palette,
  TERMS,
  API_BASE,
}: NodesPageProps) {
  const navigate = useNavigate();
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
      label: `${displayOwnerName(ws.tenant.name)} / ${ws.name}`,
    })),
  ];

  return (
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
          <Text size="sm" c="#ffffff">
            This is the first Continuum Surface. Select a palette, click a
            workspace, and Continuum will fetch its nodes from Continuum
            Core.
          </Text>
          <Text size="xs" c="#ffffff">
            API Base: {API_BASE}
          </Text>
        </Stack>
      </Paper>

      {/* Nodes card */}
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
            <Text fw={600} size="lg" c="#ffffff">
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
                  color: "#ffffff",
                },
                dropdown: {
                  backgroundColor: palette.surface,
                  color: "#ffffff",
                },
                option: {
                  color: "#ffffff",
                },
              }}
            />
          </Group>

          <Text size="xs" c="#ffffff">
            {selectedWorkspaceId
              ? `Showing nodes for selected workspace`
              : "Showing all nodes across all workspaces"}
          </Text>

          {nodesLoading && (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c="#ffffff">Loading nodes…</Text>
            </Group>
          )}

          {nodesError && (
            <Text size="sm" c="red.3">
              {nodesError}
            </Text>
          )}

          {!nodesLoading && !nodesError && nodes.length === 0 && (
            <Text size="sm" c="#ffffff">
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
              style={{ tableLayout: "fixed", width: "100%" }}
              styles={{
                table: {
                  backgroundColor: "transparent",
                  tableLayout: "fixed",
                  width: "100%",
                },
                thead: {
                  "& tr th": {
                    borderRight: `1px solid ${palette.border}`,
                    borderBottom: `1px solid ${palette.border}`,
                  },
                },
                tbody: {
                  "& tr td": {
                    borderRight: `1px solid ${palette.border}`,
                    borderBottom: `1px solid ${palette.border}`,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  "& tr:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1) !important",
                  },
                },
                th: {
                  backgroundColor: palette.header,
                  color: "#ffffff",
                  borderColor: palette.border,
                  fontWeight: 700,
                  overflow: "hidden",
                },
                td: {
                  borderColor: palette.border,
                  color: "#ffffff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "20%" }}>Workspace</Table.Th>
                  <Table.Th style={{ width: "20%" }}>Node</Table.Th>
                  <Table.Th style={{ textAlign: "center", width: "10%" }}>
                    Programs
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", width: "10%" }}>
                    Modules
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", width: "10%" }}>
                    Documents
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", width: "10%" }}>
                    Integrations
                  </Table.Th>
                  <Table.Th style={{ width: "20%", whiteSpace: "nowrap" }}>
                    Created
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {nodes.map((node) => (
                  <Table.Tr
                    key={node.id}
                    onClick={() => {
                      // Save selectedNodeId to localStorage
                      try {
                        localStorage.setItem(STORAGE_KEY_NODE_ID, node.id);
                        if (node.workspaceId) {
                          localStorage.setItem(STORAGE_KEY_WORKSPACE_ID, node.workspaceId);
                        }
                      } catch (e) {
                        console.error("Error saving node selection to localStorage:", e);
                      }
                      // Navigate to documents page
                      navigate("/documents");
                    }}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <Table.Td style={{ width: "20%" }}>
                      <Text size="sm" lineClamp={1} c="#ffffff">
                        {node.workspace.name}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "20%" }}>
                      <Text fw={500} size="sm" lineClamp={1} c="#ffffff">
                        {node.name}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center", width: "10%", color: "#ffffff" }}>
                      {node._count.programs}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center", width: "10%", color: "#ffffff" }}>
                      {node._count.modules}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center", width: "10%", color: "#ffffff" }}>
                      {node._count.documents}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center", width: "10%", color: "#ffffff" }}>
                      {node._count.integrations}
                    </Table.Td>
                    <Table.Td style={{ width: "20%" }}>
                      <Text size="xs" lineClamp={1} c="#ffffff">
                        {new Date(node.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}







