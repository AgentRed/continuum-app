import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  Switch,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import PageHeaderCard from "../ui/PageHeaderCard";
import { loadModelRegistry, clearModelRegistryCache } from "../lib/modelRegistryLoader";
import type { ModelRegistry } from "../lib/modelRegistryLoader";
import type { ModelDefinition } from "../types/ModelDefinition";

type ModelRegistryPageProps = {
  palette: any;
  API_BASE: string;
};

export default function ModelRegistryPage({ palette, API_BASE }: ModelRegistryPageProps) {
  const navigate = useNavigate();
  const [registry, setRegistry] = useState<ModelRegistry | null>(null);
  const [source, setSource] = useState<"canonical" | "local">("local");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    loadRegistry();
  }, [API_BASE]);

  const loadRegistry = async () => {
    try {
      setLoading(true);
      setError(null);
      clearModelRegistryCache();
      const result = await loadModelRegistry(API_BASE);
      setRegistry(result.registry);
      setSource(result.source);
      setError(result.error);
      setJsonText(JSON.stringify(result.registry, null, 2));
    } catch (err: any) {
      console.error("Error loading registry:", err);
      setError(err?.message || "Failed to load model registry");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCanonical = () => {
    // Navigate to canonical document editor
    navigate("/canonical-documents/continuum-llm-model-registry.md");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "deprecated":
        return "yellow";
      case "experimental":
        return "blue";
      default:
        return "gray";
    }
  };

  const filteredModels = registry?.models.filter(
    (m) => showAllStatuses || m.status === "active"
  ) || [];

  const modelsByProvider = filteredModels.reduce((acc, model) => {
    if (!acc[model.providerId]) {
      acc[model.providerId] = [];
    }
    acc[model.providerId].push(model);
    return acc;
  }, {} as Record<string, ModelDefinition[]>);

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Model Registry"
        subtitle="Manage LLM models and providers"
        palette={palette}
        right={
          <Button
            leftSection={<span>↻</span>}
            onClick={loadRegistry}
            size="sm"
            variant="subtle"
            styles={{
              root: { color: palette.text },
            }}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert color="yellow" title="Warning">
          {error}
        </Alert>
      )}

      {loading ? (
        <Text size="sm" c={palette.textSoft}>
          Loading registry...
        </Text>
      ) : (
        <>
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600} size="md" c={palette.text}>
                  Registry Source
                </Text>
                <Badge color={source === "canonical" ? "green" : "yellow"}>
                  {source === "canonical" ? "Canonical Document" : "Local Fallback"}
                </Badge>
              </Group>

              {source === "canonical" ? (
                <Group>
                  <Button
                    onClick={handleEditCanonical}
                    size="sm"
                    styles={{
                      root: {
                        backgroundColor: palette.accent,
                        color: palette.background,
                      },
                    }}
                  >
                    Edit Canonical Registry
                  </Button>
                  <Text size="sm" c={palette.textSoft}>
                    Registry is managed via canonical document. Click to edit.
                  </Text>
                </Group>
              ) : (
                <Alert color="yellow" title="Local Registry">
                  Using local default registry. Add canonical document
                  "continuum-llm-model-registry.md" to manage in Continuum.
                </Alert>
              )}
            </Stack>
          </Paper>

          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600} size="md" c={palette.text}>
                  Models
                </Text>
                <Group gap="md">
                  <Switch
                    label="Show all statuses"
                    checked={showAllStatuses}
                    onChange={(e) => setShowAllStatuses(e.currentTarget.checked)}
                    styles={{
                      label: { color: palette.text },
                    }}
                  />
                </Group>
              </Group>

              {Object.entries(modelsByProvider).map(([providerId, models]) => {
                const provider = registry?.providers.find((p) => p.id === providerId);
                return (
                  <Stack key={providerId} gap="xs">
                    <Text fw={600} size="sm" c={palette.text}>
                      {provider?.displayName || providerId}
                    </Text>
                    <Table
                      styles={{
                        root: { color: palette.text },
                        th: { color: palette.text, borderBottomColor: palette.border },
                        td: { color: palette.text, borderBottomColor: palette.border },
                      }}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Display Name</Table.Th>
                          <Table.Th>ID</Table.Th>
                          <Table.Th>API Model</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>Capabilities</Table.Th>
                          <Table.Th>Notes</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {models.map((model) => (
                          <Table.Tr key={model.id}>
                            <Table.Td>{model.displayName}</Table.Td>
                            <Table.Td>
                              <Text size="xs" c={palette.textSoft} style={{ fontFamily: "var(--font-mono)" }}>
                                {model.id}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" c={palette.textSoft} style={{ fontFamily: "var(--font-mono)" }}>
                                {model.apiModelName || "-"}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={getStatusColor(model.status)} size="sm">
                                {model.status}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                {model.capabilities.map((cap) => (
                                  <Badge key={cap} size="xs" variant="light" color="gray">
                                    {cap}
                                  </Badge>
                                ))}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" c={palette.textSoft}>
                                {model.notes || "-"}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>

          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Stack gap="md">
              <Text fw={600} size="md" c={palette.text}>
                Registry JSON
              </Text>
              <Text size="sm" c={palette.textSoft}>
                Copy/paste this JSON to edit the registry. For canonical documents, edit via the
                document editor.
              </Text>
              <Textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                minRows={20}
                styles={{
                  input: {
                    backgroundColor: palette.background,
                    color: palette.text,
                    borderColor: palette.border,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.875rem",
                  },
                }}
              />
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}





