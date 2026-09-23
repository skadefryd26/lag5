export type ClaimGauntletHistoryEntry = {
  role: "user" | "bjarne";
  text: string;
};

export type ClaimGauntletRequest = {
  message: string;
  history: ClaimGauntletHistoryEntry[];
  currentScore?: number;
};

export type ClaimGauntletResponse = {
  reply: string;
  annoyanceScore: number;
  resolved: boolean;
};
