import express from "express";
import {
  getCourses,
  getSemesters,
} from "../controllers/academics.controller.js";

const router = express.Router();

router.get("/courses", getCourses);
router.get("/semesters", getSemesters);

export default router;
