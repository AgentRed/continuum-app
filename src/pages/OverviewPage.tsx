import React from "react";
import { Group, Paper, Stack, Text } from "@mantine/core";

type OverviewPageProps = {
  workspacesCount: number;
  selectedWorkspaceName?: string;
  nodesCount?: number;
  palette: any;
};

export default function OverviewPage({
  workspacesCount,
  selectedWorkspaceName,
  nodesCount,
  palette,
}: OverviewPageProps) {
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
          Overview
        </Text>
        <Text size="sm" c={palette.textSoft}>
          Continuum at a glance
        </Text>
        <Group gap="md" mt="md">
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.header,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Stack gap={4}>
              <Text size="xs" c={palette.textSoft}>
                Total Workspaces
              </Text>
              <Text fw={700} size="xl" c={palette.text}>
                {workspacesCount}
              </Text>
            </Stack>
          </Paper>
          {selectedWorkspaceName && (
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Selected Workspace
                </Text>
                <Text fw={700} size="xl" c={palette.text}>
                  {selectedWorkspaceName}
                </Text>
              </Stack>
            </Paper>
          )}
          {nodesCount !== undefined && nodesCount > 0 && (
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Nodes Loaded
                </Text>
                <Text fw={700} size="xl" c={palette.text}>
                  {nodesCount}
                </Text>
              </Stack>
            </Paper>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
