import express from "express";
import { panelRoute } from "./features/panel/routes/panelRoute.ts";

const port = 3055;
const app = express();

app.use(express.json({ limit: "100kb" }));
app.use("/api/panel", panelRoute);

app.listen(port, () => {
  console.log(`Backend kjører på http://localhost:${port}`);
});
