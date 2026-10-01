import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { COLORS, RADIUS, SPACING } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { getBaseUrl } from "../services/api";

export const Header = ({ title, showBack = false, onBack, rightAction }) => {
  const { user } = useContext(AuthContext);

  const getProfileImage = () => {
    if (user?.profilePicture) {
      const baseUrl = getBaseUrl().replace("/api", "");
      return { uri: `${baseUrl}${user.profilePicture}` };
    }
    return null;
  };

  const profileImg = getProfileImage();

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightAction}
        {user && !rightAction && (
          <View style={styles.userInfo}>
            <View style={styles.textStack}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.userRole}>{user.role}</Text>
            </View>
            <View style={styles.avatar}>
              {profileImg ? (
                <Image source={profileImg} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBtn: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  textStack: {
    alignItems: "flex-end",
    marginRight: 10,
  },
  userName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  userRole: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: "500",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 34,
    height: 34,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
