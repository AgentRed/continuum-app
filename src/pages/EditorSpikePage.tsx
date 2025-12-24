import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertTable,
  ListsToggle,
  BlockTypeSelect,
  InsertCodeBlock,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Icons } from "../ui/icons";

type EditorSpikePageProps = {
  palette: any;
};

export default function EditorSpikePage({ palette }: EditorSpikePageProps) {
  // Apply custom styling to MDXEditor to match Mantine theme
  useEffect(() => {
    const styleId = "mdx-editor-custom-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .mdx-editor-content {
        background-color: ${palette.background} !important;
        color: ${palette.text} !important;
        font-family: var(--font-mono) !important;
        min-height: 400px;
        padding: 16px;
      }
      .mdx-editor-toolbar {
        background-color: ${palette.surface} !important;
        border-bottom: 1px solid ${palette.border} !important;
        padding: 8px;
      }
      .mdx-editor-toolbar button {
        color: ${palette.text} !important;
      }
      .mdx-editor-toolbar button:hover {
        background-color: ${palette.header} !important;
      }
      .mdx-editor-toolbar button[aria-pressed="true"] {
        background-color: ${palette.accent} !important;
        color: ${palette.text} !important;
      }
      .mdx-editor-content h1,
      .mdx-editor-content h2,
      .mdx-editor-content h3,
      .mdx-editor-content h4,
      .mdx-editor-content h5,
      .mdx-editor-content h6 {
        color: ${palette.text} !important;
        font-family: var(--font-heading) !important;
      }
      .mdx-editor-content p,
      .mdx-editor-content li {
        color: ${palette.text} !important;
      }
      .mdx-editor-content code {
        background-color: ${palette.surface} !important;
        color: ${palette.accent} !important;
        border: 1px solid ${palette.border} !important;
      }
      .mdx-editor-content pre {
        background-color: ${palette.surface} !important;
        border: 1px solid ${palette.border} !important;
      }
      .mdx-editor-content table {
        border-color: ${palette.border} !important;
      }
      .mdx-editor-content table th,
      .mdx-editor-content table td {
        border-color: ${palette.border} !important;
        color: ${palette.text} !important;
      }
      .mdx-editor-content a {
        color: ${palette.accent} !important;
      }
      .mdx-editor-content blockquote {
        border-left-color: ${palette.accent} !important;
        color: ${palette.textSoft} !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [palette]);

  const [markdown, setMarkdown] = useState(`# Welcome to the Editor Spike

This is a **proof-of-concept** markdown editor using MDXEditor.

## Features

- **Bold**, *italic*, and \`code\` formatting
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Tables
- Links
- Headings

### Try Editing

You can edit this content directly. The editor supports:

1. Markdown shortcuts
2. Toolbar actions
3. Live preview toggle

\`\`\`javascript
function hello() {
  console.log("Hello, Continuum!");
}
\`\`\`

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| Preview | ✅ |
| Theming | ✅ |

> This is a blockquote example.

[Learn more](https://mdxeditor.dev)`);

  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  return (
    <Stack gap="md">
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
          <Text size="lg" fw={600} c={palette.text}>
            Editor Spike - MDXEditor Proof of Concept
          </Text>
          <Text size="xs" c={palette.textSoft}>
            Evaluating MDXEditor for Document Create/Edit modal integration.
            This page respects font scaling and Mantine theming.
          </Text>
        </Stack>
      </Paper>

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
          <Group justify="space-between">
            <Text size="sm" fw={500} c={palette.text}>
              Editor
            </Text>
            <Group gap="xs">
              <Button
                size="xs"
                variant={viewMode === "edit" ? "filled" : "outline"}
                leftSection={<Icons.Edit size={14} />}
                onClick={() => setViewMode("edit")}
                styles={{
                  root: {
                    backgroundColor:
                      viewMode === "edit" ? palette.accent : "transparent",
                    borderColor: palette.border,
                    color: palette.text,
                  },
                }}
              >
                Edit
              </Button>
              <Button
                size="xs"
                variant={viewMode === "preview" ? "filled" : "outline"}
                leftSection={<Icons.View size={14} />}
                onClick={() => setViewMode("preview")}
                styles={{
                  root: {
                    backgroundColor:
                      viewMode === "preview" ? palette.accent : "transparent",
                    borderColor: palette.border,
                    color: palette.text,
                  },
                }}
              >
                Preview
              </Button>
            </Group>
          </Group>

          <Box
            style={{
              border: `1px solid ${palette.border}`,
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: palette.background,
            }}
          >
            <MDXEditor
              markdown={markdown}
              onChange={setMarkdown}
              contentEditableClassName="mdx-editor-content"
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                tablePlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
                codeMirrorPlugin({
                  codeBlockLanguages: {
                    javascript: "JavaScript",
                    typescript: "TypeScript",
                    python: "Python",
                    bash: "Bash",
                    json: "JSON",
                    markdown: "Markdown",
                  },
                }),
                markdownShortcutPlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <CodeToggle />
                      <CreateLink />
                      <InsertTable />
                      <ListsToggle />
                      <BlockTypeSelect />
                      <InsertCodeBlock />
                    </>
                  ),
                }),
              ]}
              readOnly={viewMode === "preview"}
            />
          </Box>

          <Text size="xs" c={palette.textSoft}>
            Character count: {markdown.length} | Word count:{" "}
            {markdown.split(/\s+/).filter((w) => w.length > 0).length}
          </Text>
        </Stack>
      </Paper>

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
          <Text size="sm" fw={600} c={palette.text}>
            Raw Markdown Output
          </Text>
          <Box
            p="sm"
            style={{
              backgroundColor: palette.background,
              border: `1px solid ${palette.border}`,
              borderRadius: "4px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            <Text
              size="xs"
              c={palette.textSoft}
              style={{
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {markdown}
            </Text>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
























