import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
  Text,
  TextArea,
  VStack,
  useColorModeValue,
} from "native-base";
import { Platform } from "react-native";
import agent from "../../src/api/agent";
import { useAuth } from "../../src/contexts/AuthContext";

type FormState = {
  title: string;
  summary: string;
  content: string;
  tags: string;
  isPublished: boolean;
};

const CreatePostScreen = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState<FormState>({
    title: "",
    summary: "",
    content: "",
    tags: "",
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const background = useColorModeValue("brand.lightBg", "brand.darkBg");
  const cardBg = useColorModeValue("brand.lightCard", "brand.darkCard");
  const headingColor = useColorModeValue("muted.900", "muted.100");
  const mutedColor = useColorModeValue("muted.600", "muted.300");
  const inputBorder = useColorModeValue("muted.300", "muted.600");

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      setError("Please enter a title for your tutorial.");
      return false;
    }
    if (!form.summary.trim()) {
      setError("Please add a brief summary.");
      return false;
    }
    if (!form.content.trim()) {
      setError("Please add some content to your tutorial.");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      const newPost = await agent.Posts.create({
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        isPublished: form.isPublished,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      router.replace(`/post/${newPost.id}`);
    } catch (err) {
      console.warn(err);
      setError("Unable to create tutorial right now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box flex={1} bg={background} alignItems="center" justifyContent="center" px="6">
        <VStack space="4" alignItems="center">
          <Heading size="md" color={headingColor} textAlign="center">
            Sign in to share your knowledge
          </Heading>
          <Text color={mutedColor} textAlign="center">
            Create an account or sign in to start publishing tutorials.
          </Text>
          <HStack space="3">
            <Button colorScheme="primary" onPress={() => router.push("/auth/login")}>
              Sign in
            </Button>
            <Button variant="outline" colorScheme="primary" onPress={() => router.push("/auth/register")}>
              Create account
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      bg={background}
    >
      <ScrollView flex={1} contentContainerStyle={{ padding: 24 }}>
        <VStack space="5">
          <VStack space="1">
            <Heading size="lg" color={headingColor}>
              Create tutorial
            </Heading>
            <Text color={mutedColor}>
              Share your farming knowledge with the community
            </Text>
          </VStack>

          {error && (
            <Box bg="error.100" borderRadius="lg" p="3" borderWidth="1" borderColor="error.300">
              <Text color="error.700" fontSize="sm">
                {error}
              </Text>
            </Box>
          )}

          <VStack space="4">
            <VStack space="1">
              <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                Title *
              </Text>
              <Input
                placeholder="e.g., How to Build a Raised Garden Bed"
                value={form.title}
                onChangeText={(text) => handleChange("title", text)}
                bg={cardBg}
                borderColor={inputBorder}
                fontSize="md"
                py="3"
              />
            </VStack>

            <VStack space="1">
              <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                Summary *
              </Text>
              <TextArea
                placeholder="A brief description of what readers will learn..."
                value={form.summary}
                onChangeText={(text) => handleChange("summary", text)}
                bg={cardBg}
                borderColor={inputBorder}
                fontSize="md"
                h="24"
                autoCompleteType={undefined}
              />
            </VStack>

            <VStack space="1">
              <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                Content *
              </Text>
              <TextArea
                placeholder="Write your tutorial here. Include step-by-step instructions, tips, and any helpful details..."
                value={form.content}
                onChangeText={(text) => handleChange("content", text)}
                bg={cardBg}
                borderColor={inputBorder}
                fontSize="md"
                h="48"
                autoCompleteType={undefined}
              />
            </VStack>

            <VStack space="1">
              <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                Tags
              </Text>
              <Input
                placeholder="e.g., Composting, Irrigation, Organic"
                value={form.tags}
                onChangeText={(text) => handleChange("tags", text)}
                bg={cardBg}
                borderColor={inputBorder}
                fontSize="md"
                py="3"
              />
              <Text color={mutedColor} fontSize="xs">
                Separate tags with commas
              </Text>
            </VStack>
          </VStack>

          <Box
            bg={cardBg}
            borderRadius="xl"
            p="4"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            borderWidth="1"
            borderColor={inputBorder}
          >
            <VStack>
              <Text color={headingColor} fontWeight="medium">
                Publish immediately
              </Text>
              <Text color={mutedColor} fontSize="xs">
                {form.isPublished ? "Visible to everyone" : "Save as draft"}
              </Text>
            </VStack>
            <Switch
              size="md"
              colorScheme="primary"
              isChecked={form.isPublished}
              onToggle={(value) => handleChange("isPublished", Boolean(value))}
            />
          </Box>

          <VStack space="3" pt="2">
            <Button
              colorScheme="primary"
              size="lg"
              onPress={handleCreate}
              isLoading={saving}
              isLoadingText="Creating..."
              _text={{ fontWeight: "semibold" }}
            >
              {form.isPublished ? "Publish tutorial" : "Save as draft"}
            </Button>
            <Button
              variant="ghost"
              colorScheme="muted"
              onPress={() => router.back()}
              isDisabled={saving}
            >
              Cancel
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

