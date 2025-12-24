import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import DocumentViewer from "../components/DocumentViewer";
import LoadingRow from "../ui/LoadingRow";
import {
  listCanonicalDocuments,
  getCanonicalDocument,
  resolveWhitepaperKey,
  findCanonicalByKey,
  type CanonicalDocument,
} from "../lib/canonicalDocsApi";

type WhitepaperPageProps = {
  palette: any;
  API_BASE: string;
};

type WhitepaperVersion = "A" | "D";
type WhitepaperAudience = "General" | "Agent Cru";

const STORAGE_KEY_VERSION = "continuum.whitepaper.version";
const STORAGE_KEY_AUDIENCE = "continuum.whitepaper.audience";

export default function WhitepaperPage({
  palette,
  API_BASE,
}: WhitepaperPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [version, setVersion] = useState<WhitepaperVersion>("A");
  const [audience, setAudience] = useState<WhitepaperAudience>("General");
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);

  // Data state
  const [canonicalDocuments, setCanonicalDocuments] = useState<CanonicalDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<CanonicalDocument | null>(null);
  const [documentCache, setDocumentCache] = useState<Map<string, CanonicalDocument>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Initialize version and audience from URL params or localStorage
  useEffect(() => {
    const urlVersion = searchParams.get("version") as WhitepaperVersion | null;
    const urlAudience = searchParams.get("audience") as WhitepaperAudience | null;

    if (urlVersion && (urlVersion === "A" || urlVersion === "D")) {
      setVersion(urlVersion);
      localStorage.setItem(STORAGE_KEY_VERSION, urlVersion);
    } else {
      const storedVersion = localStorage.getItem(STORAGE_KEY_VERSION) as WhitepaperVersion | null;
      if (storedVersion && (storedVersion === "A" || storedVersion === "D")) {
        setVersion(storedVersion);
      }
    }

    if (urlAudience && (urlAudience === "General" || urlAudience === "Agent Cru")) {
      setAudience(urlAudience);
      localStorage.setItem(STORAGE_KEY_AUDIENCE, urlAudience);
    } else {
      const storedAudience = localStorage.getItem(STORAGE_KEY_AUDIENCE) as WhitepaperAudience | null;
      if (storedAudience && (storedAudience === "General" || storedAudience === "Agent Cru")) {
        setAudience(storedAudience);
      }
    }
  }, [searchParams]);

  // Load canonical documents list
  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocuments(true);
      setError(null);
      const documents = await listCanonicalDocuments(API_BASE);
      setCanonicalDocuments(documents);
    } catch (err: any) {
      console.error("Error loading canonical documents", err);
      setError(err?.message ?? "Failed to load canonical documents");
    } finally {
      setLoadingDocuments(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Resolve and load the current whitepaper document
  const preferredKey = useMemo(
    () => resolveWhitepaperKey(version, audience),
    [version, audience]
  );

  const loadDocument = useCallback(async () => {
    if (canonicalDocuments.length === 0) {
      return;
    }

    const matchedDoc = findCanonicalByKey(canonicalDocuments, preferredKey);

    if (!matchedDoc) {
      const availableKeys = canonicalDocuments.map((d) => d.key);
      console.log("Available canonical document keys:", availableKeys);
      
      // Check if any whitepaper documents exist
      const hasAnyWhitepaper = canonicalDocuments.some((d) =>
        d.key.toLowerCase().includes("whitepaper")
      );
      
      if (!hasAnyWhitepaper) {
        setError(
          `Whitepaper document not found.\n\nExpected key: ${preferredKey}\n\nNo whitepaper documents found in canonical documents. The whitepaper documents may need to be created in the backend.\n\nAvailable canonical document keys:\n${canonicalDocuments.map((d) => `- ${d.key}`).join("\n")}`
        );
      } else {
        setError(
          `Whitepaper document not found.\n\nExpected key: ${preferredKey}\n\nAvailable whitepaper keys:\n${canonicalDocuments
            .filter((d) => d.key.toLowerCase().includes("whitepaper"))
            .map((d) => `- ${d.key}`)
            .join("\n")}\n\nAll canonical document keys:\n${canonicalDocuments.map((d) => `- ${d.key}`).join("\n")}`
        );
      }
      setCurrentDocument(null);
      return;
    }

    // Check cache first
    const cached = documentCache.get(matchedDoc.id);
    if (cached) {
      setCurrentDocument(cached);
      setError(null);
      return;
    }

    // Fetch document
    try {
      setLoading(true);
      setError(null);
      const doc = await getCanonicalDocument(API_BASE, matchedDoc.id);
      setCurrentDocument(doc);
      // Update cache
      setDocumentCache((prev) => new Map(prev).set(doc.id, doc));
    } catch (err: any) {
      console.error("Error loading whitepaper document", err);
      setError(err?.message ?? "Failed to load whitepaper document");
      setCurrentDocument(null);
    } finally {
      setLoading(false);
    }
  }, [canonicalDocuments, preferredKey, API_BASE, documentCache]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleRefresh = () => {
    // Clear cache and reload
    setDocumentCache(new Map());
    setCurrentDocument(null);
    fetchDocuments();
  };

  const handleVersionChange = (value: string | null) => {
    if (value === "A" || value === "D") {
      setVersion(value);
      localStorage.setItem(STORAGE_KEY_VERSION, value);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("version", value);
        return newParams;
      });
    }
  };

  const handleAudienceChange = (value: string | null) => {
    if (value === "General" || value === "Agent Cru") {
      setAudience(value);
      localStorage.setItem(STORAGE_KEY_AUDIENCE, value);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("audience", value);
        return newParams;
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLinkSuccess(true);
      setTimeout(() => setCopyLinkSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Whitepaper"
        subtitle="High-level overview of Continuum for sharing"
        palette={palette}
        right={
          <Text size="xs" c={palette.textSoft}>
            API Base: {API_BASE}
          </Text>
        }
      />

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
          <Group gap="md" align="flex-end">
            <Select
              label="Version"
              value={version}
              onChange={handleVersionChange}
              data={[
                { value: "A", label: "A" },
                { value: "D", label: "D" },
              ]}
              styles={{
                label: { color: palette.text },
                input: {
                  backgroundColor: palette.background,
                  color: palette.text,
                  borderColor: palette.border,
                },
              }}
            />
            <Select
              label="Audience"
              value={audience}
              onChange={handleAudienceChange}
              data={[
                { value: "General", label: "General" },
                { value: "Agent Cru", label: "Agent Cru" },
              ]}
              styles={{
                label: { color: palette.text },
                input: {
                  backgroundColor: palette.background,
                  color: palette.text,
                  borderColor: palette.border,
                },
              }}
            />
            <Button
              leftSection={<Icons.Refresh size={16} />}
              onClick={handleRefresh}
              variant="subtle"
              size="sm"
              disabled={loadingDocuments || loading}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Refresh
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="xs" c={palette.textSoft}>
              Canonical key: {preferredKey}
            </Text>
            {copyLinkSuccess ? (
              <Text size="sm" c={palette.accent}>
                Link copied!
              </Text>
            ) : (
              <Button
                leftSection={<Icons.Link size={16} />}
                onClick={handleCopyLink}
                variant="subtle"
                size="sm"
                styles={{
                  root: {
                    color: palette.text,
                  },
                }}
              >
                Copy link
              </Button>
            )}
          </Group>

          {loadingDocuments || loading ? (
            <LoadingRow message="Loading whitepaper..." palette={palette} />
          ) : error ? (
            <Paper
              p="md"
              style={{
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap="xs">
                <Text size="sm" fw={600} c={palette.text}>
                  Error
                </Text>
                <Text
                  size="sm"
                  c={palette.text}
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </Text>
              </Stack>
            </Paper>
          ) : currentDocument?.content ? (
            <DocumentViewer
              content={currentDocument.content}
              palette={palette}
              maxHeight="none"
            />
          ) : (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              No content available
            </Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
