import React from "react";
import { Text } from "@mantine/core";

type ErrorStateProps = {
  message: string;
  palette: any;
};

export default function ErrorState({ message, palette }: ErrorStateProps) {
  return (
    <Text size="sm" c="red.3">
      {message}
    </Text>
  );
}


