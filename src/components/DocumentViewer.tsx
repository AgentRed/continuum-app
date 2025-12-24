import React from "react";
import { Paper } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownContent from "./MarkdownContent";

type DocumentViewerProps = {
  content: string;
  palette: any;
  maxHeight?: string;
};

export default function DocumentViewer({
  content,
  palette,
  maxHeight = "600px",
}: DocumentViewerProps) {
  return (
    <Paper
      p={maxHeight === "none" ? 0 : "md"}
      radius="md"
      style={{
        backgroundColor: maxHeight === "none" ? "transparent" : palette.background,
        border: maxHeight === "none" ? "none" : `1px solid ${palette.border}`,
        maxHeight: maxHeight === "none" ? undefined : maxHeight,
        overflowY: maxHeight === "none" ? undefined : "auto",
        boxShadow: maxHeight === "none" ? "none" : undefined,
      }}
    >
      <MarkdownContent palette={palette}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </MarkdownContent>
    </Paper>
  );
}
