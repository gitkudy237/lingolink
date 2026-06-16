import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  createdAt: string;
}

export default function ChatScreen() {
  const { user } = useLocalSearchParams();
  const router = useRouter();

  const parsedUser = user ? JSON.parse(user as string) : null;
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    email: string;
    phone: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const storageKey = parsedUser
    ? `messages-${parsedUser.id}`
    : "messages-unknown";

  useEffect(() => {
    const loadChat = async () => {
      try {
        const storedCurrentUser = await SecureStore.getItemAsync("currentUser");
        if (storedCurrentUser) {
          setCurrentUser(JSON.parse(storedCurrentUser));
        }

        const storedMessages = await SecureStore.getItemAsync(storageKey);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
          return;
        }

        if (parsedUser) {
          const initial = [
            {
              id: "intro-1",
                text: `Hi ${parsedUser.name || parsedUser.username}! Start your language chat with ${parsedUser.name || parsedUser.username}.`,
              sender: "them" as const,
              createdAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ];

          setMessages(initial);
          await SecureStore.setItemAsync(storageKey, JSON.stringify(initial));
        }
      } catch (error) {
        console.log("CHAT LOAD ERROR", error);
      }
    };

    loadChat();
  }, [storageKey, parsedUser]);

  const saveMessages = async (nextMessages: Message[]) => {
    try {
      await SecureStore.setItemAsync(storageKey, JSON.stringify(nextMessages));
    } catch (error) {
      console.log("SAVE MESSAGES ERROR", error);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const nextMessages = [
      ...messages,
      {
        id: Date.now().toString(),
        text: trimmed,
        sender: "me" as const,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];

    setMessages(nextMessages);
    setInput("");
    await saveMessages(nextMessages);
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
              {item.text}
            </Text>
            <Text
              style={[
                styles.messageTime,
                item.sender === "me" && { color: "rgba(255,255,255,0.8)" },
              ]}
            >
              {item.createdAt}
            </Text>
          </View>
        )}
      />

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
