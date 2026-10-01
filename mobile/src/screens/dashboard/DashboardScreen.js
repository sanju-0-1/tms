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
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Exact Web Role Classification
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isStaff = user?.role !== "User" && !isSuperAdmin;
  const isUser = user?.role === "User";

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await complaintService.getAll().catch(() => ({ data: [] }));
      const allComplaints = res.data?.complaints || res.data || [];
      const userId = user?.id || user?._id;

      let filtered = allComplaints;

      if (isUser) {
        // Regular Users see complaints they created
        filtered = allComplaints.filter((c) => {
          const createdById = c.createdBy?._id || c.createdBy;
          return String(createdById) === String(userId);
        });
      } else if (isStaff) {
        // Staff see complaints assigned to them
        filtered = allComplaints.filter((c) => {
          const assignedToId = c.assignedTo?._id || c.assignedTo;
          return String(assignedToId) === String(userId);
        });
      }
      // SuperAdmin sees all complaints (filtered = allComplaints)

      setRecentTickets(filtered.slice(0, 5));

      setStats({
        total: filtered.length,
        pending: filtered.filter((c) => c.status === "Pending").length,
        inProgress: filtered.filter((c) => ["In-Progress", "Assigned"].includes(c.status)).length,
        resolved: filtered.filter((c) => ["Resolved", "Completed"].includes(c.status)).length,
      });
    } catch (err) {
      console.warn("Failed to load dashboard data", err);
    } finally {
      setRefreshing(false);
    }
  }, [user, isSuperAdmin, isStaff, isUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Master Management items (SuperAdmin Only - matching website dropdown)
  const superAdminMasters = [
    { title: "Departments", icon: "business-outline", screen: "Departments", color: "#10B981" },
    { title: "Programmes", icon: "school-outline", screen: "Programmes", color: "#14B8A6" },
    { title: "Blocks", icon: "cube-outline", screen: "Blocks", color: "#0D9488" },
    { title: "Rooms", icon: "keypad-outline", screen: "Rooms", color: "#34D399" },
    { title: "Roles", icon: "shield-checkmark-outline", screen: "Roles", color: "#F59E0B" },
    { title: "Users", icon: "people-outline", screen: "Users", color: "#3B82F6" },
    { title: "Reports", icon: "bar-chart-outline", screen: "Reports", color: "#8B5CF6" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={isSuperAdmin ? "System Control" : isStaff ? "Field Operations" : "Member Hub"} />
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
        {/* ── 1. Role-Tailored Welcome Banner ── */}
        <View style={styles.welcomeBanner}>
          <View style={styles.controlPill}>
            <Text style={styles.controlPillText}>
              {isSuperAdmin ? "SYSTEM CONTROL" : isStaff ? "FIELD OPERATIONS" : "MEMBER HUB"}
            </Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.welcomeTitle}>
              Welcome, <Text style={styles.highlightName}>{user?.name || user?.username || "User"}</Text>!
            </Text>
            <Ionicons name="sparkles" size={24} color="#34D399" style={{ marginLeft: 6 }} />
          </View>

          <Text style={styles.welcomeSubtitle}>
            {isSuperAdmin 
              ? "Global system overview and complaint trends." 
              : isStaff 
                ? `Assigned Role: ${user?.role || "Technical Staff"}. Manage your assigned tasks.` 
                : "Track your reported issues and facility feedback."}
          </Text>

          {/* User Role CTAs */}
          {isUser && (
            <TouchableOpacity
              style={styles.bannerCtaBtn}
              onPress={() => navigation.navigate("NewComplaint")}
            >
              <Ionicons name="add-circle" size={18} color="#020C07" />
              <Text style={styles.bannerCtaText}>Raise New Complaint</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 2. Quick Actions Grid ── */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate("NewComplaint")}
          >
            <Ionicons name="add-circle-outline" size={20} color="#020C07" />
            <Text style={styles.actionBtnTextDark}>Raise Complaint</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={() => navigation.navigate("MyComplaintsTab")}
          >
            <Ionicons name="ticket-outline" size={20} color={COLORS.primaryLight} />
            <Text style={styles.actionBtnTextLight}>{isStaff ? "My Queue" : "My Activity"}</Text>
          </TouchableOpacity>

          {(isSuperAdmin || isStaff) && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => navigation.navigate("AllComplaintsTab")}
            >
              <Ionicons name="albums-outline" size={20} color="#FFF" />
              <Text style={styles.actionBtnTextLight}>{isStaff ? "Task Queue" : "All Tickets"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 3. Role-Tailored Stats Grid (Matching Website Cards) ── */}
        <View style={styles.statsGrid}>
          <StatCard
            title={isSuperAdmin ? "GLOBAL TICKETS" : isStaff ? "ASSIGNED TASKS" : "TOTAL RAISED"}
            value={stats.total}
            color="#60A5FA"
            icon={<Ionicons name="briefcase-outline" size={22} color="#60A5FA" />}
          />
          <StatCard
            title="PENDING REVIEW"
            value={stats.pending}
            color="#FBBF24"
            icon={<Ionicons name="time-outline" size={22} color="#FBBF24" />}
          />
          <StatCard
            title="RESOLVED UNITS"
            value={stats.resolved}
            color="#34D399"
            icon={<Ionicons name="checkmark-circle-outline" size={22} color="#34D399" />}
          />
          <StatCard
            title="ACTIVE PROGRESS"
            value={stats.inProgress}
            color="#2DD4BF"
            icon={<Ionicons name="flash-outline" size={22} color="#2DD4BF" />}
          />
        </View>

        {/* ── 4. Activity Section ── */}
        <View style={styles.sectionHeadRow}>
          <View>
            <Text style={styles.sectionTitle}>
              {isSuperAdmin ? "System-wide Activity" : isStaff ? "Your Assigned Queue" : "My Recent Issues"}
            </Text>
            <Text style={styles.sectionSubtitle}>Latest status updates for complaints</Text>
          </View>
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
                <View style={styles.activityMetaRow}>
                  <Text style={styles.activityMeta}>📍 {item.blockName || "Block"} • Room {item.roomNumber || "N/A"}</Text>
                  <Text style={styles.activityDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>No activity found in your record.</Text>
            </View>
          )}
        </View>

        {/* ── 5. Role-Tailored System Insights Panel (Matching Website) ── */}
        <View style={styles.insightPanel}>
          <View style={styles.insightTitleRow}>
            <Ionicons name="trending-up-outline" size={20} color="#34D399" />
            <Text style={styles.insightTitle}>System Insights</Text>
          </View>
          <Text style={styles.insightText}>
            {isStaff
              ? "You are maintaining a resolution efficiency of 94%. Keep up the great work!"
              : isSuperAdmin
                ? "Peak volume detected in Electrical & Networking complaints this week."
                : "Facility managers are prioritizing Block A maintenance updates today."}
          </Text>

          {isStaff ? (
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>EFFICIENCY</Text>
                <Text style={styles.metricValue}>94%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>AVG. RESOLUTION</Text>
                <Text style={styles.metricValue}>2.4h</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.supportBtn} onPress={() => navigation.navigate("NewComplaint")}>
              <Ionicons name="help-buoy-outline" size={18} color="#10B981" />
              <Text style={styles.supportBtnText}>Contact Facility Support</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 6. SuperAdmin ONLY Master Management Panel ── */}
        {isSuperAdmin && (
          <View style={styles.adminSection}>
            <View style={styles.adminSectionHeaderRow}>
              <Text style={styles.sectionTitle}>System Management</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>SUPERADMIN</Text>
              </View>
            </View>
            <Text style={styles.adminSubText}>
              Manage system architecture, user roles, facility masters, and audit reports.
            </Text>

            <View style={styles.adminGrid}>
              {superAdminMasters.map((item, index) => (
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
  controlPill: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 12,
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
    fontSize: 22,
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
  bannerCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    alignSelf: "flex-start",
    marginTop: 14,
    gap: 6,
  },
  bannerCtaText: {
    color: "#020C07",
    fontSize: 13,
    fontWeight: "800",
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
    paddingHorizontal: 8,
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
    fontSize: 12,
    fontWeight: "800",
  },
  actionBtnTextLight: {
    color: "#ECFDF5",
    fontSize: 12,
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
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    color: "#ECFDF5",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  textLink: {
    color: "#34D399",
    fontSize: 13,
    fontWeight: "700",
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
  activityMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityMeta: {
    color: "#6EE7B7",
    fontSize: 11,
    fontWeight: "500",
  },
  activityDate: {
    color: "#9CA3AF",
    fontSize: 11,
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
  insightPanel: {
    backgroundColor: "#052A1B",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.22)",
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  insightTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    color: "#ECFDF5",
    fontSize: 15,
    fontWeight: "700",
  },
  insightText: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  metricRow: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.15)",
  },
  metricItem: {},
  metricLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    color: "#A7F3D0",
    fontSize: 20,
    fontWeight: "800",
  },
  supportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  supportBtnText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
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
