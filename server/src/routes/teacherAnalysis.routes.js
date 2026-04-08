import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getTopicAnalysis,
  getStudentAnalysis,
} from "../controllers/teacherAnalysis.controller.js";

const router = express.Router();

router.get("/topics", authMiddleware, requireRole("TEACHER"), getTopicAnalysis);

router.get(
  "/students",
  authMiddleware,
  requireRole("TEACHER"),
  getStudentAnalysis,
);

export default router;
