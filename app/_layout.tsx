import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../src/contexts/AuthContext";
import { AppThemeProvider } from "../src/contexts/ThemeContext";
import { useColorModeValue } from "native-base";

const RootNavigator = () => {
  const headerBg = useColorModeValue("#f4f7fb", "#06090f");
  const headerText = useColorModeValue("#11161d", "#e4ebf5");

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerText,
        headerTitleStyle: { color: headerText },
        contentStyle: { backgroundColor: headerBg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="post/[id]"
        options={{ title: "Post details", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="post/[id]/edit"
        options={{ title: "Edit post", presentation: "modal" }}
      />
      <Stack.Screen
        name="post/create"
        options={{ title: "New tutorial", presentation: "modal" }}
      />
      <Stack.Screen
        name="auth/login"
        options={{ title: "Sign in", presentation: "modal" }}
      />
      <Stack.Screen
        name="auth/register"
        options={{ title: "Create account", presentation: "modal" }}
      />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </AuthProvider>
  );
};

export default RootLayout;
