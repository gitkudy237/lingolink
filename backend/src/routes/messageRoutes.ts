import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { findConversationByIdWithParticipants } from "../models/conversationModel";
import { fetchMessages, markConversationRead, sendMessage } from "../services/messageService";
import { Prisma } from "@prisma/client";

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

    const conversation = await findConversationByIdWithParticipants(conversationId);
    const io = req.app.get("io");

    if (io) {
      io.to(`conversation:${conversationId}`).emit("message", {
        id: message.id,
        conversationId,
        senderId: req.user.id,
        senderEmail: req.user.email,
        type: message.type,
        originalText: message.originalText,
        translatedText: message.translatedText,
        transcriptionText: message.transcriptionText,
        metadata: message.metadata,
        createdAt: message.createdAt.toISOString(),
      });

      if (conversation) {
        const unreadCounts: Record<string, number> = {};
        for (const participant of conversation.participants) {
          unreadCounts[participant.userId] = participant.unreadCount;
        }

        io.to(`conversation:${conversationId}`).emit("unread_counts_updated", {
          conversationId,
          unreadCounts,
        });
      }
    }

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
