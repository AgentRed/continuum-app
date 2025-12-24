import React, { useEffect, useState } from "react";
import { Group, Loader, Paper, Stack, Text } from "@mantine/core";
import { Icons } from "../ui/icons";

type Task = {
  label: string;
  completed: boolean;
};

type Section = {
  title: string;
  tasks: Task[];
};

type CanonicalDocument = {
  id: string;
  key: string;
  title?: string;
  content?: string;
};

type DevelopmentPlanPageProps = {
  palette: any;
  API_BASE: string;
};

// Parse markdown content into sections and tasks
function parseDevelopmentPlan(content: string): Section[] {
  if (!content) return [];

  const sections: Section[] = [];
  const lines = content.split("\n");
  let currentSection: Section | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for section header (## or ###)
    if (line.startsWith("##")) {
      // Save previous section if it exists
      if (currentSection && currentSection.tasks.length > 0) {
        sections.push(currentSection);
      }

      // Extract section title (remove ## and trim)
      const title = line.replace(/^#+\s*/, "").trim();
      currentSection = {
        title,
        tasks: [],
      };
    }
    // Check for task list item (- [x] or - [ ])
    else if (line.match(/^[-*]\s+\[([ x])\]/)) {
      if (currentSection) {
        const match = line.match(/^[-*]\s+\[([ x])\]\s+(.+)$/);
        if (match) {
          const completed = match[1] === "x";
          const label = match[2].trim();
          currentSection.tasks.push({
            label,
            completed,
          });
        }
      }
    }
  }

  // Add the last section if it exists
  if (currentSection && currentSection.tasks.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export default function DevelopmentPlanPage({
  palette,
  API_BASE,
}: DevelopmentPlanPageProps) {
  const [document, setDocument] = useState<CanonicalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const fetchDevelopmentPlan = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all canonical documents and find the one with matching key
        const res = await fetch(`${API_BASE}/api/canonical-documents`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const documents = (await res.json()) as CanonicalDocument[];
        
        // Try exact match first
        let planDoc = documents.find(
          (doc) => doc.key === "continuum-development-plan.md"
        );

        // Try case-insensitive match
        if (!planDoc) {
          planDoc = documents.find(
            (doc) => doc.key.toLowerCase() === "continuum-development-plan.md"
          );
        }

        // Try partial match (contains "development-plan")
        if (!planDoc) {
          planDoc = documents.find(
            (doc) => doc.key.toLowerCase().includes("development-plan")
          );
        }

        if (!planDoc) {
          const availableKeys = documents.map((d) => d.key).join(", ");
          console.error("Available canonical document keys:", availableKeys);
          throw new Error(
            `Development plan document not found. Looking for key: "continuum-development-plan.md". Available keys: ${availableKeys || "none"}`
          );
        }

        // Fetch the full document content
        const docRes = await fetch(
          `${API_BASE}/api/canonical-documents/${planDoc.id}`
        );
        if (!docRes.ok) {
          throw new Error(`HTTP ${docRes.status}`);
        }
        const fullDoc = (await docRes.json()) as CanonicalDocument;
        setDocument(fullDoc);

        // Parse the content
        if (fullDoc.content) {
          const parsedSections = parseDevelopmentPlan(fullDoc.content);
          setSections(parsedSections);
        }
      } catch (err: any) {
        console.error("Error loading development plan", err);
        setError(err?.message ?? "Failed to load development plan");
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopmentPlan();

    // Refetch when window regains focus to reflect changes
    const handleFocus = () => {
      fetchDevelopmentPlan();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [API_BASE]);

  if (loading) {
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
          <Group gap="xs">
            <Loader size="sm" />
            <Text size="sm" c={palette.text}>
              Loading development plan…
            </Text>
          </Group>
        </Paper>
      </Stack>
    );
  }

  if (error) {
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
            <Text size="sm" fw={600} c="red.3">
              Development Plan Not Found
            </Text>
            <Text size="sm" c={palette.textSoft}>
              {error}
            </Text>
            <Text size="xs" c={palette.textSoft} style={{ marginTop: "0.5rem" }}>
              Please ensure a canonical document with key "continuum-development-plan.md" exists.
              Check the console for available document keys.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    );
  }

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
            Continuum Development Plan
          </Text>
          <Text size="xs" c={palette.textSoft}>
            Tracking the work required to move Continuum development into Continuum
          </Text>
        </Stack>
      </Paper>

      {sections.length === 0 ? (
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
            No sections found in development plan.
          </Text>
        </Paper>
      ) : (
        sections.map((section, index) => (
          <Paper
            key={`${section.title}-${index}`}
            shadow="sm"
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <Stack gap="md">
              <Text size="md" fw={700} c={palette.text}>
                {section.title}
              </Text>
              {section.tasks.length === 0 ? (
                <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
                  No tasks in this section.
                </Text>
              ) : (
                <Stack gap="sm">
                  {section.tasks.map((task, taskIndex) => (
                    <Group key={`${task.label}-${taskIndex}`} gap="sm" align="flex-start">
                      {task.completed ? (
                        <Icons.Save
                          size={20}
                          color="green"
                          style={{ marginTop: "2px", flexShrink: 0 }}
                        />
                      ) : (
                        <Icons.Circle
                          size={20}
                          color={palette.textSoft}
                          style={{ marginTop: "2px", flexShrink: 0 }}
                        />
                      )}
                      <Text
                        size="sm"
                        c={task.completed ? palette.textSoft : palette.text}
                        style={{
                          flex: 1,
                        }}
                      >
                        {task.label}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  );
}
