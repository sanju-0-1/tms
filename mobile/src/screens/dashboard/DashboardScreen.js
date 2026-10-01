import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
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
        // Regular users only see their own tickets
        filtered = all.filter((c) => {
          const createdById = c.createdBy?._id || c.createdBy;
          return String(createdById) === String(userId);
        });
      } else if (isStaff) {
        // Staff see tickets assigned to them
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

  // Master options based on role
  const superAdminMasters = [
    { title: "Departments", icon: "business", screen: "Departments", color: "#10B981" },
    { title: "Programmes", icon: "school", screen: "Programmes", color: "#14B8A6" },
    { title: "Blocks", icon: "cube", screen: "Blocks", color: "#0D9488" },
    { title: "Rooms", icon: "keypad", screen: "Rooms", color: "#34D399" },
    { title: "Roles", icon: "shield-checkmark", screen: "Roles", color: "#F59E0B" },
    { title: "Users", icon: "people", screen: "Users", color: "#3B82F6" },
    { title: "Reports", icon: "bar-chart", screen: "Reports", color: "#8B5CF6" },
  ];

  const adminMasters = [
    { title: "Departments", icon: "business", screen: "Departments", color: "#10B981" },
    { title: "Users", icon: "people", screen: "Users", color: "#3B82F6" },
    { title: "Reports", icon: "bar-chart", screen: "Reports", color: "#8B5CF6" },
  ];

  const masterList = isSuperAdmin ? superAdminMasters : isAdmin ? adminMasters : [];

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
        {/* Customized Welcome Banner */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextGroup}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>
                {isSuperAdmin ? "System Admin" : isAdmin ? "Administrator" : isStaff ? "Field Technician" : "Member Portal"}
              </Text>
            </View>
            <Text style={styles.welcomeName}>Hello, {user?.name || "User"}</Text>
            <Text style={styles.welcomeSubtext}>
              {isSuperAdmin
                ? "Global system analytics & master control."
                : isAdmin
                ? "Department management & complaint oversight."
                : isStaff
                ? "Manage your assigned tasks and resolutions."
                : "Track your tickets and facility feedback."}
            </Text>
          </View>
          <View style={styles.welcomeIconBadge}>
            <Ionicons
              name={isSuperAdmin ? "server-outline" : isStaff ? "construct-outline" : "ticket-outline"}
              size={28}
              color="#020C07"
            />
          </View>
        </View>

        {/* Action Grid based on Role */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {(isUser || isSuperAdmin || isAdmin) && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigation.navigate("NewComplaint")}
            >
              <Ionicons name="add-circle" size={24} color="#020C07" />
              <Text style={styles.actionBtnTextDark}>Lodge Ticket</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder }]}
            onPress={() => navigation.navigate("MyComplaintsTab")}
          >
            <Ionicons name="ticket-outline" size={24} color={COLORS.primaryLight} />
            <Text style={styles.actionBtnTextLight}>{isStaff ? "Assigned Queue" : "My Tickets"}</Text>
          </TouchableOpacity>

          {(isSuperAdmin || isAdmin || isStaff) && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]}
              onPress={() => navigation.navigate("AllComplaintsTab")}
            >
              <Ionicons name="albums" size={24} color="#FFF" />
              <Text style={styles.actionBtnTextLight}>All Tickets</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Complaints Analytics Breakdown */}
        <Text style={styles.sectionHeader}>
          {isSuperAdmin ? "Global Complaints Analytics" : isStaff ? "My Task Metrics" : "My Ticket Overview"}
        </Text>
        <View style={styles.statsContainer}>
          <StatCard
            title={isSuperAdmin ? "Total Complaints" : isStaff ? "Assigned Tasks" : "Total Raised"}
            value={stats.total}
            color={COLORS.primary}
            icon={<Ionicons name="documents-outline" size={22} color={COLORS.primary} />}
          />
          <StatCard
            title="Pending Review"
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

        {/* Recent Tickets Activity Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHead}>
            <Text style={styles.sectionHeader}>Recent Tickets</Text>
            <TouchableOpacity onPress={() => navigation.navigate(isSuperAdmin || isStaff ? "AllComplaintsTab" : "MyComplaintsTab")}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentTickets.length > 0 ? (
            recentTickets.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.ticketCard}
                onPress={() => navigation.navigate(isSuperAdmin || isStaff ? "AllComplaintsTab" : "MyComplaintsTab")}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketType}>{item.complaintType}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.ticketDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.ticketMeta}>
                  <Text style={styles.ticketMetaText}>📍 {item.blockName || "Block"} • Room {item.roomNumber || "N/A"}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="folder-open-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No recent complaint activity.</Text>
            </View>
          )}
        </View>

        {/* Master Control Console ONLY for SuperAdmin & Admin */}
        {(isSuperAdmin || isAdmin) && (
          <View style={styles.adminSection}>
            <View style={styles.adminSectionHeaderRow}>
              <Text style={styles.sectionHeader}>{isSuperAdmin ? "SuperAdmin Control Panel" : "Admin Management Console"}</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{isSuperAdmin ? "Full Access" : "Admin Access"}</Text>
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
                  <View style={[styles.adminTileIconBox, { backgroundColor: item.color + "20" }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
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
  badgePill: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  badgePillText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  welcomeName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  welcomeSubtext: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  welcomeIconBadge: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    ...SHADOWS.medium,
  },
  sectionHeader: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  actionBtnTextDark: {
    color: "#020C07",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  actionBtnTextLight: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  recentSection: {
    marginBottom: SPACING.lg,
  },
  recentHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  viewAllText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: "600",
  },
  ticketCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    marginBottom: 10,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ticketType: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  ticketDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketMetaText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  adminSection: {
    marginTop: SPACING.xs,
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
  adminTileIconBox: {
    width: 36,
    height: 36,
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
