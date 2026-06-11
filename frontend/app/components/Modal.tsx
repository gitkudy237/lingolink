import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Toast = ({ visible, message, type }: any) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.toast,
          type === "error" ? styles.error : styles.success,
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 999,
  },

  toast: {
    padding: 12,
    borderRadius: 8,
    minWidth: 180,
  },

  success: {
    backgroundColor: "#2ecc71",
  },

  error: {
    backgroundColor: "#e74c3c",
  },

  text: {
    color: "#fff",
    fontWeight: "600",
  },
});