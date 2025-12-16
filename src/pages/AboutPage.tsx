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
              As complex systems are built and operated over time, knowledge
              and artifacts scatter across tools, documents, and codebases.
              Over time, it becomes difficult to maintain a clear view of what
              exists, how things connect, and what rules govern change. Systems
              drift, intent is lost, and changes compound without clear memory
              or governance. Continuum exists to preserve meaning, structure,
              and accountability as systems evolve.
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
              is a platform and work surface that aids users in building,
              documenting, operating, and maintaining complex programs,
              workflows, and systems over time. The platform captures
              documentation as systems are built, supports human and AI
              collaborative authorship, and uses governance to determine
              authority, not authorship.
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              The system beneath the platform provides a consistent structure,
              governed rules, and traceable lineage so that programs and
              workflows can evolve without drifting, breaking, or silently
              rewriting intent.
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
              Continuum organizes work into a hierarchical structure of
              building blocks, each with clear relationships:
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
                  domains.
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
                  . <GlossaryTerm term="Program" palette={palette}>
                    Programs
                  </GlossaryTerm>
                  , <GlossaryTerm term="Document" palette={palette}>
                    documents
                  </GlossaryTerm>
                  , <GlossaryTerm term="Integration" palette={palette}>
                    integrations
                  </GlossaryTerm>
                  , and interfaces attach to{" "}
                  <GlossaryTerm term="Node" palette={palette}>
                    Nodes
                  </GlossaryTerm>
                  .
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
                  <strong>Interfaces</strong> include{" "}
                  <GlossaryTerm term="MCP server" palette={palette}>
                    MCP servers
                  </GlossaryTerm>
                  , APIs, and future protocols that expose capabilities to
                  external systems.
                </Text>
              </List.Item>
            </List>
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
              changes. This distinction exists to prevent silent drift while
              allowing deterministic, reversible operations to proceed
              automatically. <GlossaryTerm term="Automatic update" palette={palette}>
                Automatic updates
              </GlossaryTerm>{" "}
              are deterministic, non-destructive, reversible, fully logged,
              and constrained by pre-approved rules.{" "}
              <GlossaryTerm term="Governed update" palette={palette}>
                Governed updates
              </GlossaryTerm>{" "}
              require explicit approval because they change meaning, structure,
              or hierarchy, delete or overwrite canonical content, modify{" "}
              <GlossaryTerm term="Governance" palette={palette}>
                governance
              </GlossaryTerm>{" "}
              rules or schemas, or have potential cross-workspace impact.
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
              Who Continuum Is For
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              Continuum is for founders managing multiple ventures, builders of
              long-lived systems, operators maintaining complex stacks, and
              creators whose work evolves over time. Continuum is currently
              designed solo-first for its creator, with collaboration features
              evolving as the platform matures.
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
              Where Continuum Is Going
            </Text>
            <Text size="sm" style={{ color: "#334155", lineHeight: 1.7 }}>
              Continuum is the foundational work surface from which Nucleus
              emerges. Nucleus Genesis will be invite-only at first, as early
              builders join.
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






