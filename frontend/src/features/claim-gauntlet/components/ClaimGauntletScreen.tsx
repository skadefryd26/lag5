import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
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
import { BjarneFace, type BjarneFaceHandle } from "../game-ui/BjarneFace";
import { GameHud, type GameHudHandle } from "../game-ui/GameHud";

export function ClaimGauntletScreen() {
  const [draft, setDraft] = useState("");
  const { messages, annoyanceScore, resolved, sendMessage, restart, isSending, error } =
    useClaimGauntlet();
  const faceRef = useRef<BjarneFaceHandle>(null);
  const hudRef = useRef<GameHudHandle>(null);

  function handleSubmit() {
    if (!draft.trim()) return;
    hudRef.current?.onSend();
    sendMessage(draft.trim());
    setDraft("");
  }

  useEffect(() => {
    if (isSending) faceRef.current?.setExpression("tenkende");
  }, [isSending]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "bjarne") {
      faceRef.current?.reactTo(last.text);
      hudRef.current?.onReply(annoyanceScore, resolved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <Box maw={900} mx="auto" py="xl" px="md">
      <Group mb="md">
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

      <Group align="stretch" wrap="nowrap" gap="md" mb="xs">
        <Paper withBorder radius="md" p="md" bg="dark.8" style={{ flex: 1, minWidth: 0 }}>
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
                  style={{
                    alignSelf: m.role === "bjarne" ? "flex-start" : "flex-end",
                    maxWidth: "85%",
                  }}
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

        <BjarneFace ref={faceRef} size={280} />
      </Group>

      <GameHud ref={hudRef} />

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
