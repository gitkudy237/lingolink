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
              text: `Hi ${parsedUser.name}! Start your language chat with ${parsedUser.name}.`,
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
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.chatTitle}>
            {parsedUser?.name || "LingoLink"}
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
    backgroundColor: "#F4F6F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  backButton: {
    fontSize: 24,
    marginRight: 16,
    color: "#0A8F5A",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  chatSubtitle: {
    color: "#666",
    marginTop: 2,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#0A8F5A",
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: {
    color: "#111",
    fontSize: 14,
  },
  messageTime: {
    marginTop: 6,
    fontSize: 10,
    color: "#777",
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F4F7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    color: "#111",
  },
  sendButton: {
    backgroundColor: "#0A8F5A",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  sendText: {
    color: "#fff",
    fontWeight: "700",
  },
});
