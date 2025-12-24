import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import { getTableStyles } from "../ui/tableStyles";
import {
  loadRegistry,
  saveRegistry,
  resetRegistry,
  type ModelDef,
} from "../lib/modelRegistryStore";
import type { ProviderId } from "../config/modelRegistry";

type ModelsPageProps = {
  palette: any;
  API_BASE: string;
};

export default function ModelsPage({ palette, API_BASE }: ModelsPageProps) {
  const [models, setModels] = useState<ModelDef[]>([]);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [newModel, setNewModel] = useState<Partial<ModelDef>>({
    id: "",
    label: "",
    provider: "openai",
    family: "",
    notes: "",
    enabled: true,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    refreshModels();
  }, []);

  const refreshModels = () => {
    const registry = loadRegistry();
    setModels(registry);
  };

  const handleToggleEnabled = (modelId: string) => {
    const updated = models.map((m) =>
      m.id === modelId ? { ...m, enabled: !m.enabled } : m
    );
    setModels(updated);
    saveRegistry(updated);
  };

  const handleReset = () => {
    const defaults = resetRegistry();
    setModels(defaults);
  };

  const handleAddModel = () => {
    setValidationError(null);

    // Validate
    if (!newModel.id || !newModel.label || !newModel.provider) {
      setValidationError("ID, Label, and Provider are required");
      return;
    }

    // Check for duplicate ID
    if (models.some((m) => m.id === newModel.id)) {
      setValidationError("Model ID already exists");
      return;
    }

    // Add model
    const modelToAdd: ModelDef = {
      id: newModel.id!,
      label: newModel.label!,
      provider: newModel.provider as ProviderId,
      family: newModel.family || undefined,
      notes: newModel.notes || undefined,
      enabled: newModel.enabled ?? true,
    };

    const updated = [...models, modelToAdd];
    setModels(updated);
    saveRegistry(updated);
    setAddModalOpened(false);
    setNewModel({
      id: "",
      label: "",
      provider: "openai",
      family: "",
      notes: "",
      enabled: true,
    });
  };

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case "openai":
        return "green";
      case "anthropic":
        return "purple";
      case "google":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Models"
        subtitle="Configure LLM providers and model options"
        palette={palette}
        right={
          <Group gap="xs">
            <Button
              leftSection={<Icons.Refresh size={16} />}
              onClick={handleReset}
              size="sm"
              variant="subtle"
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              leftSection={<Icons.Add size={16} />}
              onClick={() => setAddModalOpened(true)}
              size="sm"
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Add Model
            </Button>
          </Group>
        }
      />

      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
        }}
      >
        <Table
          withTableBorder
          withColumnBorders
          style={{ tableLayout: "fixed", width: "100%" }}
          styles={getTableStyles(palette)}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "15%" }}>Provider</Table.Th>
              <Table.Th style={{ width: "25%" }}>Label</Table.Th>
              <Table.Th style={{ width: "20%" }}>Internal ID</Table.Th>
              <Table.Th style={{ width: "15%" }}>Family</Table.Th>
              <Table.Th style={{ width: "10%", textAlign: "center" }}>
                Enabled
              </Table.Th>
              <Table.Th style={{ width: "15%" }}>Notes</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {models.map((model) => (
              <Table.Tr key={model.id}>
                <Table.Td style={{ width: "15%" }}>
                  <Badge
                    color={getProviderBadgeColor(model.provider)}
                    variant="light"
                    size="sm"
                  >
                    {model.provider}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ width: "25%" }}>
                  <Text size="sm" fw={500} c={palette.text}>
                    {model.label}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: "20%" }}>
                  <Text size="sm" c={palette.text} style={{ fontFamily: "monospace" }}>
                    {model.id}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: "15%" }}>
                  <Text size="sm" c={palette.textSoft}>
                    {model.family || "-"}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: "10%", textAlign: "center" }}>
                  <Switch
                    checked={model.enabled}
                    onChange={() => handleToggleEnabled(model.id)}
                    size="sm"
                    styles={{
                      track: {
                        backgroundColor: model.enabled
                          ? palette.accent
                          : palette.border,
                      },
                    }}
                  />
                </Table.Td>
                <Table.Td style={{ width: "15%" }}>
                  <Text size="xs" c={palette.textSoft} lineClamp={2}>
                    {model.notes || "-"}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Add Model Modal */}
      <Modal
        opened={addModalOpened}
        onClose={() => {
          setAddModalOpened(false);
          setValidationError(null);
          setNewModel({
            id: "",
            label: "",
            provider: "openai",
            family: "",
            notes: "",
            enabled: true,
          });
        }}
        title="Add Model"
        styles={{
          title: { color: palette.text },
          content: {
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          },
          body: { backgroundColor: palette.surface },
        }}
      >
        <Stack gap="md">
          <TextInput
            label="Internal ID *"
            placeholder="e.g., gpt-5.2"
            value={newModel.id || ""}
            onChange={(e) => setNewModel({ ...newModel, id: e.target.value })}
            required
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          <TextInput
            label="Label *"
            placeholder="e.g., GPT-5.2"
            value={newModel.label || ""}
            onChange={(e) => setNewModel({ ...newModel, label: e.target.value })}
            required
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          <TextInput
            label="Provider *"
            placeholder="openai, anthropic, or google"
            value={newModel.provider || ""}
            onChange={(e) =>
              setNewModel({ ...newModel, provider: e.target.value as ProviderId })
            }
            required
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          <TextInput
            label="Family (optional)"
            placeholder="e.g., GPT-5.2"
            value={newModel.family || ""}
            onChange={(e) => setNewModel({ ...newModel, family: e.target.value })}
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          <TextInput
            label="Notes (optional)"
            placeholder="Additional information"
            value={newModel.notes || ""}
            onChange={(e) => setNewModel({ ...newModel, notes: e.target.value })}
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          {validationError && (
            <Text size="sm" c="red">
              {validationError}
            </Text>
          )}
          <Group justify="flex-end">
            <Button
              onClick={() => {
                setAddModalOpened(false);
                setValidationError(null);
                setNewModel({
                  id: "",
                  label: "",
                  provider: "openai",
                  family: "",
                  notes: "",
                  enabled: true,
                });
              }}
              variant="subtle"
              styles={{
                root: { color: palette.text },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddModel}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Add
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}




