import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../theme/theme";

export const CustomButton = ({
  title,
  onPress,
  variant = "primary", // primary, secondary, danger, outline
  size = "medium", // small, medium, large
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.cardBorder;
    switch (variant) {
      case "secondary":
        return COLORS.secondary;
      case "danger":
        return COLORS.danger;
      case "outline":
        return "transparent";
      case "primary":
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    if (variant === "outline") return COLORS.primaryLight;
    return "#FFFFFF";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === "outline" && styles.outlineBorder,
        size === "small" && styles.smallBtn,
        size === "large" && styles.largeBtn,
        variant === "primary" && !disabled ? SHADOWS.medium : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor() },
              icon ? { marginLeft: 8 } : null,
              size === "small" && styles.smallText,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  largeBtn: {
    paddingVertical: 16,
    paddingHorizontal: SPACING.lg,
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
  },
  smallText: {
    fontSize: 13,
  },
});
