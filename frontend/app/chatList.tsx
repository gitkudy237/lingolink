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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import theme from "../src/theme";

interface Chat {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  unread?: number;
  online?: boolean;
}

const chats: Chat[] = [
  {
    id: "1",
    name: "Amadou",
    message: "See you soon!",
    time: "10:42 AM",
    avatar: "https://i.pravatar.cc/150?img=1",
    unread: 4,
    online: true,
  },
  {
    id: "2",
    name: "Elena",
    message: "✔✔ Hola, ¿cómo estás?",
    time: "09:15 AM",
    avatar: "https://i.pravatar.cc/150?img=2",
    unread: 2,
  },
  {
    id: "3",
    name: "John",
    message: "🎤 Voice Note (0:15)",
    time: "Yesterday",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "4",
    name: "Group Chat: Project Team",
    message:
      "Sarah: The translation API documentation has been updated...",
    time: "Tuesday",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: "5",
    name: "Jean-Paul",
    message: "🖼️ Photo",
    time: "11:20 PM",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

export default function ChatList() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    email: string;
    phone: string;
  } | null>(null);
  const [chatItems, setChatItems] = useState<Chat[]>(chats);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCurrentUser = await SecureStore.getItemAsync("currentUser");
        if (storedCurrentUser) {
          setCurrentUser(JSON.parse(storedCurrentUser));
        }

        const updatedChats = await Promise.all(
          chats.map(async (chat) => {
            const stored = await SecureStore.getItemAsync(`messages-${chat.id}`);
            if (!stored) return chat;

            const messages = JSON.parse(stored) as { text: string; createdAt: string }[];
            if (!messages.length) return chat;

            const lastMessage = messages[messages.length - 1];
            return {
              ...chat,
              message: lastMessage.text,
              time: lastMessage.createdAt,
            };
          })
        );

        setChatItems(updatedChats);
      } catch (error) {
        console.log("CHAT LIST LOAD ERROR", error);
      }
    };

    loadData();
  }, []);

  const filteredChats = chatItems.filter((chat) => {
    if (activeTab === "Unread" && !chat.unread) return false;
    if (activeTab === "Groups" && !chat.name.includes("Group")) return false;
    if (activeTab === "Personal" && chat.name.includes("Group")) return false;

    return chat.name.toLowerCase().includes(search.toLowerCase());
  });

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/chatScreen",
          params: { user: JSON.stringify(item) },
        } as any) // ✅ FIXED
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
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
        {item.unread && (
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
      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push("/newChat")}
      >
        <Text style={{ color: "#fff", fontSize: 24 }}>＋</Text>
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