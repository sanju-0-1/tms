import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../theme/theme";

export const StatCard = ({ title, value, icon, color = COLORS.primary, style }) => {
  return (
    <View style={[styles.card, { borderLeftColor: color }, style]}>
      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.value}>{value ?? 0}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderLeftWidth: 4,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  textGroup: {
    flex: 1,
  },
  value: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
});
