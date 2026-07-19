import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import {
  createDirectConversation,
  createGroupConversation,
  fetchUsers,
} from "../src/services/conversationService";
import { fetchUserPresence } from "../src/services/userService";
import { onPresenceUpdate, offPresenceUpdate } from "../src/services/socket";
import DefaultAvatar from "./components/DefaultAvatar";

type User = {
  id: string;
  username: string;
  email: string;
  phone: string;
  preferredLanguage?: string;
  profileImageUrl?: string;
  online?: boolean;
};

type ChatMode = "direct" | "group";

export default function NewChat() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>("direct");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const storedCurrentUser = await SecureStore.getItemAsync("currentUser");
        const fetchedUsers = await fetchUsers();
        const filtered = storedCurrentUser
          ? fetchedUsers.filter((user: User) => user.id !== JSON.parse(storedCurrentUser).id)
          : fetchedUsers;

        const usersWithPresence = await Promise.all(
          filtered.map(async (user: User) => {
            try {
              const presence = await fetchUserPresence(user.id);
              return { ...user, online: presence.online };
            } catch (presenceError) {
              console.log("NEW CHAT PRESENCE ERROR", presenceError);
              return { ...user, online: false };
            }
          })
        );

        setUsers(usersWithPresence);
      } catch (err: any) {
        console.log("NEW CHAT LOAD ERROR", err);
        setError(err.message || "Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    const handlePresenceUpdate = (payload: { userId: string; online: boolean }) => {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === payload.userId ? { ...user, online: payload.online } : user
        )
      );
    };

    onPresenceUpdate(handlePresenceUpdate).catch((error) => {
      console.log("NEW CHAT PRESENCE LISTENER ERROR", error);
    });

    return () => {
      offPresenceUpdate(handlePresenceUpdate);
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term)
    );
  });

  const selectedUsers = users.filter((user) => selectedUserIds.includes(user.id));
  const groupTitle = selectedUsers.map((user) => user.username).join(", ");
  const canCreateGroup = selectedUsers.length >= 2;

  const handleSelectUser = async (user: User) => {
    if (chatMode === "group") {
      setSelectedUserIds((previous) =>
        previous.includes(user.id)
          ? previous.filter((userId) => userId !== user.id)
          : [...previous, user.id]
      );
      return;
    }

    setCreatingConversation(user.id);
    setError(null);

    try {
      const conversation = await createDirectConversation(user.id);
      router.push({
        pathname: "/chatScreen",
        params: {
          conversationId: conversation.id,
          user: JSON.stringify({
            id: user.id,
            name: user.username,
            username: user.username,
          }),
        },
      } as any);
    } catch (err: any) {
      console.log("NEW CHAT CREATE ERROR", err);
      setError(err.message || "Unable to open conversation.");
    } finally {
      setCreatingConversation(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!canCreateGroup) return;

    setCreatingConversation("group");
    setError(null);

    try {
      const conversation = await createGroupConversation(groupTitle, selectedUserIds);
      router.push({
        pathname: "/chatScreen",
        params: {
          conversationId: conversation.id,
          user: JSON.stringify({
            id: conversation.id,
            name: conversation.title || "Group Chat",
            username: conversation.title || "Group Chat",
          }),
        },
      } as any);
    } catch (err: any) {
      console.log("NEW GROUP CREATE ERROR", err);
      setError(err.message || "Unable to create group conversation.");
    } finally {
      setCreatingConversation(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Chat</Text>
      </View>

      <View style={styles.modeSwitcher}>
        {(["direct", "group"] as ChatMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.modeChip, chatMode === mode && styles.modeChipActive]}
            onPress={() => {
              setChatMode(mode);
              setError(null);
              setSelectedUserIds([]);
            }}
          >
            <Text style={[styles.modeChipText, chatMode === mode && styles.modeChipTextActive]}>
              {mode === "direct" ? "Direct" : "Group"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {chatMode === "group" ? (
        <View style={styles.groupSummary}>
          <Text style={styles.groupSummaryTitle}>
            {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : "Pick at least 2 people"}
          </Text>
          <Text style={styles.groupSummaryText} numberOfLines={1}>
            {groupTitle || "Selected members will form the group title"}
          </Text>
          <TouchableOpacity
            style={[styles.groupButton, !canCreateGroup && styles.groupButtonDisabled]}
            onPress={handleCreateGroup}
            disabled={!canCreateGroup || creatingConversation === "group"}
          >
            {creatingConversation === "group" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.groupButtonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={theme.colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          placeholderTextColor={theme.colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={64} color={theme.colors.muted} />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptyText}>There are no other registered users yet.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSelectUser(item)}
              disabled={creatingConversation === item.id || creatingConversation === "group"}
            >
              <View style={styles.userInfo}>
                <View style={styles.avatarStack}>
                  {item.profileImageUrl ? (
                    <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
                  ) : (
                    <DefaultAvatar name={item.username} size={48} />
                  )}
                  {item.online ? <View style={styles.onlineDot} /> : null}
                  {chatMode === "group" && selectedUserIds.includes(item.id) ? (
                    <View style={styles.selectedDot}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  ) : null}
                </View>
                <View style={styles.meta}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.subtitle}>{item.email}</Text>
                </View>
              </View>
              {creatingConversation === item.id ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
              )}
            </TouchableOpacity>
          )}
        />
      )}
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
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  title: {
    marginLeft: theme.spacing.sm,
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  modeSwitcher: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  modeChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    backgroundColor: "rgba(15, 118, 110, 0.08)",
  },
  modeChipActive: {
    backgroundColor: theme.colors.primary,
  },
  modeChipText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  modeChipTextActive: {
    color: "#fff",
  },
  groupSummary: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
  },
  groupSummaryTitle: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  groupSummaryText: {
    color: theme.colors.muted,
    marginTop: 4,
  },
  groupButton: {
    marginTop: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  groupButtonDisabled: {
    opacity: 0.5,
  },
  groupButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarStack: {
    position: "relative",
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    marginLeft: theme.spacing.md,
    maxWidth: "75%",
  },
  username: {
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: 4,
    fontSize: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    position: "absolute",
    right: -1,
    bottom: -1,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  selectedDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    position: "absolute",
    right: -2,
    top: -2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger || "#D32F2F",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.muted,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    maxWidth: 280,
  },
});
