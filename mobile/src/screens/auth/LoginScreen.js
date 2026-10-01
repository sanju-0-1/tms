import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../theme/theme";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";

export const LoginScreen = () => {
  const { login, serverUrl, updateServerUrl } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showConfig, setShowConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(serverUrl);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  const handleSaveUrl = () => {
    if (tempUrl) {
      updateServerUrl(tempUrl);
      setShowConfig(false);
      Alert.alert("Server Configured", `API URL set to: ${tempUrl}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={40} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.appTitle}>TMS Complaint Portal</Text>
            <Text style={styles.subTitle}>Ticket & Facility Management System</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorBoxText}>{errorMsg}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Email Address"
              placeholder="user@tms.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />}
            />

            <CustomInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />}
            />

            <CustomButton
              title="Sign In to Account"
              onPress={handleLogin}
              loading={loading}
              size="large"
              style={styles.loginBtn}
            />

            <TouchableOpacity
              style={styles.configBtn}
              onPress={() => {
                setTempUrl(serverUrl);
                setShowConfig(true);
              }}
            >
              <Ionicons name="settings-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.configBtnText}>Configure Backend URL</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={showConfig} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Configure API Server</Text>
                <Text style={styles.modalSub}>
                  Default for Android Emulator is http://10.0.2.2:5000/api. For physical device, enter your computer's Wi-Fi IP address.
                </Text>
                <CustomInput
                  label="API Base URL"
                  value={tempUrl}
                  onChangeText={setTempUrl}
                  placeholder="http://192.168.1.10:5000/api"
                />
                <View style={styles.modalActions}>
                  <CustomButton
                    title="Cancel"
                    variant="outline"
                    onPress={() => setShowConfig(false)}
                    style={{ flex: 1 }}
                  />
                  <CustomButton title="Save" onPress={handleSaveUrl} style={{ flex: 1 }} />
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.large,
  },
  appTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: SPACING.lg,
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
  loginBtn: {
    marginTop: SPACING.md,
  },
  configBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
    paddingVertical: 8,
  },
  configBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  modalSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: SPACING.md,
  },
});
