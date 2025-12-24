import React, { ReactNode } from "react";

type PaletteDef = {
  background: string;
  surface: string;
  header: string;
  accent: string;
  accentSoft: string;
  text: string;
  textSoft: string;
  border: string;
};

interface MarkdownContentProps {
  children: ReactNode;
  palette: PaletteDef;
}

/**
 * Wrapper component for markdown content that provides consistent typography
 * and layout across all markdown-rendered pages.
 */
export default function MarkdownContent({ children, palette }: MarkdownContentProps) {
  return (
    <div
      style={{
        maxWidth: "920px",
        margin: "0 auto",
        padding: "24px",
        color: palette.text,
        fontSize: "16px",
        lineHeight: 1.7,
        fontFamily: "inherit",
      }}
    >
      <style>
        {`
          /* Headings */
          .markdown-content h1 {
            color: ${palette.text};
            font-size: 2rem;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
            line-height: 1.3;
          }
          .markdown-content h1:first-child {
            margin-top: 0;
          }
          .markdown-content h2 {
            color: ${palette.text};
            font-size: 1.625rem;
            font-weight: 700;
            margin-top: 1.75rem;
            margin-bottom: 0.875rem;
            line-height: 1.4;
          }
          .markdown-content h3 {
            color: ${palette.text};
            font-size: 1.375rem;
            font-weight: 600;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            line-height: 1.4;
          }
          .markdown-content h4 {
            color: ${palette.text};
            font-size: 1.125rem;
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.625rem;
            line-height: 1.5;
          }
          .markdown-content h5 {
            color: ${palette.text};
            font-size: 1rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            line-height: 1.5;
          }
          .markdown-content h6 {
            color: ${palette.text};
            font-size: 0.875rem;
            font-weight: 600;
            margin-top: 0.875rem;
            margin-bottom: 0.5rem;
            line-height: 1.5;
          }

          /* Paragraphs */
          .markdown-content p {
            color: ${palette.text};
            margin-top: 0;
            margin-bottom: 1rem;
            line-height: 1.7;
          }

          /* Links */
          .markdown-content a {
            color: ${palette.accent};
            text-decoration: underline;
            text-decoration-color: ${palette.accent};
            transition: opacity 0.2s ease;
          }
          .markdown-content a:hover {
            opacity: 0.8;
            text-decoration-color: ${palette.accent};
          }

          /* Lists */
          .markdown-content ul,
          .markdown-content ol {
            color: ${palette.text};
            margin-top: 0.75rem;
            margin-bottom: 1rem;
            padding-left: 1.75rem;
            line-height: 1.7;
          }
          .markdown-content li {
            color: ${palette.text};
            margin-top: 0.375rem;
            margin-bottom: 0.375rem;
            line-height: 1.7;
          }
          .markdown-content li > p {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }

          /* Blockquotes */
          .markdown-content blockquote {
            color: ${palette.text};
            border-left: 4px solid ${palette.border};
            background-color: ${palette.surface};
            padding: 0.75rem 1rem;
            margin-top: 1rem;
            margin-bottom: 1rem;
            margin-left: 0;
            margin-right: 0;
            border-radius: 0 4px 4px 0;
            font-style: italic;
            opacity: 0.95;
          }
          .markdown-content blockquote p {
            margin-bottom: 0.5rem;
          }
          .markdown-content blockquote p:last-child {
            margin-bottom: 0;
          }

          /* Inline code */
          .markdown-content code:not(pre code) {
            font-family: var(--font-mono);
            background-color: ${palette.surface};
            color: ${palette.text};
            border: 1px solid ${palette.border};
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
          }

          /* Code blocks */
          .markdown-content pre {
            font-family: var(--font-mono);
            background-color: ${palette.surface};
            border: 1px solid ${palette.border};
            color: ${palette.text};
            padding: 14px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 0.875em;
            line-height: 1.6;
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
          .markdown-content pre code {
            background-color: transparent;
            border: none;
            padding: 0;
            font-size: inherit;
            color: inherit;
          }

          /* Strong/Bold */
          .markdown-content strong {
            color: ${palette.text};
            font-weight: 700;
          }

          /* Emphasis/Italic */
          .markdown-content em {
            color: ${palette.text};
            font-style: italic;
          }

          /* Horizontal rule */
          .markdown-content hr {
            border: none;
            border-top: 1px solid ${palette.border};
            margin-top: 2rem;
            margin-bottom: 2rem;
          }

          /* Tables */
          .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 1rem;
            margin-bottom: 1rem;
            border: 1px solid ${palette.border};
            overflow-x: auto;
            display: block;
          }
          @media (min-width: 768px) {
            .markdown-content table {
              display: table;
            }
          }
          .markdown-content thead {
            background-color: ${palette.header};
          }
          .markdown-content tbody {
            background-color: transparent;
          }
          .markdown-content tr {
            border-bottom: 1px solid ${palette.border};
          }
          .markdown-content th {
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: ${palette.text};
            border-right: 1px solid ${palette.border};
          }
          .markdown-content td {
            padding: 0.75rem;
            color: ${palette.text};
            border-right: 1px solid ${palette.border};
          }
          .markdown-content th:last-child,
          .markdown-content td:last-child {
            border-right: none;
          }

          /* Task lists (checkboxes) */
          .markdown-content input[type="checkbox"] {
            margin-right: 0.5rem;
            cursor: not-allowed;
          }

          /* Strikethrough */
          .markdown-content del {
            color: ${palette.textSoft};
            text-decoration: line-through;
          }

          /* Images */
          .markdown-content img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
        `}
      </style>
      <div className="markdown-content">{children}</div>
    </div>
  );
}

