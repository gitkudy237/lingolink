import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../src/theme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  error?: string;
  secure?: boolean;
  keyboardType?: any;
};

const Input: React.FC<Props> = ({
  icon,
  placeholder,
  value,
  onChange,
  error,
  secure,
  keyboardType,
}) => {
  return (
    <View style={{ marginBottom: theme.spacing.sm }}>
      <View style={[styles.inputBox, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name={icon} size={20} color={theme.colors.muted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          secureTextEntry={secure}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
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
    borderColor: "#eee",
    borderRadius: theme.radii.sm,
    paddingHorizontal: 12,
    height: theme.sizes.inputHeight,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: theme.colors.text,
    fontSize: 15,
    height: "100%",
  },
  error: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
});
