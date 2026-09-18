import { Alert, Container, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { BjarneVerdict } from "../components/BjarneVerdict.tsx";
import { ExpertCard } from "../components/ExpertCard.tsx";
import { PanelForm } from "../components/PanelForm.tsx";
import { usePanel } from "../hooks/usePanel.ts";

export function PanelPage() {
  const panel = usePanel();
  const result = panel.data;
  const winnerName = result?.experts.find((e) => e.id === result.bjarne.winner)?.name ?? "";

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title>Takstmennenes krangel</Title>
          <Text c="dimmed">Tre takstmenn. Én skade. Null enighet. Bjarne leder møtet, dessverre.</Text>
        </div>

        <PanelForm onSubmit={(claim) => panel.mutate({ claim })} isLoading={panel.isPending} />

        {panel.isPending && (
          <Stack align="center" gap="xs">
            <Loader />
            <Text c="dimmed">Bjarne leter etter kaffe før møtet starter …</Text>
          </Stack>
        )}

        {panel.isError && (
          <Alert color="red" title="Panelet ble avlyst">
            {panel.error.message}
          </Alert>
        )}

        {result && !panel.isPending && (
          <>
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              {result.experts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} isWinner={expert.id === result.bjarne.winner} />
              ))}
            </SimpleGrid>
            <BjarneVerdict verdict={result.bjarne} winnerName={winnerName} />
          </>
        )}
      </Stack>
    </Container>
  );
}
