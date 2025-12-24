import React, { Component, ErrorInfo, ReactNode } from "react";
import { Paper, Stack, Text, Button, Group } from "@mantine/core";
import { Icons } from "../ui/icons";

type ErrorBoundaryProps = {
  children: ReactNode;
  palette?: any;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use the default error UI
      const palette = this.props.palette || {
        surface: "#001d3d",
        border: "#003566",
        text: "#fdfdfd",
        textSoft: "#a2aebb",
        accent: "#ffc300",
      };

      return (
        <Stack gap="md" p="lg">
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
              <Group gap="xs">
                <Icons.Alert size={24} color="red" />
                <Text size="lg" fw={600} c={palette.text}>
                  Something went wrong
                </Text>
              </Group>
              <Text size="sm" c={palette.textSoft}>
                {this.state.error?.message || "An unexpected error occurred"}
              </Text>
              <Button
                onClick={this.handleReset}
                styles={{
                  root: {
                    backgroundColor: palette.accent,
                    color: palette.background || "#000814",
                  },
                }}
              >
                Try again
              </Button>
            </Stack>
          </Paper>
        </Stack>
      );
    }

    return this.props.children;
  }
}

