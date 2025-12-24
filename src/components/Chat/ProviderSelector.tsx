import React, { useEffect, useState } from "react";
import { Select, Text, Group, Stack } from "@mantine/core";
import { listProviders, type LLMProvider } from "../../lib/chatApi";

type ProviderSelectorProps = {
  API_BASE: string;
  palette: any;
  selectedProviderId?: string;
  onProviderChange: (providerId: string) => void;
  conversationId?: string;
};

export default function ProviderSelector({
  API_BASE,
  palette,
  selectedProviderId,
  onProviderChange,
  conversationId,
}: ProviderSelectorProps) {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const data = await listProviders(API_BASE);
        const enabled = data.filter((p) => p.enabled);
        setProviders(enabled);
        
        // Set default if none selected
        if (!selectedProviderId && enabled.length > 0) {
          onProviderChange(enabled[0].id);
        }
      } catch (err) {
        console.error("Error loading providers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: `${p.name}${p.defaultModel ? ` (${p.defaultModel})` : ""}`,
  }));

  return (
    <Stack gap="xs">
      <Group gap="md" align="flex-end">
        <Select
          label="Provider"
          placeholder="Select provider"
          value={selectedProviderId || null}
          onChange={(value) => {
            if (value) {
              onProviderChange(value);
            }
          }}
          data={providerOptions}
          disabled={loading || providers.length === 0}
          styles={{
            label: { color: palette.text },
            input: {
              backgroundColor: palette.background,
              color: palette.text,
              borderColor: palette.border,
            },
          }}
        />
      </Group>
      <Text size="xs" c={palette.textMuted || palette.textSoft} style={{ fontStyle: "italic" }}>
        You can switch models without losing conversation context.
      </Text>
    </Stack>
  );
}

