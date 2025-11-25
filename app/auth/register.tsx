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

const RegisterScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      setLoading(true);
      await register({
        email: email.trim(),
        password,
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        bio: bio.trim(),
      });
      router.replace("/(tabs)");
    } catch (err) {
      console.warn(err);
      setError("Unable to create account. Please try again.");
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
          Join Agri
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
          label="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
        />
        <TextInput
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          mode="outlined"
        />
        <TextInput
          label="Short bio"
          value={bio}
          onChangeText={setBio}
          mode="outlined"
          multiline
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
          disabled={
            loading || !email.trim() || !password || !username.trim()
          }
        >
          Create account
        </Button>
        <Button onPress={() => router.push("/auth/login")}>
          Already have an account?
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

