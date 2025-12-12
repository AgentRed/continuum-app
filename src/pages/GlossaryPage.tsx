import React from "react";
import { Container, List, Paper, Stack, Table, Text, Divider } from "@mantine/core";

// ---------- Vocabulary Map ----------

const TERMS = {
  tenant: "Owner",
  tenants: "Owners",
};

const GLOSSARY_CONTENT = `Continuum Glossary (v1)

What Continuum Is
Continuum is a system for organizing, navigating, and operating your environments, knowledge, and build programs and artifacts, including APIs, MCP servers, and RAG-ready documents. It gives you a consistent structure, a UI surface, and a set of governed rules so the platform can evolve without drifting, breaking, or silently rewriting your intent.

Core nouns

Continuum
The overall platform, meaning the whole system, including the data model, API, UI surfaces, documents, and governance.

Core API (continuum-core)
The backend service that exposes Continuum data (Workspaces, Nodes, etc.) over HTTP endpoints. It is where the database, Prisma, and Express live.

App (continuum-app)
The frontend UI that renders Continuum surfaces. It talks to the Core API and lets you browse and operate on the Continuum structure.

Workspace
A top-level organizational container in Continuum. A Workspace groups Nodes that belong together. In your current phase, Workspaces represent major areas you want to manage and build within.

Node
A functional domain inside a Workspace. Nodes are the units you browse into and eventually attach programs, documents, integrations, MCP servers, and RAG sources to.

Document
A piece of content stored and governed inside Continuum. Documents can also be used as RAG sources. Documents should have stable identity and traceable lineage.

Program
A defined build or operational unit inside a Node, for example a workflow, an automation, an agent instruction set, a generator, a build plan, or a runbook.

Module
A reusable component used by Programs, for example a template, a prompt module, a schema fragment, a validation rule, or a connector wrapper.

Integration
A connection to an external system, for example GitHub, Slite, Google Drive, Slack, n8n, Railway, or any API.

MCP server
A tool server that exposes capabilities to an LLM client via the Model Context Protocol. In Continuum, MCP servers are treated as build artifacts that can be created, versioned, and governed.

RAG
Retrieval Augmented Generation, meaning the system can pull from a curated knowledge store to answer questions with higher accuracy and continuity.

Knowledge store
A collection of documents and sources that are indexed for retrieval. A knowledge store can be used for RAG, validation, or governance checks.

Surface
A UI screen that expresses one navigational slice of Continuum, for example Workspace Browser, Node Explorer, Document Console, Program Runner.

Multi-tenant note (current phase)
Continuum is not multi-tenant right now. The data model may still use the word "tenant" in places, but operationally there is one owner environment (you), with optional collaborators. A future phase may introduce true multi-tenant semantics, but v1 is single-owner, governed collaboration.

Automatic vs governed updates

Automatic update
A change executed by the system without requiring explicit human approval at the moment of change, because it is:
- deterministic
- non-destructive
- reversible
- fully logged
- constrained by pre-approved rules

Examples:
- recomputing derived indexes for search
- refreshing RAG embeddings for documents that have not changed meaning
- updating counts, cache entries, or read models
- reformatting documents using a fixed, approved formatter

Governed update
A change that requires explicit approval (you, or an authorized collaborator) before it becomes canonical, because it:
- changes meaning, structure, or hierarchy
- deletes or overwrites canonical content
- modifies governance rules, schemas, or identity boundaries
- has potential cross-workspace impact

Examples:
- renaming Workspaces or Nodes that affect navigation semantics
- changing canonical hierarchy rules
- altering schemas, roles, permissions, or ownership boundaries
- rewriting documents that serve as governance or canon

Practical rule of thumb
If a change affects meaning, boundaries, identity, or deletion, it is governed. If it is derived, reversible, and deterministic, it can be automatic.`;

const GOVERNANCE_MATRIX_DATA = [
  {
    asset: "UI theme / palette switching",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "No",
    notes: "Local UI preference, not canon",
  },
  {
    asset: "Derived counts (node counts, document counts)",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Log as telemetry, not canon",
  },
  {
    asset: "Search index rebuild",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Deterministic, reversible",
  },
  {
    asset: "RAG embedding refresh (no text change)",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Must not alter source content",
  },
  {
    asset: "Create Workspace / Node",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Logged as a creation event",
  },
  {
    asset: "Rename Workspace / Node",
    allowedAutomatically: "No",
    approvalRequired: "Yes",
    loggingRequired: "Yes",
    notes: "Meaning-impacting",
  },
  {
    asset: "Delete Workspace / Node",
    allowedAutomatically: "No",
    approvalRequired: "Yes",
    loggingRequired: "Yes",
    notes: "Destructive",
  },
  {
    asset: "Add Document",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Canonical ID must be assigned",
  },
  {
    asset: "Edit Document (non-governance)",
    allowedAutomatically: "No",
    approvalRequired: "Yes",
    loggingRequired: "Yes",
    notes: "Content meaning can change",
  },
  {
    asset: "Edit Governance / Canon docs",
    allowedAutomatically: "No",
    approvalRequired: "Yes (strict)",
    loggingRequired: "Yes",
    notes: "Highest protection tier",
  },
  {
    asset: "Schema change / migrations",
    allowedAutomatically: "No",
    approvalRequired: "Yes (strict)",
    loggingRequired: "Yes",
    notes: "Must be planned and reversible",
  },
  {
    asset: "MCP server creation from template",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "If templates are pre-approved",
  },
  {
    asset: "MCP server capability change",
    allowedAutomatically: "No",
    approvalRequired: "Yes",
    loggingRequired: "Yes",
    notes: "Can expand system power",
  },
];

export default function GlossaryPage() {
  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        {/* Glossary Content */}
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          <Stack gap="xl">
            {/* Main Title */}
            <Text fw={700} size="2rem" c="#0f172a" style={{ lineHeight: 1.2 }}>
              Continuum Glossary (v1)
            </Text>

            {/* What Continuum Is */}
            <Stack gap="sm">
              <Text fw={700} size="lg" c="#0f172a">
                What Continuum Is
              </Text>
              <Text size="md" c="#334155" style={{ lineHeight: 1.7 }}>
                Continuum is a system for organizing, navigating, and operating user
                environments, knowledge, and build programs and artifacts, including APIs,
                MCP servers, and RAG-ready documents. It gives the user a consistent structure, a
                UI surface, and a set of governed rules so the platform can evolve without
                drifting, breaking, or silently rewriting the user's intent.
              </Text>
            </Stack>

            <Divider />

            {/* Core nouns */}
            <Stack gap="md">
              <Text fw={700} size="lg" c="#0f172a">
                Core nouns
              </Text>

              <Stack gap="md">
                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Continuum
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    The overall platform, meaning the whole system, including the data model,
                    API, UI surfaces, documents, and governance.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Core API (continuum-core)
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    The backend service that exposes Continuum data (Workspaces, Nodes, etc.)
                    over HTTP endpoints. It is where the database, Prisma, and Express live.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    App (continuum-app)
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    The frontend UI that renders Continuum surfaces. It talks to the Core API
                    and lets the user browse and operate on the Continuum structure.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Workspace
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A top-level organizational container in Continuum. A Workspace groups Nodes
                    that belong together. In the current phase, Workspaces represent major
                    areas the user wants to manage and build within.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Node
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A functional domain inside a Workspace. Nodes are the units the user browses
                    into and eventually attaches programs, documents, integrations, MCP servers,
                    and RAG sources to.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Document
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A piece of content stored and governed inside Continuum. Documents can also
                    be used as RAG sources. Documents should have stable identity and
                    traceable lineage.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Program
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A defined build or operational unit inside a Node, for example a workflow,
                    an automation, an agent instruction set, a generator, a build plan, or a
                    runbook.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Module
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A reusable component used by Programs, for example a template, a prompt
                    module, a schema fragment, a validation rule, or a connector wrapper.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Integration
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A connection to an external system, for example GitHub, Slite, Google
                    Drive, Slack, n8n, Railway, or any API.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    MCP server
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A tool server that exposes capabilities to an LLM client via the Model
                    Context Protocol. In Continuum, MCP servers are treated as build artifacts
                    that can be created, versioned, and governed.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    RAG
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    Retrieval Augmented Generation, meaning the system can pull from a curated
                    knowledge store to answer questions with higher accuracy and continuity.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Knowledge store
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A collection of documents and sources that are indexed for retrieval. A
                    knowledge store can be used for RAG, validation, or governance checks.
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text fw={600} size="md" c="#0f172a">
                    Surface
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A UI screen that expresses one navigational slice of Continuum, for
                    example Workspace Browser, Node Explorer, Document Console, Program Runner.
                  </Text>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            {/* Multi-owner note */}
            <Stack gap="sm">
              <Text fw={700} size="lg" c="#0f172a">
                Multi-owner note (current phase)
              </Text>
              <Text size="md" c="#334155" style={{ lineHeight: 1.7 }}>
                Continuum is a single-owner system with optional collaborators. The data model may
                still use internal terminology in places, but operationally there is one owner
                environment (the owner). A future phase may introduce multi-account support, but
                v1 is single-owner, governed collaboration.
              </Text>
            </Stack>

            <Divider />

            {/* Automatic vs governed updates */}
            <Stack gap="md">
              <Text fw={700} size="lg" c="#0f172a">
                Automatic vs governed updates
              </Text>

              <Stack gap="md">
                <Stack gap="sm">
                  <Text fw={600} size="md" c="#0f172a">
                    Automatic update
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A change executed by the system without requiring explicit human approval
                    at the moment of change, because it is:
                  </Text>
                  <List size="sm" c="#334155" spacing="xs" style={{ paddingLeft: "1.5rem" }}>
                    <List.Item>deterministic</List.Item>
                    <List.Item>non-destructive</List.Item>
                    <List.Item>reversible</List.Item>
                    <List.Item>fully logged</List.Item>
                    <List.Item>constrained by pre-approved rules</List.Item>
                  </List>
                  <Text size="sm" fw={600} c="#334155" style={{ marginTop: "0.5rem" }}>
                    Examples:
                  </Text>
                  <List size="sm" c="#334155" spacing="xs" style={{ paddingLeft: "1.5rem" }}>
                    <List.Item>
                      recomputing derived indexes for search
                    </List.Item>
                    <List.Item>
                      refreshing RAG embeddings for documents that have not changed meaning
                    </List.Item>
                    <List.Item>
                      updating counts, cache entries, or read models
                    </List.Item>
                    <List.Item>
                      reformatting documents using a fixed, approved formatter
                    </List.Item>
                  </List>
                </Stack>

                <Stack gap="sm">
                  <Text fw={600} size="md" c="#0f172a">
                    Governed update
                  </Text>
                  <Text size="sm" c="#334155" style={{ lineHeight: 1.6 }}>
                    A change that requires explicit approval (the user, or an authorized
                    collaborator) before it becomes canonical, because it:
                  </Text>
                  <List size="sm" c="#334155" spacing="xs" style={{ paddingLeft: "1.5rem" }}>
                    <List.Item>changes meaning, structure, or hierarchy</List.Item>
                    <List.Item>deletes or overwrites canonical content</List.Item>
                    <List.Item>
                      modifies governance rules, schemas, or identity boundaries
                    </List.Item>
                    <List.Item>has potential cross-workspace impact</List.Item>
                  </List>
                  <Text size="sm" fw={600} c="#334155" style={{ marginTop: "0.5rem" }}>
                    Examples:
                  </Text>
                  <List size="sm" c="#334155" spacing="xs" style={{ paddingLeft: "1.5rem" }}>
                    <List.Item>
                      renaming Workspaces or Nodes that affect navigation semantics
                    </List.Item>
                    <List.Item>changing canonical hierarchy rules</List.Item>
                    <List.Item>
                      altering schemas, roles, permissions, or ownership boundaries
                    </List.Item>
                    <List.Item>
                      rewriting documents that serve as governance or canon
                    </List.Item>
                  </List>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            {/* Practical rule of thumb */}
            <Stack gap="sm">
              <Text fw={700} size="lg" c="#0f172a">
                Practical rule of thumb
              </Text>
              <Text size="md" c="#334155" style={{ lineHeight: 1.7 }}>
                If a change affects meaning, boundaries, identity, or deletion, it is
                governed. If it is derived, reversible, and deterministic, it can be automatic.
              </Text>
            </Stack>
          </Stack>
        </Paper>

        {/* Governance Matrix */}
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          <Stack gap="md">
            <Text fw={700} size="xl" c="#0f172a">
              Governance Matrix
            </Text>
            <Text size="sm" c="#64748b" style={{ marginBottom: "8px" }}>
              Governance matrix (v1)
            </Text>
            <Table
              withTableBorder
              withColumnBorders
              horizontalSpacing="md"
              verticalSpacing="xs"
              styles={{
                table: {
                  backgroundColor: "transparent",
                },
                th: {
                  backgroundColor: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600,
                  borderColor: "#e2e8f0",
                },
                td: {
                  borderColor: "#e2e8f0",
                  color: "#334155",
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Asset / Change Type</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>
                    Allowed Automatically?
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>
                    Approval Required?
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>
                    Logging Required?
                  </Table.Th>
                  <Table.Th>Notes</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {GOVERNANCE_MATRIX_DATA.map((row, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{row.asset}</Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {row.allowedAutomatically}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {row.approvalRequired}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {row.loggingRequired}
                    </Table.Td>
                    <Table.Td>{row.notes}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
