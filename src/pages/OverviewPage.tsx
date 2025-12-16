import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Group,
  List,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { Link } from "react-router-dom";

type Node = {
  id: string;
  name: string;
  workspaceId: string;
};

type Document = {
  id: string;
  title: string;
  metadata?: {
    nodeName: string;
    createdAt: string;
  };
  updatedAt: string;
};

type OverviewPageProps = {
  workspaces: Array<{ id: string; name: string; _count?: { nodes: number } }>;
  selectedWorkspace: { id: string; name: string } | null;
  nodes: Node[];
  palette: any;
  API_BASE: string;
};

export default function OverviewPage({
  workspaces,
  selectedWorkspace,
  nodes,
  palette,
  API_BASE,
}: OverviewPageProps) {
  const navigate = useNavigate();
  const [documentsCount, setDocumentsCount] = useState<number | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [recentDocumentsLoading, setRecentDocumentsLoading] = useState(false);

  // Fetch documents count and recent documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setDocumentsLoading(true);
        setRecentDocumentsLoading(true);
        const res = await fetch(`${API_BASE}/api/documents`);
        if (res.ok) {
          const data = (await res.json()) as Document[];
          setDocumentsCount(data.length);
          // Get 5 most recent (already sorted by updatedAt desc from API)
          setRecentDocuments(data.slice(0, 5));
        }
      } catch (err) {
        // Silently fail - documents count is optional
        console.error("Error loading documents:", err);
      } finally {
        setDocumentsLoading(false);
        setRecentDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [API_BASE]);

  const workspacesCount = workspaces.length;
  const nodesCount = selectedWorkspace
    ? nodes.length
    : workspaces.reduce((sum, ws) => sum + (ws._count?.nodes || 0), 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Stack gap="md">
      {/* Summary Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Stack gap={4}>
            <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Workspaces
            </Text>
            <Text fw={700} size="xl" c={palette.text}>
              {workspacesCount}
            </Text>
          </Stack>
        </Paper>

        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Stack gap={4}>
            <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Nodes
            </Text>
            {selectedWorkspace ? (
              <>
                <Text fw={700} size="xl" c={palette.text}>
                  {nodes.length}
                </Text>
                <Text size="xs" c={palette.textSoft}>
                  in {selectedWorkspace.name}
                </Text>
              </>
            ) : nodesCount > 0 ? (
              <Text fw={700} size="xl" c={palette.text}>
                {nodesCount}
              </Text>
            ) : (
              <Text size="sm" c={palette.textSoft}>
                Select a workspace
              </Text>
            )}
          </Stack>
        </Paper>

        {documentsLoading ? (
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
              <Text size="xs" c={palette.textSoft}>
                Loading...
              </Text>
            </Group>
          </Paper>
        ) : documentsCount !== null ? (
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Stack gap={4}>
              <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Documents
              </Text>
              <Text fw={700} size="xl" c={palette.text}>
                {documentsCount}
              </Text>
            </Stack>
          </Paper>
        ) : null}
      </SimpleGrid>

      {/* Main Content Grid */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Left Column */}
        <Stack gap="md">
          {/* Selected Workspace Panel */}
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
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4}>
                    <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Selected Workspace
                    </Text>
                    <Text fw={600} size="lg" c={palette.text}>
                      {selectedWorkspace.name}
                    </Text>
                    <Text size="sm" c={palette.textSoft}>
                      {nodes.length} {nodes.length === 1 ? "node" : "nodes"}
                    </Text>
                  </Stack>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/workspaces")}
                    styles={{
                      root: {
                        borderColor: palette.border,
                        color: palette.text,
                      },
                    }}
                  >
                    Go to Workspace
                  </Button>
                </Group>

                {nodes.length > 0 && (
                  <Stack gap="xs">
                    <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Nodes
                    </Text>
                    <List size="sm" style={{ color: palette.text }}>
                      {nodes.slice(0, 5).map((node) => (
                        <List.Item key={node.id}>
                          <Text
                            size="sm"
                            c={palette.text}
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/nodes/${node.id}`)}
                          >
                            {node.name}
                          </Text>
                        </List.Item>
                      ))}
                      {nodes.length > 5 && (
                        <Text size="xs" c={palette.textSoft} mt="xs">
                          +{nodes.length - 5} more
                        </Text>
                      )}
                    </List>
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}

          {/* Recent Documents */}
          {recentDocumentsLoading ? (
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
                <Text size="sm" c={palette.textSoft}>
                  Loading documents...
                </Text>
              </Group>
            </Paper>
          ) : recentDocuments.length > 0 ? (
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
                  <Text fw={600} size="md" c={palette.text}>
                    Recent Documents
                  </Text>
                  <Button
                    component={Link}
                    to="/documents"
                    size="xs"
                    variant="subtle"
                    styles={{
                      root: {
                        color: palette.accent,
                      },
                    }}
                  >
                    View All
                  </Button>
                </Group>
                <Stack gap="xs">
                  {recentDocuments.map((doc) => (
                    <Paper
                      key={doc.id}
                      p="xs"
                      radius="sm"
                      style={{
                        backgroundColor: palette.background,
                        border: `1px solid ${palette.border}`,
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/documents")}
                    >
                      <Stack gap={2}>
                        <Text size="sm" fw={500} c={palette.text} lineClamp={1}>
                          {doc.title}
                        </Text>
                        <Group gap="xs" justify="space-between">
                          <Text size="xs" c={palette.textSoft}>
                            {doc.metadata?.nodeName || "Unknown node"}
                          </Text>
                          <Text size="xs" c={palette.textSoft}>
                            {formatDate(doc.updatedAt)}
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ) : null}
        </Stack>

        {/* Right Column - Getting Started */}
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
            <Text fw={600} size="md" c={palette.text}>
              Getting Started
            </Text>
            <List size="sm" style={{ color: palette.text }}>
              <List.Item>
                <Link
                  to="/workspaces"
                  style={{ color: palette.accent, textDecoration: "underline" }}
                >
                  Browse Workspaces
                </Link>
              </List.Item>
              <List.Item>
                <Link
                  to="/workspaces"
                  style={{ color: palette.accent, textDecoration: "underline" }}
                >
                  Create a Workspace
                </Link>
              </List.Item>
              <List.Item>
                <Text size="sm" c={palette.text}>
                  Select a Workspace and create Nodes
                </Text>
              </List.Item>
              <List.Item>
                <Link
                  to="/documents"
                  style={{ color: palette.accent, textDecoration: "underline" }}
                >
                  Browse Documents
                </Link>
              </List.Item>
              <List.Item>
                <Link
                  to="/glossary"
                  style={{ color: palette.accent, textDecoration: "underline" }}
                >
                  Read Glossary
                </Link>
              </List.Item>
              <List.Item>
                <Link
                  to="/about"
                  style={{ color: palette.accent, textDecoration: "underline" }}
                >
                  Read About
                </Link>
              </List.Item>
            </List>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}






