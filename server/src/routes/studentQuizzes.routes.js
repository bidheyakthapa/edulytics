import express from "express";
import {
  attemptQuiz,
  getQuizById,
  getQuizResult,
  getQuizzes,
} from "../controllers/studentQuizzes.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { authMiddleware } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { attemptQuizValidator } from "../validators/quizzes.validator.js";

const router = express.Router();

router.get("/", authMiddleware, requireRole("STUDENT"), getQuizzes);
router.post(
  "/:id/submit",
  authMiddleware,
  requireRole("STUDENT"),
  validate(attemptQuizValidator),
  attemptQuiz,
);
router.get(
  "/:id/result",
  authMiddleware,
  requireRole("STUDENT"),
  getQuizResult,
);
router.get("/:id", authMiddleware, requireRole("STUDENT"), getQuizById);

export default router;
