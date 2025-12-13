import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Button,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { displayOwnerName } from "../App";

type Node = {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: string;
    name: string;
    tenant?: {
      id: string;
      name: string;
    };
  };
  _count: {
    programs: number;
    modules: number;
    documents: number;
    integrations: number;
  };
};

type NodeDetailPageProps = {
  palette: any;
  API_BASE: string;
};

export default function NodeDetailPage({
  palette,
  API_BASE,
}: NodeDetailPageProps) {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNode = async () => {
      if (!nodeId) {
        setError("No node ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch by ID first, if that fails, fetch all and filter
        let res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
        
        if (!res.ok && res.status === 404) {
          // If endpoint doesn't exist, fetch all nodes and find the one we need
          res = await fetch(`${API_BASE}/api/nodes`);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const allNodes = (await res.json()) as Node[];
          const foundNode = allNodes.find((n) => n.id === nodeId);
          if (!foundNode) {
            throw new Error("Node not found");
          }
          setNode(foundNode);
        } else if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        } else {
          const data = (await res.json()) as Node;
          setNode(data);
        }
      } catch (err: any) {
        console.error("Error loading node", err);
        setError(err?.message ?? "Failed to load node");
      } finally {
        setLoading(false);
      }
    };

    fetchNode();
  }, [nodeId, API_BASE]);

  if (loading) {
    return (
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
          <Group gap="xs">
            <Loader size="sm" />
            <Text size="sm">Loading node…</Text>
          </Group>
        </Paper>
      </Stack>
    );
  }

  if (error || !node) {
    return (
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
            <Text size="sm" c="red.3">
              {error || "Node not found"}
            </Text>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/nodes")}
              size="sm"
              variant="subtle"
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Back to Nodes
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

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
          <Text size="sm" c={palette.textSoft}>
            This is the first Continuum Surface. Select a palette, click a
            workspace, and Continuum will fetch its nodes from Continuum Core.
          </Text>
          <Text size="xs" c={palette.textSoft}>
            API Base: {API_BASE}
          </Text>
        </Stack>
      </Paper>

      {/* Node Header */}
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
            <Group gap="xs">
              <Button
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate("/nodes")}
                size="sm"
                variant="subtle"
                styles={{
                  root: {
                    color: palette.text,
                  },
                }}
              >
                Back
              </Button>
              <Text fw={700} size="xl" c={palette.text}>
                {node.name}
              </Text>
            </Group>
          </Group>

          <Group gap="md">
            <Stack gap={4}>
              <Text size="xs" c={palette.textSoft}>
                Workspace
              </Text>
              <Text size="sm" fw={500} c={palette.text}>
                {node.workspace.tenant
                  ? `${displayOwnerName(node.workspace.tenant.name)} / ${node.workspace.name}`
                  : node.workspace.name}
              </Text>
            </Stack>

            <Stack gap={4}>
              <Text size="xs" c={palette.textSoft}>
                Created
              </Text>
              <Text size="sm" c={palette.text}>
                {new Date(node.createdAt).toLocaleString()}
              </Text>
            </Stack>
          </Group>

          <Group gap="md">
            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Programs
                </Text>
                <Text fw={700} size="lg" c={palette.text}>
                  {node._count.programs}
                </Text>
              </Stack>
            </Paper>

            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Modules
                </Text>
                <Text fw={700} size="lg" c={palette.text}>
                  {node._count.modules}
                </Text>
              </Stack>
            </Paper>

            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Documents
                </Text>
                <Text fw={700} size="lg" c={palette.text}>
                  {node._count.documents}
                </Text>
              </Stack>
            </Paper>

            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Integrations
                </Text>
                <Text fw={700} size="lg" c={palette.text}>
                  {node._count.integrations}
                </Text>
              </Stack>
            </Paper>
          </Group>
        </Stack>
      </Paper>

      {/* Programs Section */}
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
            Programs
          </Text>
          <Text size="sm" c={palette.textSoft}>
            No programs yet. Programs will appear here when created.
          </Text>
        </Stack>
      </Paper>

      {/* Documents Section */}
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
            Documents
          </Text>
          <Text size="sm" c={palette.textSoft}>
            No documents yet. Documents will appear here when added.
          </Text>
        </Stack>
      </Paper>

      {/* Integrations Section */}
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
            Integrations
          </Text>
          <Text size="sm" c={palette.textSoft}>
            No integrations yet. Integrations will appear here when configured.
          </Text>
        </Stack>
      </Paper>

      {/* MCP Servers Section */}
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
            MCP Servers
          </Text>
          <Text size="sm" c={palette.textSoft}>
            No MCP servers yet. MCP servers will appear here when created.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}







