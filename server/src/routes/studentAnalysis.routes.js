import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getAnalysis } from "../controllers/studentAnalysis.controller.js";

const router = express.Router();

router.get("/", authMiddleware, requireRole("STUDENT"), getAnalysis);

export default router;
