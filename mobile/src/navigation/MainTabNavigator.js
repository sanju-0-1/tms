import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/AuthContext";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { UserComplaintDashboardScreen } from "../screens/complaints/UserComplaintDashboardScreen";
import { ComplaintsDashboardScreen } from "../screens/complaints/ComplaintsDashboardScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { COLORS } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { user } = useContext(AuthContext);
  const canManageAll = user?.role === "Staff" || user?.role === "Admin" || user?.role === "SuperAdmin";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.cardBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "DashboardTab") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "MyComplaintsTab") {
            iconName = focused ? "ticket" : "ticket-outline";
          } else if (route.name === "AllComplaintsTab") {
            iconName = focused ? "albums" : "albums-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="MyComplaintsTab"
        component={UserComplaintDashboardScreen}
        options={{ tabBarLabel: "My Tickets" }}
      />
      {canManageAll && (
        <Tab.Screen
          name="AllComplaintsTab"
          component={ComplaintsDashboardScreen}
          options={{ tabBarLabel: "All Tickets" }}
        />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};
