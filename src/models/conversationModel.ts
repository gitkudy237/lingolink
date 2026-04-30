import prisma from "../lib/prisma";

export async function listConversationsForUser(userId: string) {
  return await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              preferredLanguage: true,
              profileImageUrl: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          type: true,
          originalText: true,
          translatedText: true,
          createdAt: true,
          senderId: true,
        },
      },
    },
  });
}

export async function findConversationById(conversationId: string) {
  return await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
}

export async function findConversationByIdWithParticipants(conversationId: string) {
  return await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              preferredLanguage: true,
              profileImageUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function findDirectConversationBetween(userAId: string, userBId: string) {
  return await prisma.conversation.findFirst({
    where: {
      type: "direct",
      AND: [
        { participants: { some: { userId: userAId } } },
        { participants: { some: { userId: userBId } } },
      ],
    },
    include: {
      participants: true,
    },
  });
}

export async function createConversation(data: {
  type: "direct" | "group";
  title?: string | null;
  avatarUrl?: string | null;
  participantIds: string[];
}) {
  const uniqueParticipantIds = Array.from(new Set(data.participantIds));

  const conversation = await prisma.conversation.create({
    data: {
      type: data.type,
      title: data.title,
      avatarUrl: data.avatarUrl,
    },
  });

  await prisma.conversationParticipant.createMany({
    data: uniqueParticipantIds.map((userId) => ({
      conversationId: conversation.id,
      userId,
    })),
    skipDuplicates: true,
  });

  return conversation;
}

export async function addConversationParticipants(conversationId: string, participantIds: string[]) {
  const uniqueIds = Array.from(new Set(participantIds));
  return await prisma.conversationParticipant.createMany({
    data: uniqueIds.map((userId) => ({
      conversationId,
      userId,
    })),
    skipDuplicates: true,
  });
}

export async function updateConversation(conversationId: string, data: { title?: string; avatarUrl?: string; lastMessageId?: string }) {
  return await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      title: data.title,
      avatarUrl: data.avatarUrl,
      lastMessageId: data.lastMessageId,
    },
  });
}

export async function findConversationParticipant(conversationId: string, userId: string) {
  return await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
}
