import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { complaintService } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { StatCard } from "../../components/StatCard";
import { Ionicons } from "@expo/vector-icons";

export const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await complaintService.getStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn("Failed to load dashboard stats", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const isAdminOrSuper = user?.role === "Admin" || user?.role === "SuperAdmin";
  const canManageAll = isAdminOrSuper || user?.role === "Staff";

  const adminMasters = [
    { title: "Departments", icon: "business", screen: "Departments", color: "#10B981" },
    { title: "Programmes", icon: "school", screen: "Programmes", color: "#14B8A6" },
    { title: "Blocks", icon: "cube", screen: "Blocks", color: "#0D9488" },
    { title: "Rooms", icon: "keypad", screen: "Rooms", color: "#34D399" },
    { title: "Roles", icon: "shield-checkmark", screen: "Roles", color: "#F59E0B" },
    { title: "Users", icon: "people", screen: "Users", color: "#3B82F6" },
    { title: "Analytics & Reports", icon: "bar-chart", screen: "Reports", color: "#8B5CF6" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Ticket & Facility Portal" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchDashboardData}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Welcome Banner with Emerald Gradient Styling */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextGroup}>
            <Text style={styles.welcomeGreeting}>Welcome back 👋</Text>
            <Text style={styles.welcomeName}>{user?.name || "User"}</Text>
            <View style={styles.roleTag}>
              <Ionicons name="shield-outline" size={12} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
              <Text style={styles.welcomeRole}>{user?.role || "Member"}</Text>
            </View>
          </View>
          <View style={styles.welcomeIconBadge}>
            <Ionicons name="sparkles" size={30} color="#020C07" />
          </View>
        </View>

        {/* Primary Action Buttons */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate("NewComplaint")}
          >
            <Ionicons name="add-circle" size={26} color="#020C07" />
            <Text style={styles.actionBtnTextDark}>Lodge Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder }]}
            onPress={() => navigation.navigate("MyComplaintsTab")}
          >
            <Ionicons name="ticket-outline" size={26} color={COLORS.primaryLight} />
            <Text style={styles.actionBtnTextLight}>My Tickets</Text>
          </TouchableOpacity>
        </View>

        {/* Complaints Analytics Overview */}
        <Text style={styles.sectionHeader}>Complaints Analytics</Text>
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Complaints"
            value={stats.total}
            color={COLORS.primary}
            icon={<Ionicons name="documents-outline" size={22} color={COLORS.primary} />}
          />
          <StatCard
            title="Pending Actions"
            value={stats.pending}
            color={COLORS.warning}
            icon={<Ionicons name="time-outline" size={22} color={COLORS.warning} />}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            color={COLORS.info}
            icon={<Ionicons name="construct-outline" size={22} color={COLORS.info} />}
          />
          <StatCard
            title="Resolved Tickets"
            value={stats.resolved}
            color={COLORS.success}
            icon={<Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />}
          />
        </View>

        {/* Full Admin & SuperAdmin Control Panel */}
        {isAdminOrSuper && (
          <View style={styles.adminSection}>
            <View style={styles.adminSectionHeaderRow}>
              <Text style={styles.sectionHeader}>Admin Master Control Console</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>Full Access</Text>
              </View>
            </View>
            <Text style={styles.adminSubText}>Manage all institution masters, user permissions, and system reports.</Text>
            
            <View style={styles.adminGrid}>
              {adminMasters.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.adminTile}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.adminTileIconBox, { backgroundColor: item.color + "20" }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={styles.adminTileText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
              
              {canManageAll && (
                <TouchableOpacity
                  style={[styles.adminTile, styles.highlightTile]}
                  onPress={() => navigation.navigate("AllComplaintsTab")}
                  activeOpacity={0.8}
                >
                  <View style={[styles.adminTileIconBox, { backgroundColor: COLORS.primary + "30" }]}>
                    <Ionicons name="options-outline" size={22} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.adminTileText, { color: COLORS.primaryLight, fontWeight: "700" }]}>All Complaints Console</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  welcomeCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  welcomeGreeting: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  welcomeName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginVertical: 4,
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  welcomeRole: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: "700",
  },
  welcomeIconBadge: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justify.content: "center",
    ...SHADOWS.medium,
  },
  sectionHeader: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  actionBtnTextDark: {
    color: "#020C07",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  actionBtnTextLight: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  adminSection: {
    marginTop: SPACING.sm,
    backgroundColor: "rgba(16, 185, 129, 0.04)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
  },
  adminSectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminSubText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.md,
  },
  badgeCount: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  badgeCountText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: "700",
  },
  adminGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  adminTile: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...SHADOWS.small,
  },
  highlightTile: {
    width: "100%",
    borderColor: COLORS.primary,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  adminTileIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  adminTileText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
});
