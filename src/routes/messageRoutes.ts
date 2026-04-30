import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { fetchMessages, markConversationRead, sendMessage } from "../services/messageService";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.params as { conversationId: string };
    const { type, originalText, transcriptionText, metadata } = req.body;

    const message = await sendMessage({
      senderId: req.user.id,
      conversationId,
      type,
      originalText,
      transcriptionText,
      metadata,
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.params as { conversationId: string };
    const limit = Number(req.query.limit ?? 50);
    const messages = await fetchMessages(conversationId, req.user.id, limit);

    res.status(200).json({ messages });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/read", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.params as { conversationId: string };
    await markConversationRead(conversationId, req.user.id);

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
