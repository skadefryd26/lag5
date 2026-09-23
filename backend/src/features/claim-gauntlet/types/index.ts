export type ClaimGauntletHistoryEntry = {
  role: "user" | "bjarne";
  text: string;
};

export type ClaimGauntletRequest = {
  message: string;
  history: ClaimGauntletHistoryEntry[];
  currentScore?: number;
  exhaustionScore?: number;
};

export type ClaimGauntletResponse = {
  reply: string;
  annoyanceScore: number;
  exhaustionScore: number;
  resolved: boolean;
  suggestions: string[];
};

export type AIGatewayBody = {
  model: string;
  instructions: string;
  input: string;
  stream: boolean;
};

export type ResponseContent = {
  type: string;
  text?: string;
};

export type ResponseOutput = {
  type: string;
  content?: ResponseContent[];
};

export type ResponseUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type ResponsesApiResponse = {
  id: string;
  model: string;
  output: ResponseOutput[];
  usage?: ResponseUsage;
};
