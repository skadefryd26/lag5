import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useClaimGauntlet } from "../hooks/useClaimGauntlet";

function scoreColor(score: number): string {
  if (score >= 12) return "red";
  if (score >= 6) return "orange";
  return "yellow";
}

function scoreLabel(score: number): string {
  if (score >= 12) return "Bjarne vurderer å legge på røret";
  if (score >= 6) return "Bjarne sukker hørbart";
  if (score >= 1) return "Bjarne løfter et øyebryn";
  return "Bjarne later som han hører etter";
}

export function ClaimGauntletScreen() {
  const [draft, setDraft] = useState("");
  const { messages, annoyanceScore, resolved, sendMessage, restart, isSending, error } =
    useClaimGauntlet();

  function handleSubmit() {
    if (!draft.trim()) return;
    sendMessage(draft.trim());
    setDraft("");
  }

  return (
    <Box maw={720} mx="auto" py="xl" px="md">
      <Group justify="space-between" align="flex-start" mb="md">
        <Group>
          <Avatar color="dark" radius="xl" size="lg">
            B
          </Avatar>
          <div>
            <Title order={2} c="orange.6">
              Bjarnes Erstatningsprøvelse
            </Title>
            <Text size="sm" c="dimmed">
              Meld en skade. Om du tør.
            </Text>
          </div>
        </Group>
        <Badge color={scoreColor(annoyanceScore)} size="lg" variant="filled">
          Irritasjonsscore: {annoyanceScore}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="xs">
        {scoreLabel(annoyanceScore)}
      </Text>

      <Paper withBorder radius="md" p="md" mb="md" bg="dark.8">
        <ScrollArea h={360} type="auto">
          <Stack gap="sm">
            {messages.length === 0 && (
              <Text c="dimmed" fs="italic">
                Bjarne har ikke sukket ennå. Skriv skademeldingen din under.
              </Text>
            )}
            {messages.map((m, i) => (
              <Paper
                key={i}
                p="sm"
                radius="md"
                bg={m.role === "bjarne" ? "dark.6" : "blue.9"}
                style={{ alignSelf: m.role === "bjarne" ? "flex-start" : "flex-end", maxWidth: "85%" }}
              >
                <Text size="xs" c="dimmed" mb={4}>
                  {m.role === "bjarne" ? "Bjarne" : "Deg"}
                </Text>
                <Text>{m.text}</Text>
              </Paper>
            ))}
            {isSending && (
              <Paper p="sm" radius="md" bg="dark.6" style={{ alignSelf: "flex-start" }}>
                <Text size="xs" c="dimmed" mb={4}>
                  Bjarne
                </Text>
                <Text fs="italic" c="dimmed">
                  … sukker og later som han leser meldingen din …
                </Text>
              </Paper>
            )}
          </Stack>
        </ScrollArea>
      </Paper>

      {error && (
        <Alert color="red" mb="md" title="Bjarne har gitt helt opp">
          {error.message}
        </Alert>
      )}

      {resolved ? (
        <Stack align="center" gap="xs">
          <Text fw={700} c="green.5">
            Bjarne godtok skademeldingen din. Motvillig.
          </Text>
          <Button onClick={restart} variant="light" color="orange">
            Meld en ny skade (om du orker)
          </Button>
        </Stack>
      ) : (
        <Group align="flex-end">
          <Textarea
            flex={1}
            placeholder="Beskriv skaden din, om du tør…"
            autosize
            minRows={2}
            maxRows={5}
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button onClick={handleSubmit} loading={isSending} color="orange">
            Send til Bjarne
          </Button>
        </Group>
      )}
    </Box>
  );
}
