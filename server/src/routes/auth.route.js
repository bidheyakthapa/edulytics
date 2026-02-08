import express from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", validate(registerValidator), register);
router.post("/login", validate(loginValidator), login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;
