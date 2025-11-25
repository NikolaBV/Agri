import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import {
  Button,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";

const LoginScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch (err) {
      console.warn(err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, padding: 24 }}
    >
      <View style={{ flex: 1, gap: 16, justifyContent: "center" }}>
        <Text variant="headlineMedium" style={{ color: colors.onSurface }}>
          Welcome back
        </Text>
        {error && <Text style={{ color: colors.error }}>{error}</Text>}
        <TextInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
        />
        <TextInput
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={loading || !email || !password}
        >
          Sign in
        </Button>
        <Button onPress={() => router.push("/auth/register")}>
          Create an account
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

