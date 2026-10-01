import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { complaintService, userService } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { StatusBadge } from "../../components/StatusBadge";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";

export const ComplaintsDashboardScreen = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, usersRes] = await Promise.all([
        complaintService.getAll(),
        userService.getAll({ role: "Staff" }).catch(() => ({ data: [] })),
      ]);
      setComplaints(compRes.data?.complaints || compRes.data || []);
      setStaffList(usersRes.data?.users || usersRes.data || []);
    } catch (err) {
      console.warn("Failed to fetch complaints list", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      setUpdating(true);
      await complaintService.updateStatus(complaintId, newStatus);
      Alert.alert("Status Updated", `Complaint marked as ${newStatus.replace("_", " ")}`);
      fetchData();
      if (selectedComplaint) {
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async (complaintId, staffId) => {
    try {
      setUpdating(true);
      await complaintService.assign(complaintId, staffId);
      Alert.alert("Staff Assigned", "Staff member assigned successfully.");
      fetchData();
      if (selectedComplaint) {
        const assignedStaffObj = staffList.find((s) => s._id === staffId);
        setSelectedComplaint((prev) => ({ ...prev, assignedTo: assignedStaffObj }));
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to assign staff");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="All Complaints" />

      <View style={styles.container}>
        <CustomInput
          placeholder="Search by title, description or user..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search-outline" size={18} color={COLORS.textMuted} />}
          style={{ marginBottom: 10 }}
        />

        {/* Status Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          {["All", "Pending", "In_Progress", "Resolved", "Rejected"].map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                styles.filterPill,
                statusFilter === st && styles.activeFilterPill,
              ]}
              onPress={() => setStatusFilter(st)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  statusFilter === st && styles.activeFilterPillText,
                ]}
              >
                {st.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedComplaint(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <StatusBadge label={item.status} type="status" />
                <StatusBadge label={item.priority || "Medium"} type="priority" />
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardMeta}>
                <Text style={styles.metaLabel}>User: {item.user?.name || "Unknown"}</Text>
                <Text style={styles.metaLabel}>
                  Dept: {item.department?.name || "General"}
                </Text>
              </View>

              {item.assignedTo && (
                <View style={styles.assignedTag}>
                  <Ionicons name="person-circle-outline" size={14} color={COLORS.primaryLight} />
                  <Text style={styles.assignedText}>Assigned: {item.assignedTo.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No complaints match criteria</Text>
              </View>
            )
          }
        />
      </View>

      {/* Admin Action Modal */}
      <Modal
        visible={!!selectedComplaint}
        animationType="slide"
        onRequestClose={() => setSelectedComplaint(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <Header
            title="Manage Complaint"
            showBack
            onBack={() => setSelectedComplaint(null)}
          />
          {selectedComplaint && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.badgeRow}>
                <StatusBadge label={selectedComplaint.status} type="status" />
                <StatusBadge label={selectedComplaint.priority || "Medium"} type="priority" />
              </View>

              <Text style={styles.modalTitle}>{selectedComplaint.title}</Text>
              <Text style={styles.modalSub}>
                Filed by {selectedComplaint.user?.name} ({selectedComplaint.user?.email})
              </Text>

              <View style={styles.detailBox}>
                <Text style={styles.boxTitle}>Issue Description</Text>
                <Text style={styles.boxBody}>{selectedComplaint.description}</Text>
              </View>

              {/* Status Update Quick Actions */}
              <Text style={styles.actionHeader}>Change Status</Text>
              <View style={styles.statusActionRow}>
                {["Pending", "In_Progress", "Resolved", "Rejected"].map((st) => (
                  <TouchableOpacity
                    key={st}
                    disabled={updating}
                    style={[
                      styles.statusActionBtn,
                      selectedComplaint.status === st && styles.activeStatusBtn,
                    ]}
                    onPress={() => handleUpdateStatus(selectedComplaint._id, st)}
                  >
                    <Text
                      style={[
                        styles.statusActionText,
                        selectedComplaint.status === st && styles.activeStatusText,
                      ]}
                    >
                      {st.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Staff Assignment Options (If Admin / SuperAdmin) */}
              {(user?.role === "Admin" || user?.role === "SuperAdmin") && staffList.length > 0 && (
                <>
                  <Text style={styles.actionHeader}>Assign Staff</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.staffScroll}>
                    {staffList.map((stf) => (
                      <TouchableOpacity
                        key={stf._id}
                        disabled={updating}
                        style={[
                          styles.staffChip,
                          selectedComplaint.assignedTo?._id === stf._id && styles.activeStaffChip,
                        ]}
                        onPress={() => handleAssignStaff(selectedComplaint._id, stf._id)}
                      >
                        <Ionicons
                          name="person"
                          size={14}
                          color={
                            selectedComplaint.assignedTo?._id === stf._id
                              ? "#FFF"
                              : COLORS.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.staffChipText,
                            selectedComplaint.assignedTo?._id === stf._id &&
                              styles.activeStaffChipText,
                          ]}
                        >
                          {stf.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <CustomButton
                title="Done"
                variant="outline"
                onPress={() => setSelectedComplaint(null)}
                style={{ marginTop: SPACING.xl }}
              />
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  filterBar: {
    maxHeight: 40,
    marginBottom: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginRight: 8,
  },
  activeFilterPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  filterPillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  activeFilterPillText: {
    color: "#FFF",
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  assignedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  assignedText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  empty: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  modalSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  detailBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  boxTitle: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  boxBody: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  actionHeader: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  statusActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: SPACING.lg,
  },
  statusActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  activeStatusBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  statusActionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  activeStatusText: {
    color: "#FFF",
  },
  staffScroll: {
    flexDirection: "row",
  },
  staffChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeStaffChip: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  staffChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  activeStaffChipText: {
    color: "#FFF",
  },
});
