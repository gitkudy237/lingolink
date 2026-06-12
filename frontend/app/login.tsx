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
  TouchableOpacity,
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
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateEmail = (text: string) => {
    if (!text.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "Invalid email";
    return "";
  };

  const validatePassword = (text: string) => {
    if (!text.trim()) return "Password is required";
    if (text.includes(".")) return "Dots (.) not allowed";
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(text)) {
      return "Must contain uppercase, lowercase, number & special character";
    }
    return "";
  };

  const handleLogin = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    try {
      const payload: AuthLoginRequest = { email, password };
      const { user, token } = await login(payload);

      await SecureStore.setItemAsync("currentUser", JSON.stringify(user));
      await SecureStore.setItemAsync("authToken", token);

      router.replace("/chatList");
    } catch (error: any) {
      console.log("LOGIN ERROR:", error);
      setErrors((prev) => ({
        ...prev,
        password: error?.response?.data?.error || "Invalid credentials",
      }));
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
              setErrors((prev) => ({ ...prev, email: validateEmail(text) }));
            }}
            error={errors.email}
            keyboardType="email-address"
          />

          <Input
            icon="lock-closed-outline"
            placeholder="Enter Your Password"
            value={password}
            onChange={(text: string) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: validatePassword(text) }));
            }}
            error={errors.password}
            secure={!isPasswordVisible}
          />

          <Button title="Log in" onPress={handleLogin} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}> 
            <Text style={styles.link}>Sign up</Text>
          </TouchableOpacity>
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
    flexDirection: "row",
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
});