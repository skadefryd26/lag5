export type ClaimGauntletHistoryEntry = {
  role: "user" | "bjarne";
  text: string;
};

export type BjarnePersonaId = "coffee-strike" | "bureaucrat" | "after-lunch";

export type BjarneDifficulty = "lett" | "middels" | "vanskelig";

export type BjarnePersona = {
  id: BjarnePersonaId;
  name: string;
  difficulty: BjarneDifficulty;
  description: string;
};

export type ClaimGauntletRequest = {
  message: string;
  history: ClaimGauntletHistoryEntry[];
  personaId: BjarnePersonaId;
  currentScore?: number;
  energyScore?: number;
};

export type ClaimGauntletResponse = {
  personaId: BjarnePersonaId;
  reply: string;
  annoyanceScore: number;
  energyScore: number;
  resolved: boolean;
};
