import React, { useState, useEffect, useContext, useCallback } from "react";
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
import { StatusBadge } from "../../components/StatusBadge";
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
  const [recentTickets, setRecentTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const isSuperAdmin = user?.role === "SuperAdmin";
  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "Staff";
  const isUser = !isSuperAdmin && !isAdmin && !isStaff;

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [statsRes, complaintsRes] = await Promise.all([
        complaintService.getStats().catch(() => ({ data: {} })),
        complaintService.getAll().catch(() => ({ data: [] })),
      ]);

      const all = complaintsRes.data?.complaints || complaintsRes.data || [];
      const userId = user?.id || user?._id;

      let filtered = all;
      if (isUser) {
        filtered = all.filter((c) => {
          const createdById = c.createdBy?._id || c.createdBy;
          return String(createdById) === String(userId);
        });
      } else if (isStaff) {
        filtered = all.filter((c) => {
          const assignedToId = c.assignedTo?._id || c.assignedTo;
          return String(assignedToId) === String(userId);
        });
      }

      setRecentTickets(filtered.slice(0, 4));

      if (isUser || isStaff) {
        setStats({
          total: filtered.length,
          pending: filtered.filter((c) => c.status === "Pending").length,
          inProgress: filtered.filter((c) => ["In-Progress", "Assigned"].includes(c.status)).length,
          resolved: filtered.filter((c) => ["Resolved", "Completed"].includes(c.status)).length,
          rejected: filtered.filter((c) => c.status === "Rejected").length,
        });
      } else if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.warn("Failed to load dashboard data", err);
    } finally {
      setRefreshing(false);
    }
  }, [user, isUser, isStaff]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Master options matching website dropdown menu
  const superAdminMasters = [
    { title: "Departments", icon: "business-outline", screen: "Departments", color: "#10B981" },
    { title: "Programmes", icon: "school-outline", screen: "Programmes", color: "#14B8A6" },
    { title: "Blocks", icon: "cube-outline", screen: "Blocks", color: "#0D9488" },
    { title: "Rooms", icon: "keypad-outline", screen: "Rooms", color: "#34D399" },
    { title: "Roles", icon: "shield-checkmark-outline", screen: "Roles", color: "#F59E0B" },
    { title: "Users", icon: "people-outline", screen: "Users", color: "#3B82F6" },
    { title: "Reports", icon: "bar-chart-outline", screen: "Reports", color: "#8B5CF6" },
  ];

  const adminMasters = [
    { title: "Departments", icon: "business-outline", screen: "Departments", color: "#10B981" },
    { title: "Users", icon: "people-outline", screen: "Users", color: "#3B82F6" },
    { title: "Reports", icon: "bar-chart-outline", screen: "Reports", color: "#8B5CF6" },
  ];

  const masterList = isSuperAdmin ? superAdminMasters : isAdmin ? adminMasters : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={isSuperAdmin ? "TMS Control" : isStaff ? "Field Ops" : "Member Hub"} />
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
        {/* Welcome Banner matching exact tms12 Website Screenshot */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeContent}>
            <View style={styles.controlPill}>
              <Text style={styles.controlPillText}>
                {isSuperAdmin ? "SYSTEM CONTROL" : isStaff ? "FIELD OPERATIONS" : "MEMBER HUB"}
              </Text>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.welcomeTitle}>
                Welcome, <Text style={styles.highlightName}>{user?.name || user?.username || "User"}</Text>!
              </Text>
              <Ionicons name="sparkles" size={26} color="#34D399" style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.welcomeSubtitle}>
              {isSuperAdmin
                ? "Global system overview and complaint trends."
                : isStaff
                ? "Manage your assigned technical tasks and resolutions."
                : "Track your reported issues and facility feedback."}
            </Text>
          </View>
        </View>

        {/* Quick Action Buttons Bar */}
        <View style={styles.actionGrid}>
          {(isUser || isSuperAdmin || isAdmin) && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigation.navigate("NewComplaint")}
            >
              <Ionicons name="add-circle" size={20} color="#020C07" />
              <Text style={styles.actionBtnTextDark}>Raise Complaint</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={() => navigation.navigate("MyComplaintsTab")}
          >
            <Ionicons name="ticket-outline" size={20} color={COLORS.primaryLight} />
            <Text style={styles.actionBtnTextLight}>{isStaff ? "Assigned Queue" : "My Tickets"}</Text>
          </TouchableOpacity>

          {(isSuperAdmin || isAdmin || isStaff) && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => navigation.navigate("AllComplaintsTab")}
            >
              <Ionicons name="albums-outline" size={20} color="#FFF" />
              <Text style={styles.actionBtnTextLight}>Complaints</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Grid matching exact Website Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title={isSuperAdmin ? "GLOBAL TICKETS" : isStaff ? "ASSIGNED TASKS" : "TOTAL RAISED"}
            value={stats.total}
            color="#10B981"
            icon={<Ionicons name="briefcase-outline" size={24} color="#10B981" />}
          />
          <StatCard
            title="PENDING REVIEW"
            value={stats.pending}
            color="#F59E0B"
            icon={<Ionicons name="time-outline" size={24} color="#F59E0B" />}
          />
          <StatCard
            title="RESOLVED UNITS"
            value={stats.resolved}
            color="#10B981"
            icon={<Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />}
          />
          <StatCard
            title="ACTIVE PROGRESS"
            value={stats.inProgress}
            color="#06B6D4"
            icon={<Ionicons name="flash-outline" size={24} color="#06B6D4" />}
          />
        </View>

        {/* System Activity Feed */}
        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionTitle}>
            {isSuperAdmin ? "System-wide Activity" : isStaff ? "Your Queue" : "My Recent Issues"}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate(isSuperAdmin || isStaff ? "AllComplaintsTab" : "MyComplaintsTab")}>
            <Text style={styles.textLink}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityContainer}>
          {recentTickets.length > 0 ? (
            recentTickets.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.activityCard}
                onPress={() => navigation.navigate(isSuperAdmin || isStaff ? "AllComplaintsTab" : "MyComplaintsTab")}
              >
                <View style={styles.activityHeader}>
                  <Text style={styles.activityType}>{item.complaintType}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.activityDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.activityMeta}>📍 {item.blockName || "Block"} • Room {item.roomNumber || "N/A"}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>No activity found in your record.</Text>
            </View>
          )}
        </View>

        {/* System Control & Manage Console ONLY for SuperAdmin & Admin */}
        {(isSuperAdmin || isAdmin) && (
          <View style={styles.adminSection}>
            <View style={styles.adminSectionHeaderRow}>
              <Text style={styles.sectionTitle}>{isSuperAdmin ? "System Master Control" : "Admin Console"}</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{isSuperAdmin ? "SUPERADMIN" : "ADMIN"}</Text>
              </View>
            </View>
            <Text style={styles.adminSubText}>
              {isSuperAdmin
                ? "Manage system architecture, user roles, facility masters, and audit reports."
                : "Manage department users and monitor complaint resolution analytics."}
            </Text>

            <View style={styles.adminGrid}>
              {masterList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.adminTile}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.adminTileIconBox, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.adminTileText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
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
  welcomeBanner: {
    backgroundColor: "#052A1B",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.22)",
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  welcomeContent: {
    justifyContent: "center",
  },
  controlPill: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  controlPillText: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  highlightName: {
    color: "#34D399",
  },
  welcomeSubtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...SHADOWS.small,
  },
  actionBtnOutline: {
    backgroundColor: "#052A1B",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  actionBtnSecondary: {
    backgroundColor: "#052C1D",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  actionBtnTextDark: {
    color: "#020C07",
    fontSize: 13,
    fontWeight: "800",
  },
  actionBtnTextLight: {
    color: "#ECFDF5",
    fontSize: 13,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: SPACING.lg,
  },
  sectionHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    color: "#ECFDF5",
    fontSize: 17,
    fontWeight: "800",
  },
  textLink: {
    color: "#34D399",
    fontSize: 13,
    fontWeight: "600",
  },
  activityContainer: {
    marginBottom: SPACING.lg,
  },
  activityCard: {
    backgroundColor: "#052A1B",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.22)",
    padding: SPACING.md,
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  activityType: {
    color: "#ECFDF5",
    fontSize: 14,
    fontWeight: "700",
  },
  activityDesc: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 8,
  },
  activityMeta: {
    color: "#6EE7B7",
    fontSize: 11,
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: "#052A1B",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.22)",
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 6,
  },
  adminSection: {
    marginTop: SPACING.xs,
    backgroundColor: "rgba(16, 185, 129, 0.04)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.22)",
    padding: SPACING.md,
  },
  adminSectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminSubText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: SPACING.md,
    marginTop: 2,
  },
  badgeCount: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  badgeCountText: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  adminGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  adminTile: {
    width: "48%",
    backgroundColor: "#052A1B",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.22)",
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...SHADOWS.small,
  },
  adminTileIconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  adminTileText: {
    color: "#ECFDF5",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
});
