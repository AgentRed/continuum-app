import React from "react";
import { Divider, List, Paper, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import GlossaryTerm from "../components/GlossaryTerm";

type AboutPageProps = {
  palette: any;
};

export default function AboutPage({ palette }: AboutPageProps) {
  return (
    <Stack gap="lg">
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <Stack gap="lg">
          <Text
            size="xl"
            fw={700}
            style={{
              color: "#0f172a",
              fontFamily: '"Playfair Display", serif',
            }}
          >
            About Continuum
          </Text>

          <Divider />

          {/* Why Continuum exists */}
          <Stack gap="sm">
            <Text
              size="lg"
              fw={600}
              style={{
                color: "#0f172a",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Why Continuum Exists
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              As systems are built and operated over time, knowledge and
              artifacts tend to scatter across tools, documents, and
              codebases. Over time, it becomes difficult to maintain a clear
              view of what exists, how things connect, and what rules govern
              change. Systems tend to drift, intent is lost, and changes
              compound without clear memory or governance. Continuum exists to
              preserve meaning, structure, and accountability as systems
              evolve.
            </Text>
          </Stack>

          <Divider />

          {/* What Continuum is */}
          <Stack gap="sm">
            <Text
              size="lg"
              fw={600}
              style={{
                color: "#0f172a",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              What Continuum Is
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              <GlossaryTerm term="Continuum" palette={palette}>
                Continuum
              </GlossaryTerm>{" "}
              is a system for organizing environments, knowledge, and build
              programs and artifacts, including APIs, MCP servers, and
              RAG-ready documents.
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              It provides a consistent structure, UI{" "}
              <GlossaryTerm term="Surface" palette={palette}>
                surfaces
              </GlossaryTerm>
              , and governed rules so the{" "}
              <GlossaryTerm term="Continuum" palette={palette}>
                platform
              </GlossaryTerm>
              , and the{" "}
              <GlossaryTerm term="Program" palette={palette}>
                programs
              </GlossaryTerm>{" "}
              it helps build, can evolve without drifting, breaking, or silently
              rewriting intent. <GlossaryTerm term="Continuum" palette={palette}>
                Continuum
              </GlossaryTerm>{" "}
              includes the data model,{" "}
              <GlossaryTerm term="Core API" palette={palette}>
                API
              </GlossaryTerm>
              , UI{" "}
              <GlossaryTerm term="Surface" palette={palette}>
                surfaces
              </GlossaryTerm>
              , <GlossaryTerm term="Document" palette={palette}>
                documents
              </GlossaryTerm>
              , and a <GlossaryTerm term="Governance" palette={palette}>
                governance
              </GlossaryTerm>{" "}
              framework.
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              Continuum is designed so documentation, artifacts, and system
              knowledge can be captured, governed, and reused as systems evolve,
              rather than recreated or rediscovered.
            </Text>
          </Stack>

          <Divider />

          {/* How Continuum works */}
          <Stack gap="sm">
            <Text
              size="lg"
              fw={600}
              style={{
                color: "#0f172a",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              How Continuum Works
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              Continuum is designed around a small set of explicit building
              blocks, organized hierarchically and navigated through consistent{" "}
              <GlossaryTerm term="Surface" palette={palette}>
                surfaces
              </GlossaryTerm>
              , so complexity grows intentionally rather than accidentally.
              Continuum organizes work into a hierarchical structure:
            </Text>
            <List size="sm" style={{ color: "#334155" }}>
              <List.Item>
                <Text size="sm" style={{ color: "#334155" }}>
                  <strong>
                    <GlossaryTerm term="Workspace" palette={palette}>
                      Workspaces
                    </GlossaryTerm>
                  </strong>{" "}
                  are top-level containers that group related functional
                  domains. They represent major areas that teams manage and
                  build within.
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm" style={{ color: "#334155" }}>
                  <strong>
                    <GlossaryTerm term="Node" palette={palette}>
                      Nodes
                    </GlossaryTerm>
                  </strong>{" "}
                  are functional domains within a{" "}
                  <GlossaryTerm term="Workspace" palette={palette}>
                    Workspace
                  </GlossaryTerm>
                  . They are the units that teams browse into and attach{" "}
                  <GlossaryTerm term="Program" palette={palette}>
                    programs
                  </GlossaryTerm>
                  , <GlossaryTerm term="Document" palette={palette}>
                    documents
                  </GlossaryTerm>
                  , <GlossaryTerm term="Integration" palette={palette}>
                    integrations
                  </GlossaryTerm>
                  , and{" "}
                  <GlossaryTerm term="MCP server" palette={palette}>
                    MCP servers
                  </GlossaryTerm>{" "}
                  to.
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm" style={{ color: "#334155" }}>
                  <strong>
                    <GlossaryTerm term="Document" palette={palette}>
                      Documents
                    </GlossaryTerm>
                  </strong>{" "}
                  are pieces of content stored and governed inside Continuum.
                  They can serve as <GlossaryTerm term="RAG" palette={palette}>
                    RAG
                  </GlossaryTerm>{" "}
                  sources and have stable identity and traceable lineage.
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm" style={{ color: "#334155" }}>
                  <strong>
                    <GlossaryTerm term="Program" palette={palette}>
                      Programs
                    </GlossaryTerm>
                  </strong>{" "}
                  are defined build or operational units, such as workflows,
                  automations, agent instruction sets, generators, build plans,
                  or runbooks.
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm" style={{ color: "#334155" }}>
                  <strong>
                    <GlossaryTerm term="Module" palette={palette}>
                      Modules
                    </GlossaryTerm>
                  </strong>{" "}
                  are reusable components used by{" "}
                  <GlossaryTerm term="Program" palette={palette}>
                    Programs
                  </GlossaryTerm>
                  , such as templates, prompt modules, schema fragments,
                  validation rules, or connector wrappers.
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm" style={{ color: "#334155" }}>
                  <strong>
                    <GlossaryTerm term="Integration" palette={palette}>
                      Integrations
                    </GlossaryTerm>
                  </strong>{" "}
                  connect to external systems, such as GitHub, Slite, Google
                  Drive, Slack, n8n, Railway, or any API.
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm" style={{ color: "#334155" }}>
                  <strong>
                    <GlossaryTerm term="Surface" palette={palette}>
                      Surfaces
                    </GlossaryTerm>
                  </strong>{" "}
                  are UI screens that express navigational slices of Continuum,
                  such as Workspace Browser, Node Explorer, Document Console,
                  or Program Runner.
                </Text>
              </List.Item>
            </List>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              <GlossaryTerm term="Governance" palette={palette}>
                Governance
              </GlossaryTerm>{" "}
              is the mechanism that prevents silent drift. It determines which
              changes require explicit approval and which can be automatic,
              ensuring that meaning-impacting changes are controlled while
              allowing deterministic, reversible operations to proceed
              automatically.
            </Text>
          </Stack>

          <Divider />

          {/* Automatic vs governed change */}
          <Stack gap="sm">
            <Text
              size="lg"
              fw={600}
              style={{
                color: "#0f172a",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Automatic vs Governed Change
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              Continuum distinguishes between{" "}
              <GlossaryTerm term="Automatic update" palette={palette}>
                automatic
              </GlossaryTerm>{" "}
              and{" "}
              <GlossaryTerm term="Governed update" palette={palette}>
                governed
              </GlossaryTerm>{" "}
              updates. <GlossaryTerm term="Automatic update" palette={palette}>
                Automatic updates
              </GlossaryTerm>{" "}
              are deterministic, non-destructive, reversible, fully logged,
              and constrained by pre-approved rules. Examples include
              recomputing derived indexes, refreshing{" "}
              <GlossaryTerm term="RAG" palette={palette}>
                RAG
              </GlossaryTerm>{" "}
              embeddings for unchanged{" "}
              <GlossaryTerm term="Document" palette={palette}>
                documents
              </GlossaryTerm>
              , and updating counts or cache entries.
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              <GlossaryTerm term="Governed update" palette={palette}>
                Governed updates
              </GlossaryTerm>{" "}
              require explicit approval because they change meaning, structure,
              or hierarchy, delete or overwrite canonical content, modify{" "}
              <GlossaryTerm term="Governance" palette={palette}>
                governance
              </GlossaryTerm>{" "}
              rules or schemas, or have potential cross-workspace impact.
              Examples include renaming{" "}
              <GlossaryTerm term="Workspace" palette={palette}>
                Workspaces
              </GlossaryTerm>{" "}
              or <GlossaryTerm term="Node" palette={palette}>
                Nodes
              </GlossaryTerm>
              , changing hierarchy rules, altering schemas or permissions, and
              rewriting <GlossaryTerm term="Governance" palette={palette}>
                governance
              </GlossaryTerm>{" "}
              documents.
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              See{" "}
              <Link
                to="/glossary"
                style={{ color: "#3b82f6", textDecoration: "underline" }}
              >
                Glossary
              </Link>{" "}
              for the governance matrix.
            </Text>
          </Stack>

          <Divider />

          {/* Who it is for */}
          <Stack gap="sm">
            <Text
              size="lg"
              fw={600}
              style={{
                color: "#0f172a",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Who It Is For
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              It is designed solo-first, for Continuum designer, JJ Seeber, with
              collaboration features evolving as the{" "}
              <GlossaryTerm term="Continuum" palette={palette}>
                platform
              </GlossaryTerm>{" "}
              matures.
            </Text>
          </Stack>

          <Divider />

          {/* Where it is going */}
          <Stack gap="sm">
            <Text
              size="lg"
              fw={600}
              style={{
                color: "#0f172a",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Where It Is Going
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              Continuum is the work surface where ventures, tools, and operating
              systems are formed and governed. It is evolving toward Nucleus, a
              broader platform for building and operating companies with{" "}
              <GlossaryTerm term="Governance" palette={palette}>
                governance
              </GlossaryTerm>
              , traceability, and alignment built in. Nucleus Genesis will be
              invite-only at first, as early builders join. Invite-only access
              allows the platform and its{" "}
              <GlossaryTerm term="Governance" palette={palette}>
                governance
              </GlossaryTerm>{" "}
              model to mature alongside early builders who share an interest in
              responsible, intentional system design.
            </Text>
          </Stack>

          <Divider />

          {/* Next reading */}
          <Stack gap="sm">
            <Text
              size="md"
              fw={600}
              style={{
                color: "#0f172a",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Next Reading
            </Text>
            <List size="sm" style={{ color: "#334155" }}>
              <List.Item>
                <Link
                  to="/glossary"
                  style={{ color: "#3b82f6", textDecoration: "underline" }}
                >
                  Glossary
                </Link>
                <Text
                  size="sm"
                  component="span"
                  style={{ color: "#64748b", marginLeft: "8px" }}
                >
                  Terminology and governance matrix
                </Text>
              </List.Item>
              <List.Item>
                <Link
                  to="/workspaces"
                  style={{ color: "#3b82f6", textDecoration: "underline" }}
                >
                  Workspaces
                </Link>
                <Text
                  size="sm"
                  component="span"
                  style={{ color: "#64748b", marginLeft: "8px" }}
                >
                  Browse and manage Workspaces
                </Text>
              </List.Item>
              <List.Item>
                <Link
                  to="/documents"
                  style={{ color: "#3b82f6", textDecoration: "underline" }}
                >
                  Documents
                </Link>
                <Text
                  size="sm"
                  component="span"
                  style={{ color: "#64748b", marginLeft: "8px" }}
                >
                  View and browse documents
                </Text>
              </List.Item>
            </List>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
