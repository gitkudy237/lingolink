import { useRouter } from "expo-router";
import { Eye, EyeOff, Globe, Lock, Phone } from "lucide-react-native";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🌍 COUNTRIES
const countries = [
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "USA", code: "+1", flag: "🇺🇸" },
  { name: "UK", code: "+44", flag: "🇬🇧" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "India", code: "+91", flag: "🇮🇳" },
];

const LoginScreen = () => {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ phone: "", password: "" });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountries, setShowCountries] = useState(false);

  // ================= VALIDATION =================
  const validatePhone = (text: string) => {
    if (!text.trim()) return "Phone is required";
    if (text.includes(".")) return "Dots (.) not allowed";
    if (!/^[0-9]{6,15}$/.test(text)) return "Invalid phone number";
    return "";
  };

 const validatePassword = (text: string) => {
  if (!text.trim()) return "Password is required";

  if (text.includes(".")) return "Dots (.) not allowed";

  // Must contain:
  // uppercase, lowercase, number, special character
  // minimum 8 characters

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(text)) {
    return "Must contain uppercase, lowercase, number & special character";
  }

  return "";
};

  // ================= HANDLE LOGIN =================
  const handleLogin = async () => {
  const phoneError = validatePhone(phone);
  const passwordError = validatePassword(password);

  setErrors({
    phone: phoneError,
    password: passwordError,
  });

  if (phoneError || passwordError) return;

  try {
    // get saved user from signup
    const storedUser = await SecureStore.getItemAsync("user");

    if (!storedUser) {
      setErrors((prev) => ({
        ...prev,
        password: "No account found",
      }));
      return;
    }

    const user = JSON.parse(storedUser);

    // compare credentials
    if (phone !== user.phone || password !== user.password) {
      setErrors((prev) => ({
        ...prev,
        password: "Invalid credentials",
      }));
      return;
    }

    await SecureStore.setItemAsync("currentUser", JSON.stringify(user));

    // success
    router.replace("/chatList");

  } catch (error) {
    console.log(error);

    setErrors((prev) => ({
      ...prev,
      password: "Something went wrong",
    }));
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Globe color="#fff" size={26} />
          </View>
          <Text style={styles.title}>LingoLink</Text>
          <Text style={styles.subtitle}>
            Connect through the beauty of every tongue.
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* PHONE */}
          <Text style={styles.label}>Phone Number</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.codeBox}
              onPress={() => setShowCountries(!showCountries)}
            >
              <Text style={styles.codeText}>
                {selectedCountry.flag} {selectedCountry.code}
              </Text>
            </TouchableOpacity>

            <View style={styles.inputBox}>
              <Phone size={18} color="#888" />
              <TextInput
                placeholder="670 000 000"
                placeholderTextColor="#000"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setErrors((prev) => ({
                    ...prev,
                    phone: validatePhone(text),
                  }));
                }}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>

          {errors.phone ? (
            <Text style={styles.error}>{errors.phone}</Text>
          ) : null}

          {/* COUNTRY DROPDOWN */}
          {showCountries && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 180 }}>
                {countries.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCountry(c);
                      setShowCountries(false);
                    }}
                  >
                    <Text>
                      {c.flag} {c.name} ({c.code})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* PASSWORD */}
          <Text style={styles.label}>Password</Text>

          <View style={styles.inputBox}>
            <Lock size={18} color="#888" />

            <TextInput
              placeholder="Enter Your Password"
              placeholderTextColor="#000"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({
                  ...prev,
                  password: validatePassword(text),
                }));
              }}
              style={styles.input}
            />

            <TouchableOpacity
              style={{ paddingLeft: 5 }}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? (
                <EyeOff size={18} color="#888" />
              ) : (
                <Eye size={18} color="#888" />
              )}
            </TouchableOpacity>
          </View>

          {errors.password ? (
            <Text style={styles.error}>{errors.password}</Text>
          ) : null}

          {/* BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
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

  row: {
    flexDirection: "row",
    gap: 10,
  },

  codeBox: {
    backgroundColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  codeText: {
    color: "#333",
    fontSize: 14,
  },

  inputBox: {
    flex: 1,
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

  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    elevation: 4,
    overflow: "hidden",
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
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