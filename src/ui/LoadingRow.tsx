import React from "react";
import { Group, Loader, Text } from "@mantine/core";

type LoadingRowProps = {
  message: string;
  palette: any;
};

export default function LoadingRow({ message, palette }: LoadingRowProps) {
  return (
    <Group gap="xs">
      <Loader size="sm" />
      <Text size="sm" c={palette.textSoft}>
        {message}
      </Text>
    </Group>
  );
}


