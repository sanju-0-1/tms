import React, { useContext } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../theme/theme";

import { LoginScreen } from "../screens/auth/LoginScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import { ComplaintFormScreen } from "../screens/complaints/ComplaintFormScreen";
import { DepartmentScreen } from "../screens/masters/DepartmentScreen";
import { ProgrammeScreen } from "../screens/masters/ProgrammeScreen";
import { BlockScreen } from "../screens/masters/BlockScreen";
import { RoomScreen } from "../screens/masters/RoomScreen";
import { RoleScreen } from "../screens/masters/RoleScreen";
import { UserScreen } from "../screens/masters/UserScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="NewComplaint" component={ComplaintFormScreen} />
            <Stack.Screen name="MyComplaints" component={MainTabNavigator} />
            <Stack.Screen name="Departments" component={DepartmentScreen} />
            <Stack.Screen name="Programmes" component={ProgrammeScreen} />
            <Stack.Screen name="Blocks" component={BlockScreen} />
            <Stack.Screen name="Rooms" component={RoomScreen} />
            <Stack.Screen name="Roles" component={RoleScreen} />
            <Stack.Screen name="Users" component={UserScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
