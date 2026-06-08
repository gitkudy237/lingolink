import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createDirectConversation,
  createGroupConversation,
  getConversationDetails,
  listConversations,
  updateConversationDetails,
} from "../services/conversationService";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversations = await listConversations(req.user.id);
    res.status(200).json({ conversations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { type, otherUserId, title, participantIds } = req.body;

    if (type === "direct") {
      if (!otherUserId) {
        return res.status(400).json({ error: "otherUserId is required for direct conversations" });
      }
      const conversation = await createDirectConversation(req.user.id, otherUserId);
      return res.status(201).json({ conversation });
    }

    if (type === "group") {
      const conversation = await createGroupConversation(req.user.id, title, participantIds || []);
      return res.status(201).json({ conversation });
    }

    res.status(400).json({ error: "Invalid conversation type" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversation = await getConversationDetails(req.params.id, req.user.id);
    res.status(200).json({ conversation });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, avatarUrl, participantIds } = req.body;
    const conversation = await updateConversationDetails(req.user.id, req.params.id, {
      title,
      avatarUrl,
      participantIds,
    });

    res.status(200).json({ conversation });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
