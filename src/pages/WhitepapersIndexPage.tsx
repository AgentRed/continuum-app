import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import PageHeaderCard from "../ui/PageHeaderCard";
import { getTableStyles } from "../ui/tableStyles";
import { getAllWhitepapers } from "../lib/whitepapers";

type WhitepapersIndexPageProps = {
  palette: any;
};

export default function WhitepapersIndexPage({
  palette,
}: WhitepapersIndexPageProps) {
  const navigate = useNavigate();
  const whitepapers = getAllWhitepapers();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="System Papers"
        subtitle="Canonical orientation and operating doctrine"
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
          {whitepapers.length === 0 ? (
            <Text size="sm" c={palette.textSoft}>
              No whitepapers available.
            </Text>
          ) : (
            <Table
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed", width: "100%" }}
              styles={getTableStyles(palette)}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "40%" }}>Title</Table.Th>
                  <Table.Th style={{ width: "40%" }}>Description</Table.Th>
                  <Table.Th style={{ width: "20%" }}>Updated</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {whitepapers.map((whitepaper) => (
                  <Table.Tr
                    key={whitepaper.slug}
                    onClick={() => navigate(`/whitepapers/${whitepaper.slug}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td style={{ width: "40%" }}>
                      <Text size="sm" fw={500} c={palette.text}>
                        {whitepaper.title}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "40%" }}>
                      <Text size="sm" c={palette.textSoft} lineClamp={1}>
                        {whitepaper.description}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "20%" }}>
                      <Text size="xs" c={palette.textSoft}>
                        {formatDate(whitepaper.updatedAt)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}



