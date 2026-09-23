import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useClaimGauntlet } from "../hooks/useClaimGauntlet";
import { BjarneFace, type BjarneFaceHandle } from "../game-ui/BjarneFace";
import { GameHud, type GameHudHandle } from "../game-ui/GameHud";
import { AdminScoreModal } from "./AdminScoreModal";
import { BjarneHeader } from "../game-ui/BjarneHeader";
import { ClaimAcceptedModal } from "./ClaimAcceptedModal";

function vignetteIntensity(secondsLeft: number, roundSeconds: number) {
  const ratio = secondsLeft / roundSeconds;
  if (ratio > 0.5) return null;

  const pulseDuration = 0.5 + ratio * 3.4;
  const maxOpacity = 0.35 + (1 - ratio) * 0.55;
  const minOpacity = maxOpacity * 0.35;

  return { pulseDuration, maxOpacity, minOpacity };
}

// Bjarnes ansikt og dialogboksen skal være like høye, så de ser ut som ett par.
const FACE_SIZE = 280;
const FACE_HEIGHT = FACE_SIZE * 1.15;
const DIALOG_PADDING = 32; // Paper p="md" (16px) på topp og bunn.

// Alle uttrykkene Bjarnes ansikt kan vise (se bjarne.html) — brukes når svaret
// hans skal få et helt tilfeldig uttrykk i stedet for et som passer teksten.
const ALL_EXPRESSIONS = [
  "skeptisk",
  "mistenksom",
  "tvilende",
  "irritert",
  "sint",
  "rasende",
  "undrende",
  "tenkende",
  "forbauset",
  "sporrende",
  "forvirret",
  "hae",
  "noytral",
  "fornoyd",
  "oppgitt",
  "leiseg",
  "grimase",
];

// Skjer det ingenting på 20 sekunder, bytter Bjarne ansiktsuttrykk selv —
// han later ikke som han står stille og venter.
const IDLE_MS = 20_000;
const IDLE_EXPRESSIONS = [
  "undrende",
  "tenkende",
  "skeptisk",
  "oppgitt",
  "mistenksom",
  "tvilende",
  "forbauset",
  "sporrende",
];

// Samme varighet som QR-badgen i BjarneFace viser seg selv: når den er
// ferdig, går vi videre til skjermen for mottatt skademelding.
const QR_BADGE_MS = 10_000;

export function ClaimGauntletScreen() {
  const [draft, setDraft] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminKeys, setAdminKeys] = useState("");
  const {
    messages,
    annoyanceScore,
    energyScore,
    resolved,
    suggestions,
    sendMessage,
    restart,
    forceResolve,
    isSending,
    error,
    persona,
    secondsLeft,
    roundSeconds,
  } = useClaimGauntlet();
  const faceRef = useRef<BjarneFaceHandle>(null);
  const hudRef = useRef<GameHudHandle>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSubmit() {
    if (!draft.trim()) return;
    if (draft.trim() === "Meld skade nå!!!") {
      faceRef.current?.showQrBadge();
      if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
      qrTimerRef.current = setTimeout(forceResolve, QR_BADGE_MS);
    }
    hudRef.current?.onSend();
    sendMessage(draft.trim());
    setDraft("");
  }

  function handleSuggestionClick(suggestion: string) {
    hudRef.current?.onSend();
    sendMessage(suggestion);
    setDraft("");
  }

  function handleRestart() {
    if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
    restart();
  }

  const vignette = resolved ? null : vignetteIntensity(secondsLeft, roundSeconds);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      const nextKeys = `${adminKeys}${event.key.toLowerCase()}`.slice(-3);
      setAdminKeys(nextKeys);
      if (nextKeys === "aaa") {
        setAdminOpen(true);
        setAdminKeys("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adminKeys]);

  useEffect(() => {
    return () => {
      if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isSending) faceRef.current?.setExpression("tenkende");
  }, [isSending]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "bjarne") {
      // Annenhver gang (omtrent) får han et helt tilfeldig uttrykk i stedet
      // for et som faktisk passer svaret — det er mer Bjarne sånn.
      if (Math.random() < 0.5) {
        const pick = ALL_EXPRESSIONS[Math.floor(Math.random() * ALL_EXPRESSIONS.length)];
        faceRef.current?.setExpression(pick);
      } else {
        faceRef.current?.reactTo(last.text);
      }
      hudRef.current?.onReply(annoyanceScore, energyScore, resolved);

      // Kundens meldinger og Bjarnes svar legges til samtidig (samme
      // setMessages-kall), så vi teller kundens meldinger her i stedet
      // for i en egen "user"-gren som aldri ville blitt truffet.
      const userCount = messages.filter((m) => m.role === "user").length;
      hudRef.current?.onUserMessageCount(userCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Ansiktet skal alltid vise noe: bytt uttrykk ved hver melding (over), og
  // hvis det er helt stille, la Bjarne skifte uttrykk selv hvert 20. sekund.
  useEffect(() => {
    function scheduleIdle() {
      idleTimerRef.current = setTimeout(() => {
        const pick = IDLE_EXPRESSIONS[Math.floor(Math.random() * IDLE_EXPRESSIONS.length)];
        faceRef.current?.setExpression(pick);
        scheduleIdle();
      }, IDLE_MS);
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!resolved) scheduleIdle();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [messages, isSending, resolved]);

  return (
    <Box maw={900} mx="auto" py="xl" px="md">
      {vignette && (
        <div
          className="claim-gauntlet-vignette"
          style={
            {
              animationDuration: `${vignette.pulseDuration}s`,
              "--vignette-min-opacity": vignette.minOpacity,
              "--vignette-max-opacity": vignette.maxOpacity,
            } as CSSProperties
          }
        />
      )}
      <Box mb="md">
        <BjarneHeader />
      </Box>

      <Card withBorder radius="md" p="md" mb="md" bg="dark.7">
        <div>
          <Text size="xs" tt="uppercase" fw={700} c="orange.4" lts="0.08em">
            Du møtte
          </Text>
          <Text fw={700} size="lg">
            {persona.name}
          </Text>
          <Text size="sm" c="dimmed">
            {persona.description}
          </Text>
        </div>
      </Card>

      <Group align="stretch" wrap="nowrap" gap="md" mb="xs">
        <Paper
          withBorder
          radius="md"
          p="md"
          bg="dark.8"
          style={{ flex: 1, minWidth: 0, height: FACE_HEIGHT }}
        >
          <ScrollArea h={FACE_HEIGHT - DIALOG_PADDING} type="auto">
            <Stack gap="sm">
              {messages.length === 0 && (
                <Text c="dimmed" fs="italic">Bjarne har ikke sukket ennå. Skriv skademeldingen din under.</Text>
              )}
              {messages.map((m, i) => (
                <Paper
                  key={i}
                  p="sm"
                  radius="md"
                  bg={m.role === "bjarne" ? "dark.6" : "blue.9"}
                  style={{ alignSelf: m.role === "bjarne" ? "flex-start" : "flex-end", maxWidth: "85%" }}
                >
                  <Text size="xs" c="dimmed" mb={4}>{m.role === "bjarne" ? "Bjarne" : "Deg"}</Text>
                  <Text>{m.text}</Text>
                </Paper>
              ))}
              {isSending && (
                <Paper p="sm" radius="md" bg="dark.6" style={{ alignSelf: "flex-start" }}>
                  <Text size="xs" c="dimmed" mb={4}>Bjarne</Text>
                  <Text fs="italic" c="dimmed">… sukker og later som han leser meldingen din …</Text>
                </Paper>
              )}
            </Stack>
          </ScrollArea>
        </Paper>
        <BjarneFace ref={faceRef} size={FACE_SIZE} />
      </Group>

      <GameHud ref={hudRef} />

      {error && (
        <Alert color="red" mb="md" title="Bjarne har gitt helt opp">{error.message}</Alert>
      )}

      {!resolved && (
        <Stack gap="xs">
          {suggestions.length > 0 && !isSending && (
            <Group gap="xs">
              {suggestions.map((suggestion, i) => (
                <Chip
                  key={i}
                  variant="light"
                  color="orange"
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{ cursor: "pointer" }}
                >
                  {suggestion}
                </Chip>
              ))}
            </Group>
          )}
          <Group align="flex-end">
            <Textarea
              flex={1}
              size="lg"
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
            <Button size="lg" onClick={handleSubmit} loading={isSending} color="orange">
              Send til Bjarne
            </Button>
          </Group>
        </Stack>
      )}
      <ClaimAcceptedModal opened={resolved} energyScore={energyScore} onNewClaim={handleRestart} />
      <AdminScoreModal opened={adminOpen} onClose={() => setAdminOpen(false)} />
    </Box>
  );
}
