import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { complaintService, getBaseUrl } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { StatusBadge } from "../../components/StatusBadge";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";

export const UserComplaintDashboardScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const list = res.data?.complaints || res.data || [];
      setComplaints(list);
    } catch (err) {
      console.warn("Failed to load user complaints", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getAttachmentUrl = (path) => {
    if (!path) return null;
    const baseUrl = getBaseUrl().replace("/api", "");
    return `${baseUrl}${path}`;
  };

  const renderComplaintItem = ({ item }) => (
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

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <Ionicons name="business-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>
            {item.department?.name || "General"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="My Complaints"
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => navigation.navigate("NewComplaint")}
          >
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Search Input */}
        <CustomInput
          placeholder="Search my complaints..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search-outline" size={18} color={COLORS.textMuted} />}
          style={{ marginBottom: 10 }}
        />

        {/* Filter Pills */}
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

        {/* Complaints List */}
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item._id}
          renderItem={renderComplaintItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMyComplaints();
              }}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={54} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Complaints Found</Text>
                <Text style={styles.emptySub}>
                  Lodge a new complaint ticket if you encounter any issue.
                </Text>
              </View>
            )
          }
        />
      </View>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedComplaint}
        animationType="slide"
        onRequestClose={() => setSelectedComplaint(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <Header
            title="Complaint Details"
            showBack
            onBack={() => setSelectedComplaint(null)}
          />
          {selectedComplaint && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.detailBadgeRow}>
                <StatusBadge label={selectedComplaint.status} type="status" />
                <StatusBadge label={selectedComplaint.priority || "Medium"} type="priority" />
              </View>

              <Text style={styles.detailTitle}>{selectedComplaint.title}</Text>
              <Text style={styles.detailDate}>
                Filed on {new Date(selectedComplaint.createdAt).toLocaleString()}
              </Text>

              <View style={styles.detailSection}>
                <Text style={styles.sectionLabel}>Description</Text>
                <Text style={styles.sectionBody}>{selectedComplaint.description}</Text>
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Department</Text>
                  <Text style={styles.gridValue}>
                    {selectedComplaint.department?.name || "N/A"}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Block / Location</Text>
                  <Text style={styles.gridValue}>
                    {selectedComplaint.block?.name || "N/A"}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Room</Text>
                  <Text style={styles.gridValue}>
                    {selectedComplaint.room?.roomNumber || "N/A"}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Assigned Staff</Text>
                  <Text style={styles.gridValue}>
                    {selectedComplaint.assignedTo?.name || "Unassigned"}
                  </Text>
                </View>
              </View>

              {selectedComplaint.attachment && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Attached Image</Text>
                  <Image
                    source={{ uri: getAttachmentUrl(selectedComplaint.attachment) }}
                    style={styles.attachmentImg}
                    resizeMode="cover"
                  />
                </View>
              )}

              <CustomButton
                title="Close View"
                variant="outline"
                onPress={() => setSelectedComplaint(null)}
                style={{ marginTop: SPACING.lg }}
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
  headerAddBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    justifyContent: "center",
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
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  detailBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.md,
  },
  detailTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  detailDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.lg,
  },
  detailSection: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionBody: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: SPACING.md,
  },
  gridItem: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
  },
  gridLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  gridValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  attachmentImg: {
    width: "100%",
    height: 220,
    borderRadius: RADIUS.md,
    marginTop: 6,
  },
});
