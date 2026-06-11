import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  error?: string;
  secure?: boolean;
};

const Input: React.FC<Props> = ({
  icon,
  placeholder,
  value,
  onChange,
  error,
  secure,
}) => {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.inputBox}>
        <Ionicons name={icon} size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          secureTextEntry={secure}
          value={value}
          onChangeText={onChange}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 45,
    marginLeft: 10,
  },
  error: {
    color: "red",
    fontSize: 12,
  },
});
