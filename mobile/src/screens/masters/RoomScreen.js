import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { roomService, blockService } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Ionicons } from "@expo/vector-icons";

export const RoomScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [blockId, setBlockId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, blockRes] = await Promise.all([
        roomService.getAll(),
        blockService.getAll(),
      ]);
      setRooms(roomRes.data?.rooms || roomRes.data || []);
      setBlocks(blockRes.data?.blocks || blockRes.data || []);
    } catch (err) {
      console.warn("Failed to fetch rooms", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setRoomNumber("");
    setFloor("");
    setBlockId("");
    setModalVisible(true);
  };

  const handleOpenEdit = (r) => {
    setEditingItem(r);
    setRoomNumber(r.roomNumber || r.name || "");
    setFloor(r.floor ? String(r.floor) : "");
    setBlockId(r.block?._id || r.block || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!roomNumber.trim()) {
      Alert.alert("Required Field", "Room number is required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { roomNumber, floor };
      if (blockId) payload.block = blockId;

      if (editingItem) {
        await roomService.update(editingItem._id, payload);
      } else {
        await roomService.create(payload);
      }
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await roomService.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Room Master"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <FlatList
          data={rooms}
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
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>Room {item.roomNumber || item.name}</Text>
                {item.floor !== undefined ? (
                  <Text style={styles.cardFloor}>Floor: {item.floor}</Text>
                ) : null}
                {item.block ? (
                  <Text style={styles.cardBlock}>Block: {item.block?.name || "N/A"}</Text>
                ) : null}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.iconAction} onPress={() => handleOpenEdit(item)}>
                  <Ionicons name="create-outline" size={20} color={COLORS.primaryLight} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconAction} onPress={() => setDeleteTarget(item)}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No Rooms configured.</Text>
              </View>
            )
          }
        />
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          <Header
            title={editingItem ? "Edit Room" : "Add Room"}
            showBack
            onBack={() => setModalVisible(false)}
          />
          <ScrollView contentContainerStyle={styles.modalBody}>
            <CustomInput label="Room Number *" value={roomNumber} onChangeText={setRoomNumber} />
            <CustomInput label="Floor" value={floor} onChangeText={setFloor} keyboardType="numeric" />

            {blocks.length > 0 && (
              <>
                <Text style={styles.selectLabel}>Select Block</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {blocks.map((b) => (
                    <TouchableOpacity
                      key={b._id}
                      style={[styles.chip, blockId === b._id && styles.activeChip]}
                      onPress={() => setBlockId(blockId === b._id ? "" : b._id)}
                    >
                      <Text style={[styles.chipText, blockId === b._id && styles.activeChipText]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <CustomButton
              title={editingItem ? "Update Room" : "Create Room"}
              onPress={handleSave}
              loading={submitting}
              size="large"
              style={{ marginTop: SPACING.lg }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Room"
        message={`Delete room ${deleteTarget?.roomNumber || deleteTarget?.name}?`}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  container: { flex: 1, padding: SPACING.md },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOWS.small,
  },
  cardContent: { flex: 1, marginRight: 10 },
  cardName: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  cardFloor: { color: COLORS.primaryLight, fontSize: 13, marginTop: 2 },
  cardBlock: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 12 },
  iconAction: { padding: 6 },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  modalSafeArea: { flex: 1, backgroundColor: COLORS.background },
  modalBody: { padding: SPACING.lg },
  selectLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: SPACING.md,
    marginBottom: 8,
  },
  chipScroll: { flexDirection: "row" },
  chip: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryLight },
  chipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  activeChipText: { color: "#FFF" },
});
