import {
  DarkTheme as NavigationDarkTheme,
  ThemeProvider as NavigationThemeProvider,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { MD3DarkTheme, PaperProvider } from "react-native-paper";
import { AuthProvider } from "../src/contexts/AuthContext";

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "white",
    secondary: "#1C1C1C",
    background: "#636e72",
    onSurface: "#f5f6fa",
  },
};

const navigationTheme: NavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: paperTheme.colors.primary,
    background: paperTheme.colors.background,
    card: paperTheme.colors.surface,
    border: paperTheme.colors.outline,
    text: paperTheme.colors.onSurface,
  },
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navigationTheme}>
          <Stack>
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
              name="auth/login"
              options={{ title: "Sign in", presentation: "modal" }}
            />
            <Stack.Screen
              name="auth/register"
              options={{ title: "Create account", presentation: "modal" }}
            />
          </Stack>
        </NavigationThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
};

export default RootLayout;
