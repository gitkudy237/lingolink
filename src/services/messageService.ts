import { Prisma } from "@prisma/client";
import {
  createMessage as createMessageModel,
  incrementUnreadCounts,
  listMessagesByConversation,
  resetUnreadCount,
} from "../models/messageModel";
import {
  findConversationById,
  findConversationParticipant,
  updateConversation,
} from "../models/conversationModel";

export async function sendMessage(options: {
  senderId: string;
  conversationId: string;
  type: string;
  originalText?: string;
  transcriptionText?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const participant = await findConversationParticipant(options.conversationId, options.senderId);
  if (!participant) {
    throw new Error("Access denied");
  }

  const conversation = await findConversationById(options.conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (options.type === "text" && !options.originalText) {
    throw new Error("Text messages require originalText");
  }

  const message = await createMessageModel({
    conversationId: options.conversationId,
    senderId: options.senderId,
    type: options.type,
    originalText: options.originalText ?? null,
    translatedText: options.originalText ?? null,
    transcriptionText: options.transcriptionText ?? null,
    metadata: options.metadata ?? ({ translationStatus: "pending" } as Prisma.InputJsonValue),
  });

  await incrementUnreadCounts(options.conversationId, options.senderId);
  await updateConversation(options.conversationId, { lastMessageId: message.id });

  return message;
}

export async function fetchMessages(conversationId: string, userId: string, limit = 50) {
  const participant = await findConversationParticipant(conversationId, userId);
  if (!participant) {
    throw new Error("Access denied");
  }

  return await listMessagesByConversation(conversationId, limit);
}

export async function markConversationRead(conversationId: string, userId: string) {
  const participant = await findConversationParticipant(conversationId, userId);
  if (!participant) {
    throw new Error("Access denied");
  }

  return await resetUnreadCount(conversationId, userId);
}
