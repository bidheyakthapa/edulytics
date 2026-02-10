import express from "express";
import {
  createTopic,
  deleteTopic,
  getTopics,
  updateTopic,
} from "../controllers/topics.controller.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import {
  createTopicValidator,
  updateTopicValidator,
} from "../validators/topics.validator.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.get("/", authMiddleware, requireRole("TEACHER"), getTopics);

router.post(
  "/",
  authMiddleware,
  requireRole("TEACHER"),
  validate(createTopicValidator),
  createTopic,
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("TEACHER"),
  validate(updateTopicValidator),
  updateTopic,
);

router.delete("/:id", authMiddleware, requireRole("TEACHER"), deleteTopic);

export default router;
