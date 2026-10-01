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
import { userService, departmentService } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Ionicons } from "@expo/vector-icons";

export const UserScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [deptId, setDeptId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsersAndDepts();
  }, []);

  const fetchUsersAndDepts = async () => {
    try {
      setLoading(true);
      const [userRes, deptRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
      ]);
      setUsers(userRes.data?.users || userRes.data || []);
      setDepartments(deptRes.data?.departments || deptRes.data || []);
    } catch (err) {
      console.warn("Failed to fetch users", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("User");
    setDeptId("");
    setModalVisible(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role || "User");
    setDeptId(u.department?._id || u.department || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Required Fields", "Name and email are required.");
      return;
    }

    if (!editingUser && !password) {
      Alert.alert("Required Field", "Password is required for new user creation.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        email,
        role,
      };
      if (password) payload.password = password;
      if (deptId) payload.department = deptId;

      if (editingUser) {
        await userService.update(editingUser._id, payload);
      } else {
        await userService.create(payload);
      }
      setModalVisible(false);
      fetchUsersAndDepts();
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
      await userService.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchUsersAndDepts();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="User Management"
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
          data={users}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchUsersAndDepts();
              }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <View style={styles.roleChip}>
                    <Text style={styles.roleChipText}>{item.role}</Text>
                  </View>
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
                {item.department && (
                  <Text style={styles.userDept}>
                    Dept: {item.department?.name || "General"}
                  </Text>
                )}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.iconAction}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Ionicons name="create-outline" size={20} color={COLORS.primaryLight} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconAction}
                  onPress={() => setDeleteTarget(item)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No Users found.</Text>
              </View>
            )
          }
        />
      </View>

      {/* User Create / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          <Header
            title={editingUser ? "Edit User" : "Create New User"}
            showBack
            onBack={() => setModalVisible(false)}
          />
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <CustomInput label="Full Name *" value={name} onChangeText={setName} />
            <CustomInput
              label="Email Address *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <CustomInput
              label={editingUser ? "New Password (Optional)" : "Password *"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.selectLabel}>User Role</Text>
            <View style={styles.roleGrid}>
              {["User", "Staff", "Admin", "SuperAdmin"].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, role === r && styles.activeRoleBtn]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleBtnText, role === r && styles.activeRoleBtnText]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {departments.length > 0 && (
              <>
                <Text style={styles.selectLabel}>Department</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptScroll}>
                  {departments.map((d) => (
                    <TouchableOpacity
                      key={d._id}
                      style={[styles.deptChip, deptId === d._id && styles.activeDeptChip]}
                      onPress={() => setDeptId(deptId === d._id ? "" : d._id)}
                    >
                      <Text style={[styles.deptChipText, deptId === d._id && styles.activeDeptChipText]}>
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <CustomButton
              title={editingUser ? "Save User Changes" : "Create User Account"}
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
        title="Delete User"
        message={`Delete user account for ${deleteTarget?.name}?`}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: SPACING.md,
  },
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
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  roleChip: {
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleChipText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: "700",
  },
  userEmail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  userDept: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  iconAction: {
    padding: 6,
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
  modalBody: {
    padding: SPACING.lg,
  },
  selectLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: SPACING.md,
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: "row",
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeRoleBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  roleBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  activeRoleBtnText: {
    color: "#FFF",
  },
  deptScroll: {
    flexDirection: "row",
  },
  deptChip: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeDeptChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  deptChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  activeDeptChipText: {
    color: "#FFF",
  },
});
