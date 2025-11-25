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
  TextArea,
  VStack,
  useColorModeValue,
} from "native-base";
import { useAuth } from "../../src/contexts/AuthContext";

const RegisterScreen = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const background = useColorModeValue("brand.lightBg", "brand.darkBg");
  const cardBg = useColorModeValue("brand.lightCard", "brand.darkCard");
  const headingColor = useColorModeValue("muted.900", "muted.100");

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
        >
          <Heading size="lg" color={headingColor}>
            Join Agri
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
            placeholder="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            bg={cardBg}
          />
          <Input
            placeholder="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            bg={cardBg}
          />
          <TextArea
            placeholder="Short bio"
            value={bio}
            onChangeText={setBio}
            bg={cardBg}
            h="24"
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
            isDisabled={!email.trim() || !password || !username.trim()}
            isLoading={loading}
          >
            Create account
          </Button>
          <Button
            variant="ghost"
            colorScheme="primary"
            onPress={() => router.push("/auth/login")}
          >
            Already have an account?
          </Button>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

