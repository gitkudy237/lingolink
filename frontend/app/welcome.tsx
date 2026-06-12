import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "./components/Button";
import theme from "../src/theme";

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🌐</Text>
        </View>
        <Text style={styles.appName}>LingoLink</Text>
      </View>

      {/* Image Card */}
      <View style={styles.card}>
        <Image
          source={require("./assets/auth.png")} 
          style={styles.authImage}
          resizeMode="contain"
        />
      </View>

      {/* Text */}
      <Text style={styles.title}>Connect Across Languages.</Text>
      <Text style={styles.subtitle}>
        Real-time, invisible translation for seamless global conversations.
      </Text>

      {/* Buttons */}
      <View style={{ width: "100%" }}>
        <Button title="Get Started →" onPress={() => router.push("/signup")} />
      </View>

      <View style={{ width: "100%", marginTop: 10 }}>
        <Button
          title="Log In"
          variant="secondary"
          onPress={() => router.push("/login")}
          style={{ borderWidth: 1, borderColor: theme.colors.primary }}
        />
      </View>

      {/* Terms */}
      <Text style={styles.terms}>
        By continuing, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text>
      </Text>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4F3",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 20,
  },

  logoCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    fontSize: 24,
    color: "#fff",
  },

  appName: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F766E",
  },

  card: {
    width: "85%",
    height: 250,
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },

  authImage: {
    width: "100%",
    height: "100%",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 25,
  },

  primaryBtn: {
    backgroundColor: "#0F766E",
    width: "100%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "bold",
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#0F766E",
    width: "100%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryText: {
    color: "#0F766E",
    fontWeight: "bold",
  },

  terms: {
    marginTop: 15,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },

  link: {
    color: "#0F766E",
    fontWeight: "bold",
  },
});