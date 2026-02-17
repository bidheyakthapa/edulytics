import express from "express";
import {
  createQuiz,
  deleteQuiz,
  getQuizById,
  getTeacherQuizzes,
  updateQuiz,
  updateQuizMeta,
} from "../controllers/quizzes.controller.js";
import validate from "../middleware/validate.js";
import {
  createQuizValidator,
  updateQuizMetaValidator,
} from "../validators/quizzes.validator.js";
import { requireRole } from "../middleware/requireRole.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requireRole("TEACHER"),
  validate(createQuizValidator),
  createQuiz,
);

router.get("/", authMiddleware, requireRole("TEACHER"), getTeacherQuizzes);

router.get("/:id", authMiddleware, requireRole("TEACHER"), getQuizById);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("TEACHER"),
  validate(createQuizValidator),
  updateQuiz,
);

router.patch(
  "/:id/meta",
  authMiddleware,
  requireRole("TEACHER"),
  validate(updateQuizMetaValidator),
  updateQuizMeta,
);

router.delete("/:id", authMiddleware, requireRole("TEACHER"), deleteQuiz);

export default router;
