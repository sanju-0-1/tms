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
import { programmeService, departmentService } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Ionicons } from "@expo/vector-icons";

export const ProgrammeScreen = ({ navigation }) => {
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [deptId, setDeptId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, deptRes] = await Promise.all([
        programmeService.getAll(),
        departmentService.getAll(),
      ]);
      setProgrammes(progRes.data?.programmes || progRes.data || []);
      setDepartments(deptRes.data?.departments || deptRes.data || []);
    } catch (err) {
      console.warn("Failed to fetch programmes", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName("");
    setCode("");
    setDeptId("");
    setModalVisible(true);
  };

  const handleOpenEdit = (p) => {
    setEditingItem(p);
    setName(p.name);
    setCode(p.code || "");
    setDeptId(p.department?._id || p.department || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required Field", "Programme name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { name, code };
      if (deptId) payload.department = deptId;

      if (editingItem) {
        await programmeService.update(editingItem._id, payload);
      } else {
        await programmeService.create(payload);
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
      await programmeService.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to delete programme");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Programme Master"
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
          data={programmes}
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
                <Text style={styles.cardName}>{item.name}</Text>
                {item.code ? <Text style={styles.cardCode}>Code: {item.code}</Text> : null}
                {item.department ? (
                  <Text style={styles.cardDept}>Dept: {item.department?.name || "N/A"}</Text>
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
                <Text style={styles.emptyText}>No Programmes found.</Text>
              </View>
            )
          }
        />
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingItem ? "Edit Programme" : "Add Programme"}</Text>

            <CustomInput label="Programme Name *" value={name} onChangeText={setName} />
            <CustomInput label="Programme Code" value={code} onChangeText={setCode} />

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
        title="Delete Programme"
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
  cardDept: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
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
