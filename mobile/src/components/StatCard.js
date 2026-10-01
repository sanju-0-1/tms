import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../theme/theme";

export const StatCard = ({ title, value, icon, color = COLORS.primary, style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{title?.toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.value}>{value ?? 0}</Text>
        <View style={[styles.iconBox, { backgroundColor: `${color}25` }]}>
          {icon}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    justifyContent: "space-between",
    minHeight: 110,
    ...SHADOWS.small,
  },
  cardHeader: {
    marginBottom: 4,
  },
  title: {
    color: "#6EE7B7",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
