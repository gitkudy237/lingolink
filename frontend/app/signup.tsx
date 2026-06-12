import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "./components/Modal";
import { signup } from "../src/services/authService";
import type { AuthRegisterRequest } from "@lingolink/shared";

const languagesRow1 = [
  { name: "English", flag: "🇬🇧" },
  { name: "French", flag: "🇫🇷" },
];

const languagesRow2 = [
  { name: "German", flag: "🇩🇪" },
  { name: "Spanish", flag: "🇪🇸" },
];

const moreLanguages = [
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Chinese", flag: "🇨🇳" },
  { name: "Portuguese", flag: "🇵🇹" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "Ewondo", flag: "🇨🇲" },
  { name: "Fulfulde", flag: "🇨🇲" },
  { name: "Duala", flag: "🇨🇲" },
  { name: "Bassa", flag: "🇨🇲" },
  { name: "Pidgin English", flag: "🇨🇲" },
];

const countries = [
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "USA", code: "+1", flag: "🇺🇸" },
  { name: "UK", code: "+44", flag: "🇬🇧" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
];

type InputFieldProps = {
  icon: any;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  secure?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
};

const InputField = React.memo(function InputField({
  icon,
  placeholder,
  value,
  onChange,
  secure,
  keyboardType,
}: InputFieldProps) {
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#666" />

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure ? hidden : false}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      {secure && (
        <TouchableOpacity onPress={() => setHidden(!hidden)}>
          <Ionicons
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const [selectedLang, setSelectedLang] = useState(languagesRow1[0]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const [showCountries, setShowCountries] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  };

  const validateUsername = (text: string) => {
    if (!text.trim()) return "Username is required";
    if (text.includes(".")) return "Dots (.) not allowed";
    if (text.length < 3) return "Min 3 characters";
    return "";
  };

  const validatePhone = (text: string) => {
    if (!text.trim()) return "Phone is required";
    if (text.includes(".")) return "Dots (.) not allowed";
    if (!/^[0-9]{6,15}$/.test(text)) return "Invalid phone";
    return "";
  };

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

  const handleSubmit = async () => {
    const usernameError = validateUsername(form.username);
    const phoneError = validatePhone(form.phone);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    setErrors({
      username: usernameError,
      phone: phoneError,
      email: emailError,
      password: passwordError,
    });

    if (usernameError || phoneError || emailError || passwordError) {
      return;
    }

    try {
      const normalizedPhone = form.phone.trim().replace(/\D/g, "");
      const payload: AuthRegisterRequest = {
        username: form.username,
        email: form.email,
        password: form.password,
        phone: `${selectedCountry.code}${normalizedPhone}`,
        preferredLanguage: selectedLang.name,
      };

      const { user, token } = await signup(payload);
      await SecureStore.setItemAsync("currentUser", JSON.stringify(user));
      await SecureStore.setItemAsync("authToken", token);
      showToast("Account created successfully!", "success");

      router.replace("/chatList");
    } catch (error) {
      console.log("SAVE ERROR:", error);

      showToast(
        (error as any)?.response?.data?.error || "Failed to create account",
        "error",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Toast {...toast} />

      <ScrollView
        contentContainerStyle={styles.wrapper}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="globe-outline" size={26} color="#fff" />
          </View>
          <Text style={styles.title}>LingoLink</Text>
          <Text style={styles.subtitle}>
            Connect through the beauty of every tongue.
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* USERNAME */}
          <InputField
            icon="person-outline"
            placeholder="Username"
            value={form.username}
            onChange={(text: string) => {
              setForm({ ...form, username: text });
              setErrors((prev) => ({
                ...prev,
                username: validateUsername(text),
              }));
            }}
          />
          {errors.username ? (
            <Text style={styles.error}>{errors.username}</Text>
          ) : null}

          {/* PHONE */}
          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.codeBox}
              onPress={() => setShowCountries(!showCountries)}
            >
              <Text>
                {selectedCountry.flag} {selectedCountry.code}
              </Text>
            </TouchableOpacity>

            <View style={styles.phoneInput}>
              <TextInput
                placeholder="Phone number"
                placeholderTextColor="#999"
                value={form.phone}
                onChangeText={(text) => {
                  setForm({ ...form, phone: text });
                  setErrors((prev) => ({
                    ...prev,
                    phone: validatePhone(text),
                  }));
                }}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </View>
          {errors.phone ? (
            <Text style={styles.error}>{errors.phone}</Text>
          ) : null}

          {/* COUNTRY DROPDOWN */}
          {showCountries && (
            <View style={styles.dropdownList}>
              <ScrollView style={{ maxHeight: 150 }}>
                {countries.map((c) => (
                  <TouchableOpacity
                    key={c.name}
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

          {/* EMAIL */}
          <InputField
            icon="mail-outline"
            placeholder="Enter Your Email"
            value={form.email}
            keyboardType="email-address"
            onChange={(text: string) => {
              setForm({ ...form, email: text });
              setErrors((prev) => ({
                ...prev,
                email: validateEmail(text),
              }));
            }}
          />
          {errors.email ? (
            <Text style={styles.error}>{errors.email}</Text>
          ) : null}

          {/* PASSWORD */}
          <InputField
            icon="lock-closed-outline"
            placeholder="Enter Your Password"
            secure
            value={form.password}
            onChange={(text: string) => {
              setForm({ ...form, password: text });
              setErrors((prev) => ({
                ...prev,
                password: validatePassword(text),
              }));
            }}
          />
          {errors.password ? (
            <Text style={styles.error}>{errors.password}</Text>
          ) : null}

          <Text style={styles.terms}>Preferred Language</Text>

          {/* LANGUAGES */}
          <View style={styles.langRow}>
            {languagesRow1.map((lang) => (
              <TouchableOpacity
                key={lang.name}
                style={[
                  styles.langBtn,
                  selectedLang.name === lang.name && styles.activeLang,
                ]}
                onPress={() => setSelectedLang(lang)}
              >
                <Text
                  style={
                    selectedLang.name === lang.name
                      ? styles.activeLangText
                      : styles.langText
                  }
                >
                  {lang.flag} {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.langRow}>
            {languagesRow2.map((lang) => (
              <TouchableOpacity
                key={lang.name}
                style={[
                  styles.langBtn,
                  selectedLang.name === lang.name && styles.activeLang,
                ]}
                onPress={() => setSelectedLang(lang)}
              >
                <Text
                  style={
                    selectedLang.name === lang.name
                      ? styles.activeLangText
                      : styles.langText
                  }
                >
                  {lang.flag} {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setShowMore(!showMore)}
          >
            <Text style={styles.langText}>More Languages</Text>
          </TouchableOpacity>

          {showMore && (
            <View style={styles.dropdownList}>
              <ScrollView style={{ maxHeight: 150 }}>
                {moreLanguages.map((lang) => (
                  <TouchableOpacity
                    key={lang.name}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedLang(lang);
                      setShowMore(false);
                    }}
                  >
                    <Text>
                      {lang.flag} {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.terms}>
            I agree to the Terms of Service and Privacy Policy
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.link}> Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF6F5" },
  wrapper: { padding: 20 },

  header: { alignItems: "center", marginTop: 10, marginBottom: 10 },

  logo: {
    backgroundColor: "#006666",
    padding: 5,
    borderRadius: 40,
    marginTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#006666",
    marginTop: 10,
  },

  subtitle: { color: "#777", textAlign: "center" },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  input: { marginLeft: 10, flex: 1 },

  phoneRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  codeBox: {
    backgroundColor: "#F4F4F4",
    padding: 12,
    borderRadius: 10,
  },

  phoneInput: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  langRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },

  langBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  activeLang: {
    backgroundColor: "#006666",
    borderColor: "#006666",
  },

  langText: { color: "#555" },
  activeLangText: { color: "#fff", fontWeight: "600" },

  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    elevation: 3,
  },

  dropdownItem: { padding: 12 },

  terms: {
    fontSize: 12,
    color: "#777",
    marginVertical: 10,
  },

  button: {
    backgroundColor: "#006666",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  loginText: {
    color: "#777",
    textAlign: "center",
  },

  link: {
    color: "#006666",
    fontWeight: "bold",
  },

  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
});
