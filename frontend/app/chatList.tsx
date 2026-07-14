import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import theme from "../src/theme";
import { fetchConversations } from "../src/services/conversationService";
import DefaultAvatar from "./components/DefaultAvatar";

interface Chat {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar?: string;
  unread: number;
  online?: boolean;
  fullName?: string;
  conversationType: "direct" | "group";
}

export default function ChatList() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    email: string;
    phone: string;
  } | null>(null);
  const [chatItems, setChatItems] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getCurrentUserParticipant = (conversation: any, currentUserId: string) => {
    return conversation.participants.find((participant: any) => participant.userId === currentUserId);
  };

  const getConversationName = (conversation: any, currentUserId: string) => {
    if (conversation.type === "group") {
      return conversation.title || "Group Chat";
    }

    const otherUser = conversation.participants.find(
      (p: any) => p.user?.id !== currentUserId
    );
    return otherUser?.user?.username || "Unknown User";
  };

  const getConversationAvatar = (conversation: any, currentUserId: string) => {
    if (conversation.type === "group") {
      return null; // Will use DefaultAvatar
    }

    const otherUser = conversation.participants.find(
      (p: any) => p.user?.id !== currentUserId
    );
    return otherUser?.user?.profileImageUrl || null;
  };

  const getLastMessagePreview = (conversation: any) => {
    const lastMessage = conversation.messages?.[0];

    if (!lastMessage) {
      return "No messages yet";
    }

    const text = lastMessage.translatedText || lastMessage.originalText;
    if (text && text.trim()) {
      return text;
    }

    switch (lastMessage.type) {
      case "image":
        return "Image";
      case "document":
        return "Document";
      case "audio":
        return "Audio";
      case "voice_note":
        return "Voice note";
      default:
        return "New message";
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const storedCurrentUser = await SecureStore.getItemAsync("currentUser");
        if (storedCurrentUser) {
          setCurrentUser(JSON.parse(storedCurrentUser));
        }

        const currentUserData = storedCurrentUser
          ? JSON.parse(storedCurrentUser)
          : null;

        if (!currentUserData) {
          console.log("No current user found");
          setChatItems([]);
          return;
        }

        const conversations = await fetchConversations();

        const chats = conversations.map((conversation: any) => {
          const userName = getConversationName(conversation, currentUserData.id);
          const currentParticipant = getCurrentUserParticipant(
            conversation,
            currentUserData.id
          );
          const lastMessage = conversation.messages?.[0];

          return {
            id: conversation.id,
            name: userName,
            message: getLastMessagePreview(conversation),
            time: lastMessage ? formatTime(lastMessage.createdAt) : "",
            avatar: getConversationAvatar(conversation, currentUserData.id),
            fullName: userName,
            unread: currentParticipant?.unreadCount ?? 0,
            conversationType: conversation.type,
          };
        });

        setChatItems(chats);
      } catch (error) {
        console.log("CHAT LIST LOAD ERROR", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredChats = chatItems.filter((chat) => {
    if (activeTab === "Unread" && chat.unread === 0) return false;
    if (activeTab === "Groups" && chat.conversationType !== "group") return false;
    if (activeTab === "Personal" && chat.conversationType !== "direct") return false;

    return chat.name.toLowerCase().includes(search.toLowerCase());
  });

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/chatScreen",
          params: {
            conversationId: item.id,
            user: JSON.stringify({
              id: item.id,
              name: item.name,
              username: item.name,
            }),
          },
        } as any)
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <DefaultAvatar name={item.fullName || item.name} size={50} />
          )}
          {item.online && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.message}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="globe-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.logo}>LingoLink</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {currentUser ? (
          <Text style={styles.welcomeText} numberOfLines={1}>
            Welcome, {currentUser.username}
          </Text>
        ) : null}

        {/* SEARCH */}
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search chats..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {["All", "Unread", "Groups", "Personal"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredChats.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.muted} />
          <Text style={{ marginTop: 16, fontSize: 16, color: theme.colors.muted }}>
            No conversations yet
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.muted, marginTop: 8 }}>
            Start a new chat to begin messaging
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push("/newChat")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push("/chatList")}>
          <Ionicons name="chatbubble" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/contacts")}>
          <Ionicons name="people-outline" size={24} color={theme.colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/calls" as any)}>
          <Ionicons name="call-outline" size={24} color={theme.colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/settings" as any)}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.muted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ✅ STYLES (THEMED)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.md, marginTop: 50 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: { fontSize: 20, fontWeight: "700", color: theme.colors.primary },
  headerIcons: { flexDirection: "row", gap: theme.spacing.md },
  welcomeText: { color: theme.colors.muted, marginTop: theme.spacing.sm },

  searchWrapper: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
  },

  searchInput: {
    height: 40,
    color: theme.colors.text,
  },

  tabs: { flexDirection: "row", paddingHorizontal: theme.spacing.md },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
    marginRight: theme.spacing.sm,
  },

  activeTab: { backgroundColor: theme.colors.primary },

  tabText: { color: theme.colors.primary },
  activeTabText: { color: "#fff" },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },

  avatar: { width: 50, height: 50, borderRadius: 25 },

  onlineDot: {
    width: 10,
    height: 10,
    backgroundColor: "#10b981",
    borderRadius: 5,
    position: "absolute",
    bottom: 2,
    right: 2,
  },

  info: { marginLeft: theme.spacing.md },

  name: { fontWeight: "600", color: theme.colors.text },
  message: { color: theme.colors.muted },

  time: { fontSize: 11, color: "#999" },

  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 6,
    marginTop: 4,
  },

  unreadText: {
    color: "#fff",
    fontSize: 10,
  },

  fab: {
    position: "absolute",
    bottom: 70,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
});