export type ScoreAdjustments = {
  annoyanceScore?: number;
  energyScore?: number;
};

let pendingAdjustments: ScoreAdjustments = {};

export function setAnnoyanceScore(score: number): void {
  pendingAdjustments.annoyanceScore = score;
}

export function setEnergyScore(score: number): void {
  pendingAdjustments.energyScore = score;
}

export function takeScoreAdjustments(): ScoreAdjustments {
  const adjustments = pendingAdjustments;
  pendingAdjustments = {};
  return adjustments;
}
