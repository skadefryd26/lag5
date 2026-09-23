import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import cors from "cors";
import { claimGauntletRouter } from "./features/claim-gauntlet/routes/claimGauntletRouter.js";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use("/api/claim-gauntlet", claimGauntletRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "Bjarne er våken, dessverre." });
});

app.listen(port, () => {
  console.log(`Backend kjører på http://localhost:${port}`);
});
