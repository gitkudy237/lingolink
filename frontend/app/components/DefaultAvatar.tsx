import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../../src/theme";

type Props = {
  name: string;
  size?: number;
};

const DefaultAvatar: React.FC<Props> = ({ name, size = 50 }) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const initials = getInitials(name);
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size / 2.5 }]}>{initials}</Text>
    </View>
  );
};

export default DefaultAvatar;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "700",
    color: "#fff",
  },
});
