import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../context/AuthContext";
import { profileService, getBaseUrl } from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Ionicons } from "@expo/vector-icons";

export const ProfileScreen = () => {
  const { user, logout, refreshProfile, serverUrl, updateServerUrl } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: "", text: "" });

  const [uploading, setUploading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [customServerUrl, setCustomServerUrl] = useState(serverUrl);
  const [editingUrl, setEditingUrl] = useState(false);

  const getProfileImage = () => {
    if (user?.profilePicture) {
      const baseUrl = getBaseUrl().replace("/api", "");
      return { uri: `${baseUrl}${user.profilePicture}` };
    }
    return null;
  };

  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera roll permission is required to select photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      setUploading(true);
      const formData = new FormData();
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("profilePicture", {
        uri,
        name: filename,
        type,
      });

      await profileService.updateProfile(formData);
      await refreshProfile();
      Alert.alert("Success", "Profile photo updated successfully!");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update profile photo");
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassMessage({ type: "error", text: "All password fields are required." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    try {
      setPassLoading(true);
      setPassMessage({ type: "", text: "" });
      await profileService.changePassword(currentPassword, newPassword);
      setPassMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setPassLoading(false);
    }
  };

  const handleSaveServerUrl = () => {
    if (customServerUrl) {
      updateServerUrl(customServerUrl);
      setEditingUrl(false);
      Alert.alert("Saved", "Backend API URL updated.");
    }
  };

  const profileImg = getProfileImage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Profile" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {profileImg ? (
                <Image source={profileImg} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitials}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.cameraBadge} onPress={handlePickAvatar} disabled={uploading}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.nameText}>{user?.name}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user?.role}</Text>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{user?.department?.name || "General"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role Permissions</Text>
            <Text style={styles.infoValue}>{user?.role || "User"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{user?._id || "-"}</Text>
          </View>
        </View>

        {/* Change Password */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Change Security Password</Text>

          {passMessage.text ? (
            <View
              style={[
                styles.msgBox,
                passMessage.type === "error" ? styles.errorMsgBox : styles.successMsgBox,
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  passMessage.type === "error" ? styles.errorMsgText : styles.successMsgText,
                ]}
              >
                {passMessage.text}
              </Text>
            </View>
          ) : null}

          <CustomInput
            label="Current Password"
            placeholder="••••••••"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <CustomInput
            label="New Password"
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <CustomInput
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <CustomButton
            title="Update Password"
            onPress={handleChangePassword}
            loading={passLoading}
          />
        </View>

        {/* Server Config */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Backend Connection Config</Text>
          <Text style={styles.serverSub}>
            Current Target API: {serverUrl}
          </Text>

          {editingUrl ? (
            <View style={{ marginTop: 8 }}>
              <CustomInput
                label="API Base URL"
                value={customServerUrl}
                onChangeText={setCustomServerUrl}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <CustomButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => setEditingUrl(false)}
                  style={{ flex: 1 }}
                />
                <CustomButton
                  title="Save URL"
                  onPress={handleSaveServerUrl}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <CustomButton
              title="Change API Server URL"
              variant="outline"
              onPress={() => setEditingUrl(true)}
              style={{ marginTop: 8 }}
            />
          )}
        </View>

        {/* Logout */}
        <CustomButton
          title="Sign Out of App"
          variant="danger"
          size="large"
          onPress={() => setShowLogoutModal(true)}
          style={{ marginBottom: SPACING.xl }}
        />

        <ConfirmModal
          visible={showLogoutModal}
          title="Sign Out"
          message="Are you sure you want to log out of your session?"
          confirmText="Sign Out"
          danger
          onConfirm={() => {
            setShowLogoutModal(false);
            logout();
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
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
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 90,
    height: 90,
  },
  avatarInitials: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "800",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primaryDark,
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  nameText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  emailText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.primaryLight + "20",
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: SPACING.sm,
  },
  roleBadgeText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  msgBox: {
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 12,
  },
  errorMsgBox: {
    backgroundColor: COLORS.dangerLight,
  },
  successMsgBox: {
    backgroundColor: COLORS.successLight,
  },
  msgText: {
    fontSize: 13,
  },
  errorMsgText: {
    color: COLORS.danger,
  },
  successMsgText: {
    color: COLORS.success,
  },
  serverSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
});
