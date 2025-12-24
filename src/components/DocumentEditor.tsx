import React from "react";
import { Button, Group, Paper, Stack, Textarea, TextInput } from "@mantine/core";

type DocumentEditorProps = {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  palette: any;
  showTitle?: boolean;
  minHeight?: string;
};

export default function DocumentEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  onCancel,
  saving = false,
  palette,
  showTitle = true,
  minHeight = "auto",
}: DocumentEditorProps) {
  return (
    <Stack gap="md">
      {showTitle && (
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => onTitleChange(e.currentTarget.value)}
          disabled={saving}
          styles={{
            label: {
              color: palette.text,
            },
            input: {
              backgroundColor: palette.background,
              borderColor: palette.border,
              color: palette.text,
            },
          }}
        />
      )}
      <Textarea
        label="Content (Markdown)"
        value={content}
        onChange={(e) => onContentChange(e.currentTarget.value)}
        autosize={minHeight === "auto"}
        minRows={minHeight === "auto" ? 18 : undefined}
        disabled={saving}
        styles={{
          label: {
            color: palette.text,
          },
          input: {
            backgroundColor: palette.background,
            borderColor: palette.border,
            color: palette.text,
            fontFamily: "var(--font-mono)",
            fontSize: "0.875rem",
            width: "100%",
            minHeight: minHeight !== "auto" ? minHeight : undefined,
          },
          wrapper: {
            width: "100%",
          },
        }}
      />
      <Group justify="flex-end" gap="xs">
        <Button
          onClick={onCancel}
          variant="subtle"
          disabled={saving}
          styles={{
            root: {
              color: palette.text,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          loading={saving}
          disabled={saving}
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
    </Stack>
  );
}


