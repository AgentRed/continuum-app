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
  Workspace: {
    title: "Workspace",
    definition:
      "A top-level organizational container in Continuum. A Workspace groups Nodes that belong together. Workspaces represent major areas that teams manage and build within.",
  },
  Node: {
    title: "Node",
    definition:
      "A functional domain inside a Workspace. Nodes are the units that teams browse into and attach programs, documents, integrations, MCP servers, and RAG sources to.",
  },
  Document: {
    title: "Document",
    definition:
      "A piece of content stored and governed inside Continuum. Documents can also be used as RAG sources. Documents should have stable identity and traceable lineage.",
  },
  Program: {
    title: "Program",
    definition:
      "A defined build or operational unit inside a Node, for example a workflow, an automation, an agent instruction set, a generator, a build plan, or a runbook.",
  },
  Module: {
    title: "Module",
    definition:
      "A reusable component used by Programs, for example a template, a prompt module, a schema fragment, a validation rule, or a connector wrapper.",
  },
  Integration: {
    title: "Integration",
    definition:
      "A connection to an external system, for example GitHub, Slite, Google Drive, Slack, n8n, Railway, or any API.",
  },
  "MCP server": {
    title: "MCP server",
    definition:
      "A tool server that exposes capabilities to an LLM client via the Model Context Protocol. In Continuum, MCP servers are treated as build artifacts that can be created, versioned, and governed.",
  },
  RAG: {
    title: "RAG",
    definition:
      "Retrieval Augmented Generation, meaning the system can pull from a curated knowledge store to answer questions with higher accuracy and continuity.",
  },
  "Knowledge store": {
    title: "Knowledge store",
    definition:
      "A collection of documents and sources that are indexed for retrieval. A knowledge store can be used for RAG, validation, or governance checks.",
  },
  Surface: {
    title: "Surface",
    definition:
      "A UI screen that expresses one navigational slice of Continuum, for example Workspace Browser, Node Explorer, Document Console, Program Runner.",
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
