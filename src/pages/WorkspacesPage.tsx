import React, { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

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
  onRefreshWorkspaces: () => Promise<void>;
  onRefreshNodes?: () => Promise<void>;
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
  onRefreshWorkspaces,
  onRefreshNodes,
  palette,
  TERMS,
  API_BASE,
}: WorkspacesPageProps) {
  // Extract unique owners from workspaces
  const owners = Array.from(
    new Map(workspaces.map((ws) => [ws.tenant.id, ws.tenant])).values()
  );
  const hasSingleOwner = owners.length === 1;
  const defaultOwnerId = hasSingleOwner ? owners[0].id : null;

  // Create Workspace modal state
  const [createWorkspaceOpened, setCreateWorkspaceOpened] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(
    defaultOwnerId
  );
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [workspaceCreateError, setWorkspaceCreateError] = useState<
    string | null
  >(null);

  // Create Node modal state
  const [createNodeOpened, setCreateNodeOpened] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [creatingNode, setCreatingNode] = useState(false);
  const [nodeCreateError, setNodeCreateError] = useState<string | null>(null);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim() || !selectedOwnerId) {
      return;
    }

    setCreatingWorkspace(true);
    setWorkspaceCreateError(null);

    try {
      const res = await fetch(`${API_BASE}/api/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId: selectedOwnerId,
          name: workspaceName.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${res.status}: Failed to create workspace`
        );
      }

      // Refresh workspaces list
      await onRefreshWorkspaces();
      setCreateWorkspaceOpened(false);
      setWorkspaceName("");
      setSelectedOwnerId(defaultOwnerId);
    } catch (err: any) {
      console.error("Error creating workspace", err);
      setWorkspaceCreateError(err?.message ?? "Failed to create workspace");
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleCreateNode = async () => {
    if (!nodeName.trim() || !selectedWorkspace) {
      return;
    }

    setCreatingNode(true);
    setNodeCreateError(null);

    try {
      const res = await fetch(`${API_BASE}/api/nodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspace.id,
          name: nodeName.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${res.status}: Failed to create node`
        );
      }

      // Refresh nodes list
      if (onRefreshNodes) {
        await onRefreshNodes();
      }
      setCreateNodeOpened(false);
      setNodeName("");
    } catch (err: any) {
      console.error("Error creating node", err);
      setNodeCreateError(err?.message ?? "Failed to create node");
    } finally {
      setCreatingNode(false);
    }
  };

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
            <Group gap="xs">
              {selectedWorkspace && (
                <Badge color="yellow" variant="light">
                  {selectedWorkspace.tenant.name} / {selectedWorkspace.name}
                </Badge>
              )}
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setCreateWorkspaceOpened(true)}
                size="sm"
                styles={{
                  root: {
                    backgroundColor: palette.accent,
                    color: palette.background,
                  },
                }}
              >
                Create Workspace
              </Button>
            </Group>
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
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setCreateNodeOpened(true)}
                size="sm"
                disabled={!selectedWorkspace}
                styles={{
                  root: {
                    backgroundColor: palette.accent,
                    color: palette.background,
                  },
                }}
              >
                Create Node
              </Button>
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

      {/* Create Workspace Modal */}
      <Modal
        opened={createWorkspaceOpened}
        onClose={() => {
          setCreateWorkspaceOpened(false);
          setWorkspaceName("");
          setSelectedOwnerId(defaultOwnerId);
          setWorkspaceCreateError(null);
        }}
        title="Create Workspace"
        styles={{
          content: {
            backgroundColor: palette.surface,
            color: palette.text,
          },
          header: {
            backgroundColor: palette.header,
            color: palette.text,
          },
        }}
      >
        <Stack gap="md">
          {workspaceCreateError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {workspaceCreateError}
            </Alert>
          )}

          {!hasSingleOwner && (
            <Select
              label="Owner"
              placeholder="Select an owner"
              value={selectedOwnerId}
              onChange={(value) => setSelectedOwnerId(value)}
              data={owners.map((owner) => ({
                value: owner.id,
                label: owner.name,
              }))}
              required
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
          )}

          <TextInput
            label="Workspace Name"
            placeholder="Enter workspace name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            required
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
              },
            }}
          />

          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              onClick={() => {
                setCreateWorkspaceOpened(false);
                setWorkspaceName("");
                setSelectedOwnerId(defaultOwnerId);
                setWorkspaceCreateError(null);
              }}
              disabled={creatingWorkspace}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!workspaceName.trim() || !selectedOwnerId || creatingWorkspace}
              loading={creatingWorkspace}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create Node Modal */}
      <Modal
        opened={createNodeOpened}
        onClose={() => {
          setCreateNodeOpened(false);
          setNodeName("");
          setNodeCreateError(null);
        }}
        title="Create Node"
        styles={{
          content: {
            backgroundColor: palette.surface,
            color: palette.text,
          },
          header: {
            backgroundColor: palette.header,
            color: palette.text,
          },
        }}
      >
        <Stack gap="md">
          {nodeCreateError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {nodeCreateError}
            </Alert>
          )}

          {selectedWorkspace && (
            <Text size="sm" c={palette.textSoft}>
              Workspace: {selectedWorkspace.name}
            </Text>
          )}

          <TextInput
            label="Node Name"
            placeholder="Enter node name"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            required
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
              },
            }}
          />

          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              onClick={() => {
                setCreateNodeOpened(false);
                setNodeName("");
                setNodeCreateError(null);
              }}
              disabled={creatingNode}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNode}
              disabled={!nodeName.trim() || !selectedWorkspace || creatingNode}
              loading={creatingNode}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
