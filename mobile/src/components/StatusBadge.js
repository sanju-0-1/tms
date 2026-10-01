import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS } from "../theme/theme";

export const StatusBadge = ({ label, type = "status", style }) => {
  if (!label) return null;

  const normalizedKey = label.replace(/\s+/g, "_");
  const colorScheme =
    type === "status"
      ? COLORS.status[normalizedKey] || { bg: COLORS.cardBorder, text: COLORS.text, border: COLORS.border }
      : COLORS.priority[label] || { bg: COLORS.cardBorder, text: COLORS.text };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorScheme.bg, borderColor: colorScheme.border || colorScheme.text },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colorScheme.text }]}>
        {label.replace("_", " ")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
