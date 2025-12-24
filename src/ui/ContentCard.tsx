import React from "react";
import { Group, Paper, Stack, Text } from "@mantine/core";

type ContentCardProps = {
  children: React.ReactNode;
  palette: any;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function ContentCard({
  children,
  palette,
  title,
  subtitle,
  right,
}: ContentCardProps) {
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
      <Stack gap="md">
        {(title || right) && (
          <Group justify="space-between" align="center">
            {title && (
              <Stack gap={4}>
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
            {right}
          </Group>
        )}
        {children}
      </Stack>
    </Paper>
  );
}


