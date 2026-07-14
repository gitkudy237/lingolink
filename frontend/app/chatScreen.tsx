import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import theme from "../src/theme";
import {
  fetchConversationDetails,
  fetchMessages,
  markConversationRead,
  sendMessageRest,
} from "../src/services/conversationService";
import {
  connectSocket,
  joinConversation,
  leaveConversation,
  emitStopTyping,
  emitTyping,
  onMessage,
  offMessage,
  onPresenceUpdate,
  offPresenceUpdate,
  onStopTyping,
  offStopTyping,
  onTyping,
  offTyping,
} from "../src/services/socket";
import { fetchUserPresence } from "../src/services/userService";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderEmail?: string;
  type: string;
  originalText?: string | null;
  createdAt: string;
  sender: "me" | "them";
}

export default function ChatScreen() {
  const { conversationId, user } = useLocalSearchParams();
  const router = useRouter();

  const parsedUser = user ? JSON.parse(user as string) : null;
  const conversationIdValue = conversationId as string | undefined;

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    email: string;
    phone: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState(parsedUser?.name || parsedUser?.username || "LingoLink");
  const [presenceStatus, setPresenceStatus] = useState("Loading status...");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const currentUserIdRef = useRef<string | null>(null);
  const otherUserIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = useMemo(
    () => (conversationIdValue ? `messages-${conversationIdValue}` : "messages-unknown"),
    [conversationIdValue]
  );

  useEffect(() => {
    let mounted = true;

    const loadChat = async () => {
      if (!conversationIdValue) return;

      try {
        setLoading(true);
        const storedCurrentUser = await SecureStore.getItemAsync("currentUser");
        if (storedCurrentUser) {
          const parsedCurrentUser = JSON.parse(storedCurrentUser);
          setCurrentUser(parsedCurrentUser);
          currentUserIdRef.current = parsedCurrentUser.id;
        }

        const conversation = await fetchConversationDetails(conversationIdValue);
        const currentUserId = currentUserIdRef.current;
        const directParticipant = conversation?.participants?.find(
          (participant: any) => participant.user?.id !== currentUserId
        );
        const participantName = directParticipant?.user?.username;

        if (conversation?.type === "group") {
          setChatTitle(conversation.title || "Group Chat");
          setPresenceStatus(`${conversation.participants?.length || 0} members`);
        } else if (directParticipant?.user) {
          setOtherUserId(directParticipant.user.id);
          otherUserIdRef.current = directParticipant.user.id;
          setChatTitle(participantName || parsedUser?.name || parsedUser?.username || "LingoLink");

          try {
            const presence = await fetchUserPresence(directParticipant.user.id);
            setPresenceStatus(
              presence.online
                ? "Online"
                : presence.lastSeenAt
                  ? `Last seen at ${new Date(presence.lastSeenAt).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                    })}`
                  : "Offline"
            );
          } catch (presenceError) {
            console.log("PRESENCE LOAD ERROR", presenceError);
            setPresenceStatus("Offline");
          }
        }

        const storedMessages = await SecureStore.getItemAsync(storageKey);
        if (storedMessages && mounted) {
          setMessages(JSON.parse(storedMessages));
        }

        const fetchedMessages = await fetchMessages(conversationIdValue);
        if (!mounted) return;

        const normalized = fetchedMessages.map((message: any) => ({
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderEmail: message.senderEmail,
          type: message.type,
          originalText: message.originalText,
          createdAt: message.createdAt,
          sender: currentUserIdRef.current === message.senderId ? "me" : "them",
        } as Message));

        setMessages(normalized);
        await SecureStore.setItemAsync(storageKey, JSON.stringify(normalized));
        await markConversationRead(conversationIdValue);
      } catch (err: any) {
        console.log("CHAT LOAD ERROR", err);
        if (mounted) setError(err.message || "Unable to load messages.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadChat();

    return () => {
      mounted = false;
    };
  }, [conversationIdValue, storageKey, currentUser?.id]);

  useEffect(() => {
    if (!conversationIdValue) return;

    const handleIncomingMessage = (payload: any) => {
      if (payload.conversationId !== conversationIdValue) return;
      setMessages((previous) => {
        if (previous.some((message) => message.id === payload.id)) {
          return previous;
        }

        const nextMessage: Message = {
          id: payload.id,
          conversationId: payload.conversationId,
          senderId: payload.senderId,
          senderEmail: payload.senderEmail,
          type: payload.type,
          originalText: payload.originalText,
          createdAt: payload.createdAt,
          sender: currentUserIdRef.current === payload.senderId ? "me" : "them",
        };

        const nextMessages = [...previous, nextMessage];
        SecureStore.setItemAsync(storageKey, JSON.stringify(nextMessages));
        return nextMessages;
      });

      if (currentUser?.id !== payload.senderId) {
        markConversationRead(conversationIdValue).catch((err) => {
          console.log("MARK READ ERROR", err);
        });
      }
    };

    const handlePresenceUpdate = (payload: any) => {
      if (!otherUserIdRef.current || payload.userId !== otherUserIdRef.current) return;

      setPresenceStatus(
        payload.online
          ? "Online"
          : payload.lastSeenAt
            ? `Last seen at ${new Date(payload.lastSeenAt).toLocaleString([], {
                hour: "2-digit",
                minute: "2-digit",
                month: "short",
                day: "numeric",
              })}`
            : "Offline"
      );
    };

    const handleUserTyping = (payload: any) => {
      if (payload.userId === currentUserIdRef.current) return;

      setTypingUsers((previous) => {
        if (previous.includes(payload.userId)) {
          return previous;
        }

        return [...previous, payload.userId];
      });
    };

    const handleUserStoppedTyping = (payload: any) => {
      if (payload.userId === currentUserIdRef.current) return;

      setTypingUsers((previous) => previous.filter((userId) => userId !== payload.userId));
    };

    const initSocket = async () => {
      try {
        await connectSocket();
        await joinConversation(conversationIdValue);
        await onMessage(handleIncomingMessage);
        await onPresenceUpdate(handlePresenceUpdate);
        await onTyping(handleUserTyping);
        await onStopTyping(handleUserStoppedTyping);
      } catch (err) {
        console.log("CHAT SOCKET ERROR", err);
      }
    };

    initSocket();

    return () => {
      offMessage(handleIncomingMessage);
      offPresenceUpdate(handlePresenceUpdate);
      offTyping(handleUserTyping);
      offStopTyping(handleUserStoppedTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitStopTyping(conversationIdValue).catch(() => undefined);
      leaveConversation(conversationIdValue);
    };
  }, [conversationIdValue, storageKey]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const saveMessages = async (nextMessages: Message[]) => {
    try {
      await SecureStore.setItemAsync(storageKey, JSON.stringify(nextMessages));
    } catch (error) {
      console.log("SAVE MESSAGES ERROR", error);
    }
  };

  const handleSend = async () => {
    if (!conversationIdValue) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    const nextMessages = [...messages];
    setInput("");
    emitStopTyping(conversationIdValue).catch(() => undefined);

    try {
      const saved = await sendMessageRest(conversationIdValue, {
        type: "text",
        originalText: trimmed,
      });

      const nextMessage: Message = {
        id: saved.id,
        conversationId: conversationIdValue,
        senderId: saved.senderId,
        senderEmail: saved.senderEmail,
        type: saved.type,
        originalText: saved.originalText,
        createdAt: saved.createdAt,
        sender: currentUser?.id === saved.senderId ? "me" : "them",
      };

      const updatedMessages = [...nextMessages, nextMessage];
      setMessages(updatedMessages);
      await saveMessages(updatedMessages);
    } catch (err: any) {
      console.log("SEND MESSAGE ERROR", err);
      setError(err.message || "Unable to send message.");
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);

    if (!conversationIdValue) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!text.trim()) {
      emitStopTyping(conversationIdValue).catch(() => undefined);
      return;
    }

    emitTyping(conversationIdValue).catch(() => undefined);

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(conversationIdValue).catch(() => undefined);
    }, 1500);
  };

  const typingLabel = typingUsers.length > 0 ? "Typing..." : "";
  const headerStatus = typingUsers.length > 0 ? "Typing..." : presenceStatus;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 60}
      >
        <View style={styles.screenBody}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <View style={{ marginLeft: theme.spacing.md }}>
              <Text style={styles.chatTitle}>{chatTitle}</Text>
              <Text style={styles.chatSubtitle} numberOfLines={1}>
                {headerStatus}
              </Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : (
            <FlatList
              style={styles.messageListWrapper}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.sender === "me" ? styles.myBubble : styles.theirBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      item.sender === "me" && { color: "#fff" },
                    ]}
                  >
                    {item.originalText}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      item.sender === "me" && { color: "rgba(255,255,255,0.8)" },
                    ]}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              )}
            />
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={handleInputChange}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  screenBody: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: theme.colors.surface,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  chatSubtitle: {
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  typingText: {
    color: theme.colors.primary,
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  errorBox: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: "#fee2e2",
    borderRadius: theme.radii.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  messageList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  messageListWrapper: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  messageTime: {
    marginTop: theme.spacing.sm,
    fontSize: 10,
    color: theme.colors.muted,
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(15, 118, 110, 0.05)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: theme.spacing.md,
    color: theme.colors.text,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  sendText: {
    color: "#fff",
    fontWeight: "700",
  },
});
