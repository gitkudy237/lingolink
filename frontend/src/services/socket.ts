import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
let socket: Socket | null = null;

const getSocketUrl = () => {
  if (!API_BASE_URL) return "";
  return API_BASE_URL.replace(/\/api\/?$/, "");
};

export async function connectSocket() {
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  const token = await SecureStore.getItemAsync("authToken");
  if (!token) {
    throw new Error("No auth token found");
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect_error", (error) => {
    console.warn("Socket connect error:", error);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}

export async function joinConversation(conversationId: string) {
  const s = await connectSocket();
  s.emit("join_conversation", conversationId);
}

export function leaveConversation(conversationId: string) {
  if (!socket) return;
  socket.emit("leave_conversation", conversationId);
}

export async function sendMessage(payload: any) {
  const s = await connectSocket();
  s.emit("send_message", payload);
}

export async function onMessage(cb: (data: any) => void) {
  const s = await connectSocket();
  s.on("message", cb);
}

export function offMessage(cb: (data: any) => void) {
  if (!socket) return;
  socket.off("message", cb);
}

export async function onPresenceUpdate(cb: (data: any) => void) {
  const s = await connectSocket();
  s.on("presence_updated", cb);
}

export function offPresenceUpdate(cb: (data: any) => void) {
  if (!socket) return;
  socket.off("presence_updated", cb);
}

export default {
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
  onMessage,
  offMessage,
  onPresenceUpdate,
  offPresenceUpdate,
};
