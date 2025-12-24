import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import { AppIcons } from "../ui/iconMap";
import { IconBook2 } from "@tabler/icons-react";
import PageHeaderCard from "../ui/PageHeaderCard";
import { LIBRARY_HEADER_SUBTITLE, WHITEPAPERS_CARD_SUBTITLE } from "../content/libraryCopy";

type LibraryPageProps = {
  palette: any;
  API_BASE: string;
};

export default function LibraryPage({ palette, API_BASE }: LibraryPageProps) {
  const navigate = useNavigate();

  const librarySections = [
    {
      title: "Whitepapers",
      description: WHITEPAPERS_CARD_SUBTITLE,
      path: "/whitepapers",
      icon: IconBook2,
    },
    {
      title: "Canonical Documents",
      description: "System reference documents",
      path: "/canonical-documents",
      icon: Icons.CanonicalDocs,
    },
    {
      title: "Documents",
      description: "Node-level documents",
      path: "/documents",
      icon: Icons.Documents,
    },
    {
      title: "Glossary",
      description: "Terminology and definitions",
      path: "/glossary",
      icon: AppIcons.glossary,
    },
  ];

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Library"
        subtitle={LIBRARY_HEADER_SUBTITLE}
        palette={palette}
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
          {librarySections.map((section) => (
            <Paper
              key={section.path}
              p="md"
              radius="md"
              style={{
                backgroundColor: palette.background,
                border: `1px solid ${palette.border}`,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => navigate(section.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = palette.header;
                e.currentTarget.style.borderColor = palette.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = palette.background;
                e.currentTarget.style.borderColor = palette.border;
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Group gap="md" align="flex-start" style={{ flex: 1 }}>
                  <section.icon size={24} color={palette.accent} />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text size="md" fw={600} c={palette.text}>
                      {section.title}
                    </Text>
                    <Text size="sm" c={palette.textSoft}>
                      {section.description}
                    </Text>
                  </Stack>
                </Group>
                <Icons.ArrowUpRight size={20} color={palette.textSoft} />
              </Group>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

