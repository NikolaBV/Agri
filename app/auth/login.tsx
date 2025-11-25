import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";
import {
  Button,
  Heading,
  Input,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  VStack,
  useColorModeValue,
} from "native-base";
import { useAuth } from "../../src/contexts/AuthContext";

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const background = useColorModeValue("brand.lightBg", "brand.darkBg");
  const cardBg = useColorModeValue("brand.lightCard", "brand.darkCard");
  const headingColor = useColorModeValue("muted.900", "muted.100");

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
      flex={1}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        flex={1}
        bg={background}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <VStack
          flex={1}
          space="4"
          px="6"
          py="8"
          justifyContent="center"
          bg={background}
        >
          <Heading size="lg" color={headingColor}>
            Welcome back
          </Heading>
          {error && (
            <Text color="error.400" fontSize="sm">
              {error}
            </Text>
          )}
          <Input
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            bg={cardBg}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChangeText={setPassword}
            bg={cardBg}
          />
          <Button
            colorScheme="primary"
            onPress={handleSubmit}
            isDisabled={!email.trim() || !password}
            isLoading={loading}
          >
            Sign in
          </Button>
          <Button
            variant="ghost"
            colorScheme="primary"
            onPress={() => router.push("/auth/register")}
          >
            Create an account
          </Button>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

