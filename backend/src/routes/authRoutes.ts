import { Router } from "express";
import { registerUser, loginUser } from "../services/authService";
import { authMiddleware } from "../middleware/authMiddleware";
import type { AuthLoginRequest, AuthRegisterRequest } from "@lingolink/shared";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, username, phone, preferredLanguage }: AuthRegisterRequest = req.body;
    const { user, token } = await registerUser({ email, password, username, phone, preferredLanguage });
    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password }: AuthLoginRequest = req.body;
    const { user, token } = await loginUser(email, password);
    res.json({ user, token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

export default router;