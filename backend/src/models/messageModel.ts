import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  type: string;
  originalText?: string | null;
  translatedText?: string | null;
  transcriptionText?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return await prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      type: data.type as any,
      originalText: data.originalText,
      translatedText: data.translatedText,
      transcriptionText: data.transcriptionText,
      metadata: data.metadata,
    },
  });
}

export async function listMessagesByConversation(conversationId: string, limit = 50) {
  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function incrementUnreadCounts(conversationId: string, senderId: string) {
  return await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: { not: senderId },
    },
    data: {
      unreadCount: {
        increment: 1,
      },
    },
  });
}

export async function resetUnreadCount(conversationId: string, userId: string) {
  return await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    data: {
      unreadCount: 0,
    },
  });
}
