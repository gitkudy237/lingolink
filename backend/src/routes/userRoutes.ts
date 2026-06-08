import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { findUserById, updateUser } from "../models/userModel";

const router = Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { username, preferredLanguage } = req.body;
    if (!username && !preferredLanguage) {
      return res.status(400).json({ error: "No data provided for update" });
    }

    const user = await updateUser(req.user.id, { username, preferredLanguage });
    res.status(200).json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;