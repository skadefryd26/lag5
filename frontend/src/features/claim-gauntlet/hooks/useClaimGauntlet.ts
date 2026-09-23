import { useMutation } from "@tanstack/react-query";
import { useState, useCallback, useEffect, useRef } from "react";
import { sendClaimMessage } from "../api/claimGauntletApi";
import { pickRandomPersona } from "../personas";
import type { ClaimGauntletHistoryEntry } from "../types";

const STARTING_EXHAUSTION_SCORE = 100;

type DisplayMessage = {
  role: "user" | "bjarne";
  text: string;
};

const ROUND_SECONDS = 60;
const TIMEOUT_PENALTY = 3;

const IMPATIENCE_LINES = [
  "Skal du svare i dag, eller venter du på at kaffen min skal bli kald først?",
  "Jeg har ventet så lenge at jeg rakk å hente meg en ny kaffe. Fortsatt ingenting fra deg.",
  "Er du der, eller skriver du en hel roman før du sender noe?",
  "Klokken tikker. Jeg tikker ikke like tålmodig som den.",
  "Jeg begynner å lure på om dette faktisk er en skademelding eller en test i min tålmodighet.",
];

function pickImpatienceLine(round: number): string {
  return IMPATIENCE_LINES[round % IMPATIENCE_LINES.length];
}

export function useClaimGauntlet() {
  const [persona, setPersona] = useState(() => pickRandomPersona());
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [annoyanceScore, setAnnoyanceScore] = useState(0);
  const [exhaustionScore, setExhaustionScore] = useState(STARTING_EXHAUSTION_SCORE);
  const [resolved, setResolved] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const timeoutRoundRef = useRef(0);

  const mutation = useMutation({
    mutationFn: (message: string) => {
      const history: ClaimGauntletHistoryEntry[] = messages;
      return sendClaimMessage({
        message,
        history,
        personaId: persona.id,
        currentScore: annoyanceScore,
        exhaustionScore,
      });
    },
    onSuccess: (result, message) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: message },
        { role: "bjarne", text: result.reply },
      ]);
      setAnnoyanceScore(result.annoyanceScore);
      setExhaustionScore(result.exhaustionScore);
      setResolved(result.resolved);
      setSecondsLeft(ROUND_SECONDS);
      timeoutRoundRef.current = 0;
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || resolved) return;
      mutation.mutate(message);
    },
    [mutation, resolved],
  );

  const restart = useCallback(() => {
    setPersona((currentPersona) => pickRandomPersona(currentPersona.id));
    setMessages([]);
    setAnnoyanceScore(0);
    setExhaustionScore(STARTING_EXHAUSTION_SCORE);
    setResolved(false);
    setSecondsLeft(ROUND_SECONDS);
    timeoutRoundRef.current = 0;
    mutation.reset();
  }, [mutation]);

  // Per-round pressure timer: ticks down while the customer is expected to
  // reply. Paused while resolved, or while a real request to Bjarne is in
  // flight (waiting for the API is not the customer's fault).
  useEffect(() => {
    if (resolved || mutation.isPending) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        timeoutRoundRef.current += 1;
        const line = pickImpatienceLine(timeoutRoundRef.current - 1);
        setMessages((msgs) => [...msgs, { role: "bjarne", text: line }]);
        setAnnoyanceScore((score) => score + TIMEOUT_PENALTY);
        return ROUND_SECONDS;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resolved, mutation.isPending]);

  return {
    messages,
    persona,
    annoyanceScore,
    exhaustionScore,
    resolved,
    sendMessage,
    restart,
    isSending: mutation.isPending,
    error: mutation.error as Error | null,
    secondsLeft,
    roundSeconds: ROUND_SECONDS,
  };
}
