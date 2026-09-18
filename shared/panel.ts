// Contract between frontend and backend for the adjuster panel.

export type ExpertId = "pessimisten" | "optimisten" | "paragrafrytteren";

export type PanelRequest = {
  claim: string; // 1–4000 characters
};

export type ExpertOpinion = {
  id: ExpertId;
  name: string;
  text: string;
};

export type BjarneVerdict = {
  sigh: string;
  winner: ExpertId;
  verdict: string;
};

export type PanelResponse = {
  experts: ExpertOpinion[]; // always three, in fixed order
  bjarne: BjarneVerdict;
};

export type PanelError = {
  error: string; // Norwegian, safe to show to the user
};
