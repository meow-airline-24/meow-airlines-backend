import express, { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";

import apiRouter from "./api/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Serve static files, including uploaded images, from /public
router.use(
  "/uploads",
  express.static(path.join(__dirname, "../../public/uploads"))
);

router.use("/api/v1", apiRouter);


export default router;
