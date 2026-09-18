import { Router, type Request, type Response } from "express";
import type { PanelError, PanelRequest, PanelResponse } from "../../../../../shared/panel.ts";
import { GatewayError } from "../clients/aiGateway.ts";
import { convenePanel } from "../services/panelService.ts";

const maxLength = 4000;

export const panelRoute = Router();

panelRoute.post("/", async (req: Request<unknown, unknown, Partial<PanelRequest>>, res: Response<PanelResponse | PanelError>) => {
  const claim = typeof req.body?.claim === "string" ? req.body.claim.trim() : "";
  if (!claim) {
    res.status(400).json({ error: "Skademeldingen er tom. Selv Bjarne trenger noe å sukke over." });
    return;
  }
  if (claim.length > maxLength) {
    res.status(400).json({ error: `Skademeldingen er for lang (maks ${maxLength} tegn). Bjarne leser ikke romaner.` });
    return;
  }

  try {
    res.json(await convenePanel(claim));
  } catch (error) {
    console.error(error);
    const message = error instanceof GatewayError ? error.message : "Noe gikk galt i panelet.";
    res.status(502).json({ error: message });
  }
});
