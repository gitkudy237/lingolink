
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import theme from "../../src/theme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  style?: ViewStyle;
};

const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}) => {
  const backgroundColor =
    variant === "primary" ? theme.colors.primary : "transparent";
  const textColor = variant === "primary" ? "#fff" : theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  text: { fontWeight: "700", fontSize: 16 },
});
