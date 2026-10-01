import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  departmentService,
  blockService,
  roomService,
  complaintService,
} from "../../services/api";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { Header } from "../../components/Header";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";

export const ComplaintFormScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [departmentId, setDepartmentId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [imageUri, setImageUri] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (blockId) {
      fetchRooms(blockId);
    } else {
      setRooms([]);
      setRoomId("");
    }
  }, [blockId]);

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      const [deptRes, blockRes] = await Promise.all([
        departmentService.getAll(),
        blockService.getAll(),
      ]);
      setDepartments(deptRes.data?.departments || deptRes.data || []);
      setBlocks(blockRes.data?.blocks || blockRes.data || []);
    } catch (err) {
      console.warn("Failed to load department or block options", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (bId) => {
    try {
      const roomRes = await roomService.getAll({ blockId: bId });
      setRooms(roomRes.data?.rooms || roomRes.data || []);
    } catch (err) {
      console.warn("Failed to load rooms", err);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access photo library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !departmentId) {
      setErrorMsg("Please fill in required fields (Title, Description, Department)");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("department", departmentId);
      formData.append("priority", priority);

      if (blockId) formData.append("block", blockId);
      if (roomId) formData.append("room", roomId);

      if (imageUri) {
        const filename = imageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append("attachment", {
          uri: imageUri,
          name: filename,
          type,
        });
      }

      await complaintService.create(formData);
      Alert.alert("Success", "Complaint submitted successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("MyComplaints"),
        },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to submit complaint. Please check fields.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Lodge New Complaint" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.formCard}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorBoxText}>{errorMsg}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Complaint Title *"
              placeholder="e.g. Projector Not Working in Room 102"
              value={title}
              onChangeText={setTitle}
            />

            <CustomInput
              label="Detailed Description *"
              placeholder="Provide complete details about the issue..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            {/* Department Selector */}
            <Text style={styles.selectLabel}>Select Department *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept._id}
                  style={[
                    styles.chip,
                    departmentId === dept._id && styles.activeChip,
                  ]}
                  onPress={() => setDepartmentId(dept._id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      departmentId === dept._id && styles.activeChipText,
                    ]}
                  >
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Block Selector */}
            {blocks.length > 0 && (
              <>
                <Text style={styles.selectLabel}>Select Block (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {blocks.map((b) => (
                    <TouchableOpacity
                      key={b._id}
                      style={[
                        styles.chip,
                        blockId === b._id && styles.activeChip,
                      ]}
                      onPress={() => setBlockId(blockId === b._id ? "" : b._id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          blockId === b._id && styles.activeChipText,
                        ]}
                      >
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Room Selector */}
            {rooms.length > 0 && (
              <>
                <Text style={styles.selectLabel}>Select Room (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {rooms.map((r) => (
                    <TouchableOpacity
                      key={r._id}
                      style={[
                        styles.chip,
                        roomId === r._id && styles.activeChip,
                      ]}
                      onPress={() => setRoomId(roomId === r._id ? "" : r._id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          roomId === r._id && styles.activeChipText,
                        ]}
                      >
                        {r.roomNumber || r.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Priority Selector */}
            <Text style={styles.selectLabel}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {["Low", "Medium", "High", "Urgent"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    priority === p && styles.activePriorityBtn,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p && styles.activePriorityText,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Attachment Image Picker */}
            <Text style={styles.selectLabel}>Photo Attachment</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={24} color={COLORS.primaryLight} />
              <Text style={styles.imagePickerText}>
                {imageUri ? "Change Attached Photo" : "Upload Supporting Image"}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <View style={styles.previewBox}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={() => setImageUri(null)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            )}

            <CustomButton
              title="Submit Complaint"
              onPress={handleSubmit}
              loading={submitting}
              size="large"
              style={{ marginTop: SPACING.lg }}
            />
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
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerLight,
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: SPACING.md,
  },
  errorBoxText: {
    color: COLORS.danger,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  selectLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: SPACING.md,
    marginBottom: 8,
  },
  chipScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  chip: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  activeChipText: {
    color: "#FFF",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    alignItems: "center",
  },
  activePriorityBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  priorityText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  activePriorityText: {
    color: "#FFF",
  },
  imagePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: "dashed",
    padding: SPACING.md,
  },
  imagePickerText: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  previewBox: {
    marginTop: 12,
    alignItems: "center",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: RADIUS.md,
  },
  removeImgBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: RADIUS.full,
  },
});
