import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { login } from "../src/services/authService";
import type { AuthLoginRequest } from "@lingolink/shared";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "./components/Input";
import Button from "./components/Button";
import theme from "../src/theme";

const LoginScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    setErrorMessage("");

    try {
      const payload: AuthLoginRequest = { email, password };
      const { user, token } = await login(payload);

      await SecureStore.setItemAsync("currentUser", JSON.stringify(user));
      await SecureStore.setItemAsync("authToken", token);

      router.replace("/chatList");
    } catch (error: any) {
      console.log("LOGIN ERROR:", error);
      setErrorMessage("Invalide email or password");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}> 
            <Ionicons name="globe-outline" size={26} color="#fff" />
          </View>
          <Text style={styles.title}>LingoLink</Text>
          <Text style={styles.subtitle}>
            Connect through the beauty of every tongue.
          </Text>
        </View>

        <View style={styles.card}>
          <Input
            icon="mail-outline"
            placeholder="Enter Your Email"
            value={email}
            onChange={(text: string) => {
              setEmail(text);
              setErrorMessage("");
            }}
            keyboardType="email-address"
          />

          <Input
            icon="lock-closed-outline"
            placeholder="Enter Your Password"
            value={password}
            onChange={(text: string) => {
              setPassword(text);
              setErrorMessage("");
            }}
            secure={!isPasswordVisible}
            rightIcon={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setIsPasswordVisible((visible) => !visible)}
          />

          <Button title="Log in" onPress={handleLogin} />

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText} onPress={() => router.push("/signup")}> 
            Don&apos;t have an account? <Text style={styles.link}>Sign up</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF3F3" },
  inner: { flex: 1, justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  logo: {
    backgroundColor: "#0A6D6D",
    padding: 14,
    borderRadius: 30,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A6D6D",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#F2F2F2",
    borderRadius: 15,
    padding: 20,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    color: "#000",
    fontSize: 15,
    height: "100%",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  button: {
    backgroundColor: "#0A6D6D",
    marginTop: 25,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    justifyContent: "center",
    marginTop: 30,
    padding: 20,
  },
  footerText: { color: "#777" },
  link: {
    color: "#0A6D6D",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  errorMessage: {
    marginTop: 12,
    color: theme.colors.danger,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
});