import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import DocumentViewer from "../components/DocumentViewer";
import { getWhitepaperBySlug } from "../lib/whitepapers";

type WhitepaperViewPageProps = {
  palette: any;
};

export default function WhitepaperViewPage({
  palette,
}: WhitepaperViewPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const whitepaper = slug ? getWhitepaperBySlug(slug) : undefined;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!whitepaper) {
    return (
      <Stack gap="md">
        <PageHeaderCard
          title="Whitepaper Not Found"
          subtitle="The requested whitepaper could not be found."
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
            <Text size="sm" c={palette.text}>
              The whitepaper you are looking for does not exist.
            </Text>
            <Button
              leftSection={<Icons.ArrowLeft size={16} />}
              onClick={() => navigate("/whitepapers")}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background || "#000814",
                },
              }}
            >
              Back to System Papers
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <PageHeaderCard
        title={whitepaper.title}
        subtitle="Read-only reference document"
        palette={palette}
        right={
          <Button
            leftSection={<Icons.ArrowLeft size={16} />}
            onClick={() => navigate("/whitepapers")}
            variant="subtle"
            styles={{
              root: {
                color: palette.text,
              },
            }}
          >
            Back
          </Button>
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
          <Text size="xs" c={palette.textSoft}>
            Last updated: {formatDate(whitepaper.updatedAt)}
          </Text>
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
        }}
      >
        <DocumentViewer
          content={whitepaper.markdown}
          palette={palette}
          maxHeight="none"
        />
      </Paper>

      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
        }}
      >
        <Text size="xs" c={palette.textSoft} style={{ textAlign: "center" }}>
          This document is intentionally non-editable.
        </Text>
      </Paper>
    </Stack>
  );
}



