import React from "react";
import { Tooltip } from "@mantine/core";
import { GLOSSARY_DEFINITIONS } from "../content/glossary";

type GlossaryTermKey = keyof typeof GLOSSARY_DEFINITIONS;

type GlossaryTermProps = {
  term: GlossaryTermKey;
  children: React.ReactNode;
  palette?: any;
};

export default function GlossaryTerm({
  term,
  children,
  palette,
}: GlossaryTermProps) {
  const definition = GLOSSARY_DEFINITIONS[term];

  if (!definition) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      label={
        <div>
          <div style={{ fontWeight: 600, marginBottom: "4px" }}>
            {definition.title}
          </div>
          <div style={{ fontSize: "0.875rem", lineHeight: 1.4 }}>
            {definition.definition}
          </div>
        </div>
      }
      withArrow
      multiline
      styles={{
        tooltip: {
          backgroundColor: palette?.surface || "#1a1a1a",
          color: palette?.text || "#ffffff",
          border: `1px solid ${palette?.border || "#333"}`,
          maxWidth: "320px",
        },
      }}
    >
      <span
        role="button"
        tabIndex={0}
        aria-label={`${definition.title}: ${definition.definition}`}
        style={{
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textDecorationThickness: "1px",
          textUnderlineOffset: 2,
          cursor: "help",
        }}
      >
        {children}
      </span>
    </Tooltip>
  );
}
