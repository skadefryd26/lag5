import { Router, type Request, type Response } from "express";
import type { ClaimGauntletRequest, ClaimGauntletResponse } from "../types/index.js";
import { askBjarne } from "../services/bjarneService.js";
import { AIGatewayError } from "../clients/aiGatewayClient.js";

export const claimGauntletRouter = Router();

claimGauntletRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body as Partial<ClaimGauntletRequest>;

  if (typeof body.message !== "string" || body.message.trim() === "") {
    res.status(400).json({ error: "message er påkrevd og kan ikke være tom." });
    return;
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const currentScore = typeof body.currentScore === "number" ? body.currentScore : 0;
  const exhaustionScore =
    typeof body.exhaustionScore === "number" ? body.exhaustionScore : 100;

  try {
    const result: ClaimGauntletResponse = await askBjarne(
      body.message,
      history,
      currentScore,
      exhaustionScore,
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
