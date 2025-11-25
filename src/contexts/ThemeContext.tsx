import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  Theme as NavigationTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import {
  NativeBaseProvider,
  StorageManager,
  extendTheme,
  useColorMode,
} from "native-base";
import React, { createContext, useContext, useMemo } from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  colorMode: ThemeMode;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const lightPalette = {
  background: "#f4f7fb",
  card: "#ffffff",
  text: "#11161d",
  border: "#d6dde7",
  primary: "#2f8f83",
};

const darkPalette = {
  background: "#06090f",
  card: "#111923",
  text: "#e4ebf5",
  border: "#1f2834",
  primary: "#4ad7c1",
};

const colorModeManager: StorageManager = {
  get: async () => {
    try {
      const value = await SecureStore.getItemAsync("agri_theme_mode");
      if (value === "light" || value === "dark") {
        return value;
      }
      return "dark";
    } catch {
      return "dark";
    }
  },
  set: async (value) => {
    try {
      if (value) {
        await SecureStore.setItemAsync("agri_theme_mode", value);
      }
    } catch {
      // no-op
    }
  },
};

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      lightBg: lightPalette.background,
      darkBg: darkPalette.background,
      lightCard: lightPalette.card,
      darkCard: darkPalette.card,
      accent: "#f7b267",
    },
    primary: {
      50: "#e3fff6",
      100: "#c0f6e4",
      200: "#9bead3",
      300: "#74dcc3",
      400: "#4dceb3",
      500: "#2f8f83",
      600: "#25746a",
      700: "#1c5951",
      800: "#123d38",
      900: "#092220",
    },
    muted: {
      100: "#f3f5f7",
      200: "#e1e6ed",
      300: "#c8d0da",
      400: "#aab4c3",
      500: "#8c96a7",
      600: "#6d7788",
      700: "#4d5869",
      800: "#303949",
      900: "#1b1f2b",
    },
  },
  components: {
    Button: {
      defaultProps: {
        size: "md",
        rounded: "xl",
      },
    },
    Input: {
      defaultProps: {
        variant: "filled",
        rounded: "xl",
      },
    },
    TextArea: {
      defaultProps: {
        variant: "filled",
        rounded: "xl",
      },
    },
    Badge: {
      defaultProps: {
        rounded: "full",
      },
    },
  },
});

const ThemeBridge = ({ children }: { children: React.ReactNode }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const navTheme = useMemo<NavigationTheme>(() => {
    const palette = colorMode === "dark" ? darkPalette : lightPalette;
    const base = colorMode === "dark" ? NavigationDarkTheme : NavigationLightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: palette.background,
        card: palette.card,
        text: palette.text,
        border: palette.border,
        primary: palette.primary,
      },
    };
  }, [colorMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorMode: colorMode as ThemeMode,
      isDarkMode: colorMode === "dark",
      toggleTheme: toggleColorMode,
    }),
    [colorMode, toggleColorMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navTheme}>{children}</NavigationThemeProvider>
    </ThemeContext.Provider>
  );
};

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider theme={theme} colorModeManager={colorModeManager}>
    <ThemeBridge>{children}</ThemeBridge>
  </NativeBaseProvider>
);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within AppThemeProvider");
  }
  return context;
};


