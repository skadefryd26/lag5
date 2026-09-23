import { Router, type Request, type Response } from "express";
import {
  setAnnoyanceScore,
  setEnergyScore,
} from "../services/scoreAdjustmentService.js";

export const scoreAdjustmentRouter = Router();

function readScore(req: Request, res: Response): number | null {
  const rawScore = req.query.score;
  const score = typeof rawScore === "string" ? Number(rawScore) : NaN;

  if (!Number.isInteger(score) || score < 0 || score > 100) {
    res.status(400).json({ error: "score må være et helt tall fra 0 til 100." });
    return null;
  }

  return score;
}

function readBodyScore(value: unknown): number | undefined | null {
  if (value === undefined || value === "") return undefined;
  const score = typeof value === "number" ? value : Number(value);
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : null;
}

scoreAdjustmentRouter.get("/annoyance", (req, res) => {
  const score = readScore(req, res);
  if (score === null) return;

  setAnnoyanceScore(score);
  res.json({ message: "Irritasjonsscore satt for neste melding.", annoyanceScore: score });
});

scoreAdjustmentRouter.get("/energy", (req, res) => {
  const score = readScore(req, res);
  if (score === null) return;

  setEnergyScore(score);
  res.json({ message: "Energinivå satt for neste melding.", energyScore: score });
});

scoreAdjustmentRouter.post("/", (req, res) => {
  const body = req.body as {
    annoyanceScore?: unknown;
    energyScore?: unknown;
  };
  const annoyanceScore = readBodyScore(body.annoyanceScore);
  const energyScore = readBodyScore(body.energyScore);

  if (annoyanceScore === null || energyScore === null) {
    res.status(400).json({ error: "Score-ene må være heltall fra 0 til 100." });
    return;
  }

  if (annoyanceScore === undefined && energyScore === undefined) {
    res.status(400).json({ error: "Oppgi minst én score." });
    return;
  }

  if (annoyanceScore !== undefined) setAnnoyanceScore(annoyanceScore);
  if (energyScore !== undefined) setEnergyScore(energyScore);

  res.json({
    message: "Score satt for neste melding.",
    ...(annoyanceScore !== undefined ? { annoyanceScore } : {}),
    ...(energyScore !== undefined ? { energyScore } : {}),
  });
});
