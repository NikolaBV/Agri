import {
  DarkTheme as NavigationDarkTheme,
  ThemeProvider as NavigationThemeProvider,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { MD3DarkTheme, PaperProvider } from "react-native-paper";

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
    <PaperProvider theme={paperTheme}>
      <NavigationThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </NavigationThemeProvider>
    </PaperProvider>
  );
};

export default RootLayout;
