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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Dashboard" />
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
        {/* Welcome Banner */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextGroup}>
            <Text style={styles.welcomeGreeting}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{user?.name || "User"}</Text>
            <Text style={styles.welcomeRole}>Role: {user?.role}</Text>
          </View>
          <View style={styles.welcomeIconBadge}>
            <Ionicons name="sparkles" size={32} color="#FFF" />
          </View>
        </View>

        {/* Quick Action Grid */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate("NewComplaint")}
          >
            <Ionicons name="add-circle-outline" size={28} color="#FFF" />
            <Text style={styles.actionBtnText}>Lodge Complaint</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]}
            onPress={() => navigation.navigate("MyComplaints")}
          >
            <Ionicons name="list-outline" size={28} color="#FFF" />
            <Text style={styles.actionBtnText}>My Complaints</Text>
          </TouchableOpacity>
        </View>

        {/* System Analytics Stats */}
        <Text style={styles.sectionHeader}>Complaints Summary</Text>
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

        {/* SuperAdmin Quick Access Links */}
        {user?.role === "SuperAdmin" && (
          <>
            <Text style={styles.sectionHeader}>SuperAdmin Management</Text>
            <View style={styles.adminGrid}>
              <TouchableOpacity
                style={styles.adminTile}
                onPress={() => navigation.navigate("Departments")}
              >
                <Ionicons name="business-outline" size={24} color={COLORS.primaryLight} />
                <Text style={styles.adminTileText}>Departments</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminTile}
                onPress={() => navigation.navigate("Users")}
              >
                <Ionicons name="people-outline" size={24} color={COLORS.primaryLight} />
                <Text style={styles.adminTileText}>Users</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminTile}
                onPress={() => navigation.navigate("Reports")}
              >
                <Ionicons name="bar-chart-outline" size={24} color={COLORS.primaryLight} />
                <Text style={styles.adminTileText}>Reports</Text>
              </TouchableOpacity>
            </View>
          </>
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
    fontSize: 14,
  },
  welcomeName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginVertical: 2,
  },
  welcomeRole: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "600",
  },
  welcomeIconBadge: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: SPACING.md,
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
  actionBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  adminGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: SPACING.lg,
  },
  adminTile: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  adminTileText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
});
