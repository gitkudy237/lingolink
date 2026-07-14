import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyJwt } from "../utils/jwt";
import { findConversationParticipant, findConversationByIdWithParticipants } from "../models/conversationModel";
import { markConversationRead, sendMessage as persistMessage } from "./messageService";
import { Prisma } from "@prisma/client";
import { markUserOffline, markUserOnline } from "./presenceService";

interface SocketUser {
  id: string;
  email: string;
  preferredLanguage?: string;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

export function setupSocketIO(io: SocketIOServer) {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const payload = verifyJwt<{ id: string; email: string; preferredLanguage?: string }>(token);
      socket.user = payload;
      next();
    } catch (error: any) {
      next(new Error("Authentication failed: " + error.message));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    if (!socket.user) {
      socket.disconnect();
      return;
    }

    console.log(`User ${socket.user.id} connected`);
    io.emit("presence_updated", {
      userId: socket.user.id,
      ...markUserOnline(socket.user.id),
    });

    socket.on("join_conversation", async (conversationId: string) => {
      try {
        const participant = await findConversationParticipant(conversationId, socket.user!.id);
        if (!participant) {
          socket.emit("error", { message: "Access denied to conversation" });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit("joined_conversation", { conversationId });

        io.to(`conversation:${conversationId}`).emit("user_joined", {
          userId: socket.user!.id,
          email: socket.user!.email,
        });
      } catch (error: any) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      io.to(`conversation:${conversationId}`).emit("user_left", {
        userId: socket.user!.id,
      });
    });

    socket.on("send_message", async (data: any) => {
      try {
        const { conversationId, type, originalText, transcriptionText, metadata } = data;

        const participant = await findConversationParticipant(conversationId, socket.user!.id);
        if (!participant) {
          socket.emit("error", { message: "Access denied to conversation" });
          return;
        }

        const persistedMessage = await persistMessage({
          senderId: socket.user!.id,
          conversationId,
          type,
          originalText,
          transcriptionText,
          metadata: metadata || ({ translationStatus: "pending" } as Prisma.InputJsonValue),
        });

        const conversation = await findConversationByIdWithParticipants(conversationId);

        io.to(`conversation:${conversationId}`).emit("message", {
          id: persistedMessage.id,
          conversationId,
          senderId: socket.user!.id,
          senderEmail: socket.user!.email,
          type,
          originalText: persistedMessage.originalText,
          translatedText: persistedMessage.translatedText,
          transcriptionText: persistedMessage.transcriptionText,
          metadata: persistedMessage.metadata,
          createdAt: persistedMessage.createdAt.toISOString(),
        });

        if (conversation) {
          const unreadCounts: Record<string, number> = {};
          for (const p of conversation.participants) {
            unreadCounts[p.userId] = p.unreadCount;
          }
          io.to(`conversation:${conversationId}`).emit("unread_counts_updated", {
            conversationId,
            unreadCounts,
          });
        }
      } catch (error: any) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("typing", (data: any) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        userId: socket.user!.id,
        email: socket.user!.email,
      });
    });

    socket.on("stop_typing", (data: any) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit("user_stopped_typing", {
        userId: socket.user!.id,
      });
    });

    socket.on("message_read", async (data: any) => {
      try {
        const { conversationId, messageId } = data;

        const participant = await findConversationParticipant(conversationId, socket.user!.id);
        if (!participant) {
          socket.emit("error", { message: "Access denied to conversation" });
          return;
        }

        await markConversationRead(conversationId, socket.user!.id);

        const conversation = await findConversationByIdWithParticipants(conversationId);
        if (conversation) {
          const unreadCounts: Record<string, number> = {};
          for (const p of conversation.participants) {
            unreadCounts[p.userId] = p.unreadCount;
          }
          io.to(`conversation:${conversationId}`).emit("unread_counts_updated", {
            conversationId,
            unreadCounts,
          });
        }

        io.to(`conversation:${conversationId}`).emit("message_read_receipt", {
          conversationId,
          userId: socket.user!.id,
          messageId,
        });
      } catch (error: any) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user?.id} disconnected`);
      if (socket.user) {
        io.emit("presence_updated", {
          userId: socket.user.id,
          ...markUserOffline(socket.user.id),
        });
      }
    });
  });
}
