import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { fetchMessages, sendMessageRest } from "../src/services/conversationService";
import {
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  onMessage,
  offMessage,
} from "../src/services/socket";

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
          setCurrentUser(JSON.parse(storedCurrentUser));
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
          sender: currentUser?.id === message.senderId ? "me" : "them",
        } as Message));

        setMessages(normalized);
        await SecureStore.setItemAsync(storageKey, JSON.stringify(normalized));
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
          sender: currentUser?.id === payload.senderId ? "me" : "them",
        };

        const nextMessages = [...previous, nextMessage];
        SecureStore.setItemAsync(storageKey, JSON.stringify(nextMessages));
        return nextMessages;
      });
    };

    const initSocket = async () => {
      try {
        await connectSocket();
        await joinConversation(conversationIdValue);
        await onMessage(handleIncomingMessage);
      } catch (err) {
        console.log("CHAT SOCKET ERROR", err);
      }
    };

    initSocket();

    return () => {
      offMessage(handleIncomingMessage);
      leaveConversation(conversationIdValue);
      disconnectSocket();
    };
  }, [conversationIdValue, currentUser?.id, storageKey]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={{ marginLeft: theme.spacing.md }}>
          <Text style={styles.chatTitle}>
            {parsedUser?.name || parsedUser?.username || "LingoLink"}
          </Text>
          <Text style={styles.chatSubtitle} numberOfLines={1}>
            {currentUser
              ? `Signed in as ${currentUser.username}`
              : "Your language chat"}
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
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 60}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
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
