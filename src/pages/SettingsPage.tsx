import React from "react";
import { Paper, Stack, Text } from "@mantine/core";

type SettingsPageProps = {
  palette: any;
};

export default function SettingsPage({ palette }: SettingsPageProps) {
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
        <Text fw={600} size="lg">
          Settings
        </Text>
        <Text size="sm" c={palette.textSoft}>
          Continuum options and configuration
        </Text>
        <Text size="sm" c={palette.textSoft} mt="md">
          Settings panel coming soon.
        </Text>
      </Stack>
    </Paper>
  );
}









