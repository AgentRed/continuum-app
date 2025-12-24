import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import {
  loadProviders,
  saveProviders,
  resetProviders,
  DEFAULT_LLM_PROVIDERS,
  type LlmProvider,
  type LlmModel,
} from "../lib/llmRegistry";
import { getTableStyles } from "../ui/tableStyles";

type SettingsPageProps = {
  palette: any;
};

export default function SettingsPage({ palette }: SettingsPageProps) {
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loaded = loadProviders();
    setProviders(loaded);
  }, []);

  const handleAddModel = (providerKey: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.key === providerKey
          ? {
              ...p,
              models: [...p.models, { id: "", label: "" }],
            }
          : p
      )
    );
    setHasChanges(true);
  };

  const handleRemoveModel = (providerKey: string, index: number) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.key === providerKey
          ? {
              ...p,
              models: p.models.filter((_, i) => i !== index),
            }
          : p
      )
    );
    setHasChanges(true);
  };

  const handleModelChange = (
    providerKey: string,
    index: number,
    field: keyof LlmModel,
    value: string | boolean
  ) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.key === providerKey
          ? {
              ...p,
              models: p.models.map((m, i) =>
                i === index ? { ...m, [field]: value } : m
              ),
            }
          : p
      )
    );
    setHasChanges(true);
  };

  const handleToggleRecommended = (providerKey: string, index: number) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.key === providerKey
          ? {
              ...p,
              models: p.models.map((m, i) => {
                if (i === index) {
                  return { ...m, recommended: !m.recommended };
                }
                // Unset recommended for other models in this provider
                if (m.recommended) {
                  return { ...m, recommended: false };
                }
                return m;
              }),
            }
          : p
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    saveProviders(providers);
    setHasChanges(false);
  };

  const handleReset = () => {
    resetProviders();
    setProviders([...DEFAULT_LLM_PROVIDERS]);
    setHasChanges(false);
  };

  const tableStyles = getTableStyles(palette);

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
          <Text fw={600} size="lg" c={palette.text}>
            Settings
          </Text>
          <Text size="sm" c={palette.textSoft}>
            Continuum options and configuration
          </Text>
        </Stack>
      </Paper>

      {/* LLM Providers Section */}
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
          <Group justify="space-between">
            <Text fw={600} size="md" c={palette.text}>
              LLM Providers
            </Text>
            <Group gap="xs">
              <Button
                size="xs"
                variant="subtle"
                onClick={handleReset}
                styles={{
                  root: { color: palette.text },
                }}
              >
                Reset to defaults
              </Button>
              <Button
                size="xs"
                onClick={handleSave}
                disabled={!hasChanges}
                styles={{
                  root: {
                    backgroundColor: palette.accent,
                    color: palette.background,
                  },
                }}
              >
                Save
              </Button>
            </Group>
          </Group>

          <Stack gap="md">
            {providers.map((provider) => (
              <Paper
                key={provider.key}
                p="md"
                radius="md"
                style={{
                  backgroundColor: palette.background,
                  border: `1px solid ${palette.border}`,
                }}
              >
                <Stack gap="md">
                  <Text fw={500} size="sm" c={palette.text}>
                    {provider.label}
                  </Text>

                  <Table
                    styles={tableStyles}
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ width: "40%" }}>Label</Table.Th>
                        <Table.Th style={{ width: "40%" }}>ID</Table.Th>
                        <Table.Th style={{ width: "15%" }}>Recommended</Table.Th>
                        <Table.Th style={{ width: "5%" }}></Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {provider.models.map((model, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>
                            <TextInput
                              value={model.label}
                              onChange={(e) =>
                                handleModelChange(
                                  provider.key,
                                  index,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="Model label"
                              size="xs"
                              styles={{
                                input: {
                                  backgroundColor: palette.surface,
                                  color: palette.text,
                                  borderColor: palette.border,
                                },
                              }}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              value={model.id}
                              onChange={(e) =>
                                handleModelChange(
                                  provider.key,
                                  index,
                                  "id",
                                  e.target.value
                                )
                              }
                              placeholder="Model ID"
                              size="xs"
                              styles={{
                                input: {
                                  backgroundColor: palette.surface,
                                  color: palette.text,
                                  borderColor: palette.border,
                                },
                              }}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Checkbox
                              checked={model.recommended || false}
                              onChange={() =>
                                handleToggleRecommended(provider.key, index)
                              }
                              styles={{
                                input: {
                                  backgroundColor: palette.surface,
                                  borderColor: palette.border,
                                },
                              }}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Button
                              size="xs"
                              variant="subtle"
                              color="red"
                              onClick={() =>
                                handleRemoveModel(provider.key, index)
                              }
                              disabled={provider.models.length === 1}
                              styles={{
                                root: { color: palette.accent },
                              }}
                            >
                              <Icons.Delete size={14} />
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>

                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<Icons.Add size={14} />}
                    onClick={() => handleAddModel(provider.key)}
                    styles={{
                      root: { color: palette.text },
                    }}
                  >
                    Add model
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

