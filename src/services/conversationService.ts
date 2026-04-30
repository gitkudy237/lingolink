import {
  addConversationParticipants,
  createConversation,
  findConversationById,
  findConversationByIdWithParticipants,
  listConversationsForUser,
  findConversationParticipant,
  findDirectConversationBetween,
  updateConversation,
} from "../models/conversationModel";
import { findUserById } from "../models/userModel";

export async function listConversations(userId: string) {
  return await listConversationsForUser(userId);
}

export async function getConversationDetails(conversationId: string, userId: string) {
  const participant = await findConversationParticipant(conversationId, userId);
  if (!participant) {
    throw new Error("Access denied");
  }

  const conversation = await findConversationByIdWithParticipants(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
}

export async function createDirectConversation(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    throw new Error("Cannot create a direct conversation with yourself");
  }

  const otherUser = await findUserById(otherUserId);
  if (!otherUser) {
    throw new Error("Other user not found");
  }

  const existing = await findDirectConversationBetween(userId, otherUserId);
  if (existing) {
    return existing;
  }

  const conversation = await createConversation({
    type: "direct",
    participantIds: [userId, otherUserId],
  });

  return conversation;
}

export async function createGroupConversation(userId: string, title: string, participantIds: string[]) {
  if (!title || title.trim().length === 0) {
    throw new Error("Group conversation title is required");
  }

  const uniqueParticipantIds = Array.from(new Set([userId, ...participantIds]));
  const users = await Promise.all(uniqueParticipantIds.map(findUserById));
  if (users.some((item) => item === null)) {
    throw new Error("One or more participants were not found");
  }

  const conversation = await createConversation({
    type: "group",
    title,
    participantIds: uniqueParticipantIds,
  });

  return conversation;
}

export async function updateConversationDetails(
  userId: string,
  conversationId: string,
  data: { title?: string; avatarUrl?: string; participantIds?: string[] },
) {
  const participant = await findConversationParticipant(conversationId, userId);
  if (!participant) {
    throw new Error("Access denied");
  }

  if (data.participantIds && data.participantIds.length > 0) {
    const conversation = await findConversationById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.type !== "group") {
      throw new Error("Cannot add participants to a direct conversation");
    }

    await addConversationParticipants(conversationId, data.participantIds);
  }

  const updated = await updateConversation(conversationId, {
    title: data.title,
    avatarUrl: data.avatarUrl,
  });

  return updated;
}
