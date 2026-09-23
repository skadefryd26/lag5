export type ScoreAdjustments = {
  annoyanceScore?: number;
  exhaustionScore?: number;
};

let pendingAdjustments: ScoreAdjustments = {};

export function setAnnoyanceScore(score: number): void {
  pendingAdjustments.annoyanceScore = score;
}

export function setExhaustionScore(score: number): void {
  pendingAdjustments.exhaustionScore = score;
}

export function takeScoreAdjustments(): ScoreAdjustments {
  const adjustments = pendingAdjustments;
  pendingAdjustments = {};
  return adjustments;
}
