import { Router } from "express";
import { loginUser, registerUser } from "../services/authService";
import { authMiddleware } from "../middleware/authMiddleware";
import { findUserById } from "../models/userModel";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, phone, username, password, preferredLanguage } = req.body;
    const result = await registerUser({ email, phone, username, password, preferredLanguage });
    res.status(201).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        username: result.user.username,
        preferredLanguage: result.user.preferredLanguage,
        createdAt: result.user.createdAt,
      },
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await loginUser(identifier, password);
    res.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        username: result.user.username,
        preferredLanguage: result.user.preferredLanguage,
        createdAt: result.user.createdAt,
      },
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
