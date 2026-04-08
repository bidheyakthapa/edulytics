import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getTeacherDashboard,
  getStudentDashboard,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
  "/teacher",
  authMiddleware,
  requireRole("TEACHER"),
  getTeacherDashboard,
);

router.get(
  "/student",
  authMiddleware,
  requireRole("STUDENT"),
  getStudentDashboard,
);

export default router;
