import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Group,
  List,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import PageHeaderCard from "../ui/PageHeaderCard";
import { listProposals, type Proposal } from "../lib/proposalsApi";
import { fetchAuditContent, type AuditResponse } from "../lib/auditApi";

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

type Workspace = {
  id: string;
  name: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
  };
  _count?: {
    nodes: number;
  };
  updatedAt?: string;
  readiness?: string;
  aiMode?: string;
  warnings?: string[];
  reasons?: string[];
};

type OverviewPageProps = {
  workspaces: Workspace[];
  selectedWorkspace: { id: string; name: string } | null;
  nodes: Node[];
  palette: any;
  API_BASE: string;
  TERMS?: { tenant: string; tenants: string };
};

export default function OverviewPage({
  workspaces,
  selectedWorkspace,
  nodes,
  palette,
  API_BASE,
  TERMS = { tenant: "Owner", tenants: "Owners" },
}: OverviewPageProps) {
  const navigate = useNavigate();
  const [documentsCount, setDocumentsCount] = useState<number | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [recentDocumentsLoading, setRecentDocumentsLoading] = useState(false);
  const [workspacesData, setWorkspacesData] = useState<Workspace[]>([]);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [canonicalDocs, setCanonicalDocs] = useState<any[]>([]);
  const [canonicalDocsLoading, setCanonicalDocsLoading] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Fetch workspaces for cards
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setWorkspacesLoading(true);
        const res = await fetch(`${API_BASE}/api/workspaces`);
        if (res.ok) {
          const data = (await res.json()) as Workspace[];
          // Sort by updatedAt desc, limit to 6
          const sorted = [...data].sort((a, b) => {
            const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return bTime - aTime;
          });
          setWorkspacesData(sorted.slice(0, 6));
        }
      } catch (err) {
        console.error("Error loading workspaces:", err);
      } finally {
        setWorkspacesLoading(false);
      }
    };

    fetchWorkspaces();
  }, [API_BASE]);

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

  // Fetch canonical documents
  useEffect(() => {
    const fetchCanonicalDocs = async () => {
      try {
        setCanonicalDocsLoading(true);
        const res = await fetch(`${API_BASE}/api/canonical-documents`);
        if (res.ok) {
          const data = await res.json();
          setCanonicalDocs(data);
        }
      } catch (err) {
        console.error("Error loading canonical documents:", err);
      } finally {
        setCanonicalDocsLoading(false);
      }
    };

    fetchCanonicalDocs();
  }, [API_BASE]);

  // Fetch proposals
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setProposalsLoading(true);
        const data = await listProposals(API_BASE);
        setProposals(data);
      } catch (err) {
        console.error("Error loading proposals:", err);
      } finally {
        setProposalsLoading(false);
      }
    };

    fetchProposals();
  }, [API_BASE]);

  // Fetch audit content
  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setAuditLoading(true);
        setAuditError(null);
        const data = await fetchAuditContent(API_BASE);
        setAuditData(data);
      } catch (err: any) {
        console.error("Error loading audit content:", err);
        setAuditError(err?.message || "Audit endpoint not available");
      } finally {
        setAuditLoading(false);
      }
    };

    fetchAudit();
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

  const displayOwnerName = (name: string | null | undefined): string => {
    if (!name) return TERMS.tenant;
    return name === "Continuum Systems" ? "Continuum" : name;
  };

  return (
    <Stack gap="md">
      {/* Header Card */}
      <PageHeaderCard
        title="System Overview"
        subtitle="Welcome to Continuum. Manage workspaces, nodes, documents, and governance."
        palette={palette}
      />

      {/* Workspace Cards Section */}
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
              Workspaces
            </Text>
            <Button
              component={Link}
              to="/workspaces"
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
          {workspacesLoading ? (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c={palette.textSoft}>
                Loading workspaces...
              </Text>
            </Group>
          ) : workspacesData.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {workspacesData.map((workspace) => (
                <Card
                  key={workspace.id}
                  shadow="sm"
                  padding="md"
                  radius="md"
                  style={{
                    backgroundColor: palette.background,
                    border: `1px solid ${palette.border}`,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/workspaces`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = palette.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = palette.border;
                  }}
                >
                  <Stack gap="xs">
                    <Text fw={600} size="sm" c={palette.text} lineClamp={1}>
                      {workspace.name}
                    </Text>
                    <Group gap="xs" justify="space-between">
                      <Text size="xs" c={palette.textSoft}>
                        {displayOwnerName(workspace.tenant?.name)} • {workspace._count?.nodes || 0} nodes
                      </Text>
                    </Group>
                    {(workspace.readiness || workspace.aiMode) && (
                      <Group gap="xs">
                        {workspace.readiness && (
                          <Badge size="xs" variant="light" color={workspace.readiness === "READY" ? "green" : "yellow"}>
                            {workspace.readiness}
                          </Badge>
                        )}
                        {workspace.aiMode && (
                          <Badge size="xs" variant="light" color="blue">
                            {workspace.aiMode}
                          </Badge>
                        )}
                      </Group>
                    )}
                    {(() => {
                      const signalCount = 
                        (workspace.warnings?.length || 0) + 
                        (workspace.reasons?.length || 0);
                      return signalCount > 0 ? (
                        <Badge size="xs" variant="light" color="orange">
                          Signals: {signalCount}
                        </Badge>
                      ) : null;
                    })()}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text size="sm" c={palette.textSoft}>
              No workspaces found.
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Governance Card */}
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
            Governance
          </Text>
          {canonicalDocsLoading || proposalsLoading ? (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c={palette.textSoft}>
                Loading...
              </Text>
            </Group>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Canonical Docs
                </Text>
                <Text fw={700} size="xl" c={palette.text}>
                  {canonicalDocs.length}
                </Text>
                <Group gap="xs">
                  <Text size="xs" c={palette.textSoft}>
                    Governed: {canonicalDocs.filter((d: any) => d.governed).length}
                  </Text>
                  <Text size="xs" c={palette.textSoft}>
                    Standard: {canonicalDocs.filter((d: any) => !d.governed).length}
                  </Text>
                </Group>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Proposals
                </Text>
                <Group gap="xs">
                  <Text size="sm" c={palette.text}>
                    DRAFT: {proposals.filter((p) => p.status === "DRAFT").length}
                  </Text>
                  <Text size="sm" c={palette.text}>
                    SUBMITTED: {proposals.filter((p) => p.status === "SUBMITTED").length}
                  </Text>
                  <Text size="sm" c={palette.text}>
                    APPROVED: {proposals.filter((p) => p.status === "APPROVED").length}
                  </Text>
                </Group>
              </Stack>
            </SimpleGrid>
          )}
        </Stack>
      </Paper>

      {/* Content Health Card */}
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
            Content Health
          </Text>
          {auditLoading ? (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c={palette.textSoft}>
                Loading audit data...
              </Text>
            </Group>
          ) : auditError ? (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              {auditError}
            </Text>
          ) : auditData ? (
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  OK
                </Text>
                <Text fw={700} size="xl" c="green">
                  {auditData.summary.ok}
                </Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  WARN
                </Text>
                <Text fw={700} size="xl" c="yellow">
                  {auditData.summary.warn}
                </Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  FAIL
                </Text>
                <Text fw={700} size="xl" c="red">
                  {auditData.summary.fail}
                </Text>
              </Stack>
            </SimpleGrid>
          ) : null}
        </Stack>
      </Paper>

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
                  to="/whitepapers"
                  style={{ color: palette.accent, textDecoration: "underline" }}
                >
                  Read Whitepapers
                </Link>
              </List.Item>
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















