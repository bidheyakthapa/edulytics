import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createProject,
  getProjects,
  generateGroups,
  getProjectGroups,
  swapStudents,
  getMyGroup,
  deleteProject,
} from "../controllers/groups.controller.js";

const router = express.Router();

router.post("/projects", authMiddleware, requireRole("TEACHER"), createProject);
router.get("/projects", authMiddleware, requireRole("TEACHER"), getProjects);
router.post(
  "/projects/:id/generate",
  authMiddleware,
  requireRole("TEACHER"),
  generateGroups,
);
router.get(
  "/projects/:id",
  authMiddleware,
  requireRole("TEACHER"),
  getProjectGroups,
);
router.delete(
  "/projects/:id",
  authMiddleware,
  requireRole("TEACHER"),
  deleteProject,
);
router.put(
  "/projects/:id/swap",
  authMiddleware,
  requireRole("TEACHER"),
  swapStudents,
);

router.get("/my-group", authMiddleware, requireRole("STUDENT"), getMyGroup);

export default router;
