import { Router, type Request, type Response } from "express";
import type { ClaimGauntletRequest, ClaimGauntletResponse } from "../types/index.js";
import { askBjarne } from "../services/bjarneService.js";
import { AIGatewayError } from "../clients/aiGatewayClient.js";
import { takeScoreAdjustments } from "../services/scoreAdjustmentService.js";
import { isBjarnePersonaId } from "../personas.js";

export const claimGauntletRouter = Router();

claimGauntletRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body as Partial<ClaimGauntletRequest>;

  if (typeof body.message !== "string" || body.message.trim() === "") {
    res.status(400).json({ error: "message er påkrevd og kan ikke være tom." });
    return;
  }

  if (!isBjarnePersonaId(body.personaId)) {
    res.status(400).json({ error: "personaId er påkrevd og må være en kjent Bjarne-persona." });
    return;
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const adjustments = takeScoreAdjustments();
  const currentScore =
    adjustments.annoyanceScore ??
    (typeof body.currentScore === "number" ? body.currentScore : 0);
  const energyScore =
    adjustments.energyScore ??
    (typeof body.energyScore === "number" ? body.energyScore : 100);

  try {
    const result: ClaimGauntletResponse = await askBjarne(
      body.message,
      history,
      currentScore,
      energyScore,
      body.personaId,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof AIGatewayError) {
      res.status(502).json({ error: error.message });
      return;
    }
    console.error("Uventet feil i claim-gauntlet:", error);
    res.status(500).json({ error: "Noe gikk galt hos Bjarne. Prøv igjen." });
  }
});
