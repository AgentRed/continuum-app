import React from "react";
import { Group, Paper, Stack, Text } from "@mantine/core";

type PageHeaderCardProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  palette: any;
};

export default function PageHeaderCard({
  title,
  subtitle,
  right,
  palette,
}: PageHeaderCardProps) {
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
      {right ? (
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Text size="lg" fw={600} c={palette.text}>
              {title}
            </Text>
            {subtitle && (
              <Text size="xs" c={palette.textSoft}>
                {subtitle}
              </Text>
            )}
          </Stack>
          {right}
        </Group>
      ) : (
        <Stack gap="xs">
          <Text size="lg" fw={600} c={palette.text}>
            {title}
          </Text>
          {subtitle && (
            <Text size="xs" c={palette.textSoft}>
              {subtitle}
            </Text>
          )}
        </Stack>
      )}
    </Paper>
  );
}


