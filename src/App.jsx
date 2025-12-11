import { useEffect, useState } from "react";
import {
  AppShell,
  Container,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Loader,
  Alert,
  Table,
  Stack,
  ScrollArea,
} from "@mantine/core";

function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    async function loadWorkspaces() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${baseUrl}/api/workspaces`);

        if (!response.ok) {
          throw new Error(`API error, status ${response.status}`);
        }

        const data = await response.json();
        setWorkspaces(data);
      } catch (err) {
        setError(err.message || "Failed to load workspaces");
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaces();
  }, []);

  const rows = workspaces.map((ws) => (
    <Table.Tr key={ws.id}>
      <Table.Td>
        <Group gap="xs">
          <Badge variant="light" color="blue">
            {ws.tenant?.name || "Unknown tenant"}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>{ws.name}</Table.Td>
      <Table.Td>{ws._count?.nodes ?? 0}</Table.Td>
      <Table.Td>
        {ws.createdAt ? new Date(ws.createdAt).toLocaleString() : "Unknown"}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Badge size="lg" radius="sm" variant="filled" color="blue">
              Continuum
            </Badge>
            <Text fw={500}>Workspace Browser</Text>
          </Group>
          <Button variant="light" disabled>
            New Workspace (coming soon)
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          <Stack gap="md">
            <div>
              <Title order={2}>Workspaces</Title>
              <Text c="dimmed" size="sm">
                Fetched from Continuum Core at{" "}
                {import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}
              </Text>
            </div>

            {loading && (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            )}

            {error && !loading && (
              <Alert color="red" title="Could not load workspaces">
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Tenant</Table.Th>
                      <Table.Th>Workspace</Table.Th>
                      <Table.Th>Nodes</Table.Th>
                      <Table.Th>Created</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {rows.length > 0 ? (
                      rows
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={4}>
                          <Text c="dimmed" ta="center">
                            No workspaces found yet.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
