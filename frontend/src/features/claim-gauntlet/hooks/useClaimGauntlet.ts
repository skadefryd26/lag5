import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { sendClaimMessage } from "../api/claimGauntletApi";
import type { ClaimGauntletHistoryEntry } from "../types";

const STARTING_EXHAUSTION_SCORE = 100;

type DisplayMessage = {
  role: "user" | "bjarne";
  text: string;
};

export function useClaimGauntlet() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [annoyanceScore, setAnnoyanceScore] = useState(0);
  const [exhaustionScore, setExhaustionScore] = useState(STARTING_EXHAUSTION_SCORE);
  const [resolved, setResolved] = useState(false);

  const mutation = useMutation({
    mutationFn: (message: string) => {
      const history: ClaimGauntletHistoryEntry[] = messages;
      return sendClaimMessage({
        message,
        history,
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
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || resolved) return;
      mutation.mutate(message);
    },
    [annoyanceScore, exhaustionScore, messages, mutation, resolved],
  );

  const restart = useCallback(() => {
    setMessages([]);
    setAnnoyanceScore(0);
    setExhaustionScore(STARTING_EXHAUSTION_SCORE);
    setResolved(false);
    mutation.reset();
  }, [mutation]);

  return {
    messages,
    annoyanceScore,
    exhaustionScore,
    resolved,
    sendMessage,
    restart,
    isSending: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
