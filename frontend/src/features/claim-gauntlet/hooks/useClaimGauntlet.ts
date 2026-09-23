import { useMutation } from "@tanstack/react-query";
import { useState, useCallback, useEffect, useRef } from "react";
import { sendClaimMessage } from "../api/claimGauntletApi";
import { pickRandomPersona } from "../personas";
import type { ClaimGauntletHistoryEntry } from "../types";

const STARTING_ENERGY_SCORE = 100;

type DisplayMessage = {
  role: "user" | "bjarne";
  text: string;
};

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

function createInitialGame() {
  const persona = pickRandomPersona();
  return { persona, secondsLeft: persona.rules.roundSeconds };
}

export function useClaimGauntlet() {
  const [initialGame] = useState(createInitialGame);
  const [persona, setPersona] = useState(initialGame.persona);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [annoyanceScore, setAnnoyanceScore] = useState(0);
  const [energyScore, setEnergyScore] = useState(STARTING_ENERGY_SCORE);
  const [resolved, setResolved] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(initialGame.secondsLeft);
  const timeoutRoundRef = useRef(0);
  const energyScoreRef = useRef(STARTING_ENERGY_SCORE);

  const mutation = useMutation({
    mutationFn: (message: string) => {
      const history: ClaimGauntletHistoryEntry[] = messages;
      return sendClaimMessage({
        message,
        history,
        personaId: persona.id,
        currentScore: annoyanceScore,
        energyScore,
      });
    },
    onSuccess: (result, message) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: message },
        { role: "bjarne", text: result.reply },
      ]);
      setAnnoyanceScore(result.annoyanceScore);
      setEnergyScore(result.energyScore);
      energyScoreRef.current = result.energyScore;
      setResolved(result.resolved);
      setSuggestions(result.suggestions ?? []);
      setSecondsLeft(persona.rules.roundSeconds);
      timeoutRoundRef.current = 0;
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || resolved) return;
      setSuggestions([]);
      mutation.mutate(message);
    },
    [mutation, resolved],
  );

  // Brukes av snarveier som ikke går via et vanlig Bjarne-svar (f.eks. "Vipps"-
  // QR-koden): sender rett til skjermen for mottatt skademelding.
  const forceResolve = useCallback(() => {
    setResolved(true);
  }, []);

  const restart = useCallback(() => {
    const nextPersona = pickRandomPersona(persona.id);
    setPersona(nextPersona);
    setMessages([]);
    setAnnoyanceScore(0);
    setEnergyScore(STARTING_ENERGY_SCORE);
    energyScoreRef.current = STARTING_ENERGY_SCORE;
    setResolved(false);
    setSuggestions([]);
    setSecondsLeft(nextPersona.rules.roundSeconds);
    timeoutRoundRef.current = 0;
    mutation.reset();
  }, [mutation, persona.id]);

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
        setAnnoyanceScore((score) => score + persona.rules.timeoutAnnoyancePenalty);
        const nextEnergyScore = Math.max(
          0,
          energyScoreRef.current - persona.rules.timeoutExhaustionPenalty,
        );
        energyScoreRef.current = nextEnergyScore;
        setEnergyScore(nextEnergyScore);
        if (nextEnergyScore === 0) setResolved(true);
        setSuggestions([]);
        return persona.rules.roundSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [persona, resolved, mutation.isPending]);

  return {
    messages,
    persona,
    annoyanceScore,
    energyScore,
    resolved,
    suggestions,
    sendMessage,
    restart,
    forceResolve,
    isSending: mutation.isPending,
    error: mutation.error as Error | null,
    secondsLeft,
    roundSeconds: persona.rules.roundSeconds,
  };
}
