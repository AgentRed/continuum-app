import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import GlossaryTextWrapper from "../components/GlossaryTextWrapper";

type Document = {
  id: string;
  title: string;
  type: string;
  source: string;
  updatedAt: string;
  ragReady?: boolean;
  isGovernance?: boolean;
  content?: string;
  metadata?: {
    version: string;
    nodeId: string;
    nodeName: string;
    createdAt: string;
  };
};

type DocumentViewPageProps = {
  palette: any;
  API_BASE: string;
};

export default function DocumentViewPage({
  palette,
  API_BASE,
}: DocumentViewPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [governing, setGoverning] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setError("No document ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/documents/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as Document;
        setDocument(data);
      } catch (err: any) {
        console.error("Error loading document", err);
        setError(err?.message ?? "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, API_BASE]);

  const handleMarkAsGoverned = async () => {
    if (!document || governing) return;

    try {
      setGoverning(true);

      const res = await fetch(
        `${API_BASE}/api/documents/${document.id}/govern`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const updatedDocument = (await res.json()) as Document;
      setDocument(updatedDocument);

      notifications.show({
        title: "Document governed",
        message: `"${updatedDocument.title}" is now governed.`,
        color: "green",
      });
    } catch (err: any) {
      console.error("Error marking document as governed", err);
      notifications.show({
        title: "Failed to govern",
        message:
          err?.message ??
          "Failed to mark document as governed. Please try again.",
        color: "red",
      });
    } finally {
      setGoverning(false);
    }
  };

  const handleUngovern = async () => {
    if (!document || governing) return;

    try {
      setGoverning(true);

      const res = await fetch(
        `${API_BASE}/api/documents/${document.id}/governance`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isGovernance: false }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
      }

      const updatedDocument = (await res.json()) as Document;
      setDocument(updatedDocument);

      notifications.show({
        title: "Document ungoverned",
        message: `"${updatedDocument.title}" is now ungoverned.`,
        color: "green",
      });
    } catch (err: any) {
      console.error("Error ungoverning document", err);
      notifications.show({
        title: "Failed to ungovern",
        message:
          err?.message ??
          "Failed to ungovern document. Please try again.",
        color: "red",
      });
    } finally {
      setGoverning(false);
    }
  };

  if (loading) {
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
        <Group gap="xs">
          <Loader size="sm" />
          <Text size="sm">Loading document…</Text>
        </Group>
      </Paper>
    );
  }

  if (error || !document) {
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
        <Stack gap="xs">
          <Text size="sm" c="red.3">
            {error || "Document not found"}
          </Text>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/documents")}
            size="sm"
            variant="subtle"
            styles={{
              root: {
                color: palette.text,
              },
            }}
          >
            Back to Documents
          </Button>
        </Stack>
      </Paper>
    );
  }

  // Dev: Log to confirm document reader is rendering
  useEffect(() => {
    if (document) {
      console.log("[DocumentReader] Rendering document:", document.id, "Full-width layout enabled");
    }
  }, [document]);

  return (
    <Box 
      className="documentReader"
      data-testid="document-reader"
      w="100%" 
      style={{ 
        flex: 1, 
        minWidth: 0, 
        width: "100%", 
        maxWidth: "none" 
      }}
    >
      <Stack gap="md" style={{ width: "100%", maxWidth: "none" }}>
        {/* Header */}
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
              <Group gap="md">
                <Button
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => navigate("/documents")}
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
                <Stack gap={4}>
                  <Text fw={700} size="xl" c={palette.text}>
                    {document.title}
                  </Text>
                  <Text size="sm" c={palette.textSoft}>
                    {document.metadata?.nodeName || document.source || "—"}
                  </Text>
                </Stack>
              </Group>
              <Badge
                color={document.isGovernance ? "yellow" : "gray"}
                variant="filled"
                size="lg"
              >
                {document.isGovernance ? "Governed" : "Draft"}
              </Badge>
            </Group>

            {/* Governance Control */}
            <Group gap="xs" align="center">
              {!document.isGovernance ? (
                <Button
                  onClick={handleMarkAsGoverned}
                  disabled={governing}
                  loading={governing}
                  styles={{
                    root: {
                      backgroundColor: palette.accent,
                      color: palette.background,
                    },
                  }}
                >
                  Mark as Governed
                </Button>
              ) : (
                <Button
                  onClick={handleUngovern}
                  disabled={governing}
                  loading={governing}
                  variant="outline"
                  color="orange"
                  styles={{
                    root: {
                      borderColor: palette.accent,
                      color: palette.accent,
                    },
                  }}
                >
                  Ungovern
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>

        {/* Content */}
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
            width: "100%",
            maxWidth: "none",
          }}
        >
          {document.content ? (
            <TypographyStylesProvider>
              <div
                className="documentReader-content"
                style={{
                  color: palette.text,
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children, ...props }) => {
                      const processChildren = (
                        nodes: React.ReactNode
                      ): React.ReactNode => {
                        return React.Children.map(nodes, (child, index) => {
                          if (typeof child === "string") {
                            return (
                              <GlossaryTextWrapper
                                key={`p-text-${index}`}
                                text={child}
                                palette={palette}
                              />
                            );
                          }
                          if (React.isValidElement(child)) {
                            if (child.type === "code" || child.type === "pre") {
                              return child;
                            }
                            const childProps = child.props as {
                              children?: React.ReactNode;
                            };
                            if (childProps?.children) {
                              return React.cloneElement(
                                child,
                                { key: child.key || `p-child-${index}` },
                                processChildren(childProps.children)
                              );
                            }
                          }
                          return child;
                        });
                      };
                      return <p {...props}>{processChildren(children)}</p>;
                    },
                    li: ({ children, ...props }) => {
                      const processChildren = (
                        nodes: React.ReactNode
                      ): React.ReactNode => {
                        return React.Children.map(nodes, (child, index) => {
                          if (typeof child === "string") {
                            return (
                              <GlossaryTextWrapper
                                key={`li-text-${index}`}
                                text={child}
                                palette={palette}
                              />
                            );
                          }
                          if (React.isValidElement(child)) {
                            if (child.type === "code" || child.type === "pre") {
                              return child;
                            }
                            const childProps = child.props as {
                              children?: React.ReactNode;
                            };
                            if (childProps?.children) {
                              return React.cloneElement(
                                child,
                                { key: child.key || `li-child-${index}` },
                                processChildren(childProps.children)
                              );
                            }
                          }
                          return child;
                        });
                      };
                      return <li {...props}>{processChildren(children)}</li>;
                    },
                    code: ({ children, ...props }) => (
                      <code
                        {...props}
                        style={{
                          fontFamily: "monospace",
                          backgroundColor: palette.header,
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontSize: "0.9em",
                        }}
                      >
                        {children}
                      </code>
                    ),
                    pre: ({ children, ...props }) => (
                      <pre
                        {...props}
                        style={{
                          fontFamily: "monospace",
                          backgroundColor: palette.header,
                          padding: "16px",
                          borderRadius: "6px",
                          overflowX: "auto",
                          fontSize: "0.9em",
                          lineHeight: 1.6,
                        }}
                      >
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {document.content}
                </ReactMarkdown>
              </div>
            </TypographyStylesProvider>
          ) : (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              No content
            </Text>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}



