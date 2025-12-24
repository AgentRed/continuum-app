import React from "react";
import { Text } from "@mantine/core";

type EmptyStateProps = {
  message: string;
  palette: any;
};

export default function EmptyState({ message, palette }: EmptyStateProps) {
  return (
    <Text size="sm" c={palette.textSoft}>
      {message}
    </Text>
  );
}


