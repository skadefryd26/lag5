import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { sendClaimMessage } from "../api/claimGauntletApi";
import type { ClaimGauntletHistoryEntry } from "../types";

type DisplayMessage = {
  role: "user" | "bjarne";
  text: string;
};

export function useClaimGauntlet() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [annoyanceScore, setAnnoyanceScore] = useState(0);
  const [resolved, setResolved] = useState(false);

  const mutation = useMutation({
    mutationFn: (message: string) => {
      const history: ClaimGauntletHistoryEntry[] = messages;
      return sendClaimMessage({ message, history, currentScore: annoyanceScore });
    },
    onSuccess: (result, message) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: message },
        { role: "bjarne", text: result.reply },
      ]);
      setAnnoyanceScore(result.annoyanceScore);
      setResolved(result.resolved);
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
    setMessages([]);
    setAnnoyanceScore(0);
    setResolved(false);
    mutation.reset();
  }, [mutation]);

  return {
    messages,
    annoyanceScore,
    resolved,
    sendMessage,
    restart,
    isSending: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
