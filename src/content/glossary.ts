export const GLOSSARY_DEFINITIONS: Record<
  string,
  { title: string; definition: string }
> = {
  Continuum: {
    title: "Continuum",
    definition:
      "The overall platform, meaning the whole system, including the data model, API, UI surfaces, documents, and governance.",
  },
  "Core API": {
    title: "Core API (continuum-core)",
    definition:
      "The backend service that exposes Continuum data (Workspaces, Nodes, etc.) over HTTP endpoints. It is where the database, Prisma, and Express live.",
  },
  App: {
    title: "App (continuum-app)",
    definition:
      "The frontend UI that renders Continuum surfaces. It talks to the Core API and lets users browse and operate on the Continuum structure.",
  },
  Tenant: {
    title: "Owner",
    definition: "The top-level ownership boundary. Owners contain Workspaces.",
  },
  Workspace: {
    title: "Workspace",
    definition:
      "A governed environment representing a coherent system under construction or operation. Workspaces contain Nodes.",
  },
  Node: {
    title: "Node",
    definition:
      "A working unit inside a Workspace. Nodes contain documents and related operational artifacts.",
  },
  Document: {
    title: "Document",
    definition:
      "A written artifact stored in Continuum, typically scoped to a Node unless explicitly canonical.",
  },
  "Standard Document": {
    title: "Standard Document",
    definition:
      "A normal editable document. Useful, but non-authoritative unless governed.",
  },
  "Canonical Document": {
    title: "Canonical Document",
    definition:
      "A system-level document that is meant to be referenced across the platform.",
  },
  "Canonical document": {
    title: "Canonical Document",
    definition:
      "A system-level document that is meant to be referenced across the platform.",
  },
  "Governed Document": {
    title: "Governed Document",
    definition:
      "A binding document that has explicit authority and must be obeyed within its scope.",
  },
  "Governed document": {
    title: "Governed Document",
    definition:
      "A binding document that has explicit authority and must be obeyed within its scope.",
  },
  "Canon Index": {
    title: "Canon Index",
    definition:
      "The authoritative registry of governed documents and their precedence rules.",
  },
  Scope: {
    title: "Scope",
    definition:
      "The boundary that defines where a rule or document applies, for example Continuum-wide, Workspace, or Node.",
  },
  Precedence: {
    title: "Precedence",
    definition:
      "The rule for which governed document wins when multiple apply, determined by scope first, then ordering.",
  },
  Proposal: {
    title: "Proposal",
    definition: "A suggested change that is reviewable and not binding.",
  },
  "Approved Proposal": {
    title: "Approved Proposal",
    definition:
      "A proposal that has been explicitly accepted and is ready to be applied.",
  },
  Application: {
    title: "Application",
    definition:
      "The act of applying an approved proposal to update the actual system state or canon.",
  },
  "Analysis Engine": {
    title: "Analysis Engine",
    definition:
      "A non-authoritative tool that evaluates through explicit lenses and produces advisory output.",
  },
  Lens: {
    title: "Lens",
    definition:
      "A declared evaluation framework used by analysis, defining what criteria apply and what is in scope.",
  },
  "Knowledge Source": {
    title: "Knowledge Source",
    definition:
      "Any connected source of information used for context. Knowledge sources never define canon by default.",
  },
  Program: {
    title: "Program",
    definition:
      "A tool-like capability that can operate in a Workspace or Node, but has no authority by default.",
  },
  Surface: {
    title: "Surface",
    definition:
      "A user-facing interface that presents Continuum structures and actions, for example the website UI.",
  },
  Governance: {
    title: "Governance",
    definition:
      "The mechanism that prevents silent drift. It determines which changes require explicit approval and which can be automatic, ensuring that meaning-impacting changes are controlled while allowing deterministic, reversible operations to proceed automatically.",
  },
  "Automatic update": {
    title: "Automatic update",
    definition:
      "A change executed by the system without requiring explicit human approval at the moment of change, because it is deterministic, non-destructive, reversible, fully logged, and constrained by pre-approved rules.",
  },
  "Governed update": {
    title: "Governed update",
    definition:
      "A change that requires explicit approval before it becomes canonical, because it changes meaning, structure, or hierarchy, deletes or overwrites canonical content, modifies governance rules or schemas, or has potential cross-workspace impact.",
  },
};
