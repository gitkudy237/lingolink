import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Switch,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

const { width } = Dimensions.get("window");
const wp = (p: number) => (width * p) / 100;
const scale = (s: number) => (width / 375) * s;

export default function SettingsScreen() {
  const [autoTranslate, setAutoTranslate] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>🌐 LingoLink</Text>
        <Text style={styles.menu}>⋮</Text>
      </View>

      {/* PROFILE */}
      <View style={styles.profile}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
        <View style={styles.onlineDot} />

        <Text style={styles.name}>Samuel</Text>
        <Text style={styles.status}>
          Premium Member • Polyglot Status
        </Text>
      </View>

      {/* SETTINGS CARDS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 Translation Settings</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Default Output Language</Text>
          <Text style={styles.value}>English ›</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Auto-Translate</Text>
          <Switch
            value={autoTranslate}
            onValueChange={setAutoTranslate}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎤 Audio</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Voice Transcription</Text>
          <Text style={styles.value}>Language ›</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 Notifications</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Mute options</Text>
          <Text style={styles.value}>🔇</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔒 Privacy</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Last Seen</Text>
          <Text style={styles.value}>Everyone</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Blocked Contacts</Text>
          <Text style={styles.value}>12 Contacts</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>❓ Help & Support</Text>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>🚪 Log Out</Text>
      </TouchableOpacity>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <Text style={styles.nav}>💬 Chats</Text>
        <Text style={styles.nav}>👥 Contacts</Text>
        <Text style={styles.nav}>📞 Calls</Text>
        <Text style={styles.activeNav}>⚙️ Settings</Text>
      </View>
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
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: wp(4),
  },

  logo: {
    fontSize: scale(18),
    fontWeight: "700",
    color: "#0A8F5A",
  },

  menu: {
    fontSize: scale(18),
  },

  profile: {
    alignItems: "center",
    marginBottom: wp(4),
  },

  avatar: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
  },

  onlineDot: {
    position: "absolute",
    bottom: wp(5),
    right: wp(38),
    width: wp(4),
    height: wp(4),
    borderRadius: wp(2),
    backgroundColor: "#00C851",
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    fontSize: scale(16),
    fontWeight: "600",
    marginTop: 6,
  },

  status: {
    fontSize: scale(12),
    color: "#777",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    marginBottom: wp(3),
    borderRadius: 12,
    padding: wp(4),
  },

  cardTitle: {
    fontSize: scale(14),
    fontWeight: "600",
    marginBottom: wp(2),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: wp(2),
  },

  label: {
    fontSize: scale(12),
    color: "#555",
  },

  value: {
    fontSize: scale(12),
    color: "#0A8F5A",
  },

  logout: {
    marginHorizontal: wp(4),
    padding: wp(3),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E57373",
    alignItems: "center",
  },

  logoutText: {
    color: "#E53935",
    fontWeight: "600",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: wp(3),
    backgroundColor: "#fff",
  },

  nav: {
    fontSize: scale(11),
    color: "#888",
  },

  activeNav: {
    fontSize: scale(11),
    color: "#0A8F5A",
    fontWeight: "600",
  },
});
