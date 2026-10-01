import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { blockService } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Ionicons } from "@expo/vector-icons";

export const BlockScreen = ({ navigation }) => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await blockService.getAll();
      setBlocks(res.data?.blocks || res.data || []);
    } catch (err) {
      console.warn("Failed to fetch blocks", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName("");
    setCode("");
    setDescription("");
    setModalVisible(true);
  };

  const handleOpenEdit = (b) => {
    setEditingItem(b);
    setName(b.name);
    setCode(b.code || "");
    setDescription(b.description || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required Field", "Block name is required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        await blockService.update(editingItem._id, { name, code, description });
      } else {
        await blockService.create({ name, code, description });
      }
      setModalVisible(false);
      fetchBlocks();
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
      await blockService.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchBlocks();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to delete block");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Block Master"
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
          data={blocks}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBlocks();
              }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.code ? <Text style={styles.cardCode}>Code: {item.code}</Text> : null}
                <Text style={styles.cardDesc}>{item.description || "No details."}</Text>
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
                <Text style={styles.emptyText}>No Blocks configured.</Text>
              </View>
            )
          }
        />
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingItem ? "Edit Block" : "Add Block"}</Text>

            <CustomInput label="Block Name *" value={name} onChangeText={setName} />
            <CustomInput label="Block Code" value={code} onChangeText={setCode} />
            <CustomInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <CustomButton
                title={editingItem ? "Update" : "Create"}
                onPress={handleSave}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Block"
        message={`Delete ${deleteTarget?.name}?`}
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
  cardCode: { color: COLORS.primaryLight, fontSize: 13, marginTop: 2 },
  cardDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 12 },
  iconAction: { padding: 6 },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginBottom: SPACING.md },
  modalActions: { flexDirection: "row", gap: 12, marginTop: SPACING.md },
});
