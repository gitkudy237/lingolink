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
import { createDirectConversation, fetchUsers } from "../src/services/conversationService";
import DefaultAvatar from "./components/DefaultAvatar";

type User = {
  id: string;
  username: string;
  email: string;
  phone: string;
  preferredLanguage?: string;
  profileImageUrl?: string;
};

export default function NewChat() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null);
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
        setUsers(filtered);
      } catch (err: any) {
        console.log("NEW CHAT LOAD ERROR", err);
        setError(err.message || "Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
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

  const handleSelectUser = async (user: User) => {
    setCreatingConversation(user.id);
    setError(null);

    try {
      await createDirectConversation(user.id);
      router.push({
        pathname: "/chatScreen",
        params: { user: JSON.stringify({
          id: user.id,
          name: user.username,
          username: user.username,
        }) },
      } as any);
    } catch (err: any) {
      console.log("NEW CHAT CREATE ERROR", err);
      setError(err.message || "Unable to open conversation.");
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
              disabled={creatingConversation === item.id}
            >
              <View style={styles.userInfo}>
                {item.profileImageUrl ? (
                  <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
                ) : (
                  <DefaultAvatar name={item.username} size={48} />
                )}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error || "#D32F2F",
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
