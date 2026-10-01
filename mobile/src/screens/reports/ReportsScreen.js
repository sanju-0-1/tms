import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { complaintService } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { StatCard } from "../../components/StatCard";
import { Ionicons } from "@expo/vector-icons";

export const ReportsScreen = ({ navigation }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await complaintService.report();
      setReportData(res.data);
    } catch (err) {
      console.warn("Failed to load reports data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Analytics & Reports" showBack onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReports();
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={styles.sectionHeader}>Overview Metrics</Text>

        <View style={styles.statsContainer}>
          <StatCard
            title="Total Tickets Handled"
            value={reportData?.summary?.total || 0}
            color={COLORS.primary}
            icon={<Ionicons name="bar-chart-outline" size={22} color={COLORS.primary} />}
          />
          <StatCard
            title="Pending Resolution"
            value={reportData?.summary?.pending || 0}
            color={COLORS.warning}
            icon={<Ionicons name="time-outline" size={22} color={COLORS.warning} />}
          />
          <StatCard
            title="In Progress"
            value={reportData?.summary?.inProgress || 0}
            color={COLORS.info}
            icon={<Ionicons name="construct-outline" size={22} color={COLORS.info} />}
          />
          <StatCard
            title="Successfully Resolved"
            value={reportData?.summary?.resolved || 0}
            color={COLORS.success}
            icon={<Ionicons name="checkmark-done-circle-outline" size={22} color={COLORS.success} />}
          />
        </View>

        {/* Breakdown by Department */}
        {reportData?.byDepartment && reportData.byDepartment.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Complaints by Department</Text>
            {reportData.byDepartment.map((item, index) => (
              <View key={index} style={styles.breakdownCard}>
                <Text style={styles.deptName}>{item.departmentName || "General"}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{item.count} complaints</Text>
                </View>
              </View>
            ))}
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
  sectionHeader: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  breakdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOWS.small,
  },
  deptName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  countBadge: {
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "700",
  },
});
