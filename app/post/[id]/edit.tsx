import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  ScrollView,
  Spinner,
  Switch,
  Text,
  TextArea,
  VStack,
  useColorModeValue,
} from "native-base";
import agent from "../../../src/api/agent";
import { PostDto } from "../../../src/api/models";
import { useAuth } from "../../../src/contexts/AuthContext";

type FormState = {
  title: string;
  summary: string;
  content: string;
  tags: string;
  isPublished: boolean;
};

const EditPostScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDto | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    summary: "",
    content: "",
    tags: "",
    isPublished: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const background = useColorModeValue("brand.lightBg", "brand.darkBg");
  const cardBg = useColorModeValue("brand.lightCard", "brand.darkCard");
  const headingColor = useColorModeValue("muted.900", "muted.100");
  const mutedColor = useColorModeValue("muted.600", "muted.300");

  const postId = useMemo(() => {
    const value = params.id;
    return typeof value === "string" ? value : undefined;
  }, [params.id]);

  useEffect(() => {
    let active = true;
    const loadPost = async () => {
      if (!postId) {
        setError("Missing post id.");
        setLoading(false);
        return;
      }
      try {
        const data = await agent.Posts.details(postId);
        if (active) {
          setPost(data);
          setForm({
            title: data.title,
            summary: data.summary,
            content: data.content,
            tags: (data.tags ?? []).join(", "),
            isPublished: data.isPublished,
          });
        }
      } catch (err) {
        if (active) {
          setError("Unable to load this tutorial.");
        }
        console.warn(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadPost();
    return () => {
      active = false;
    };
  }, [postId]);

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!postId) {
      return;
    }
    try {
      setSaving(true);
      await agent.Posts.update(postId, {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        isPublished: form.isPublished,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      router.replace(`/post/${postId}`);
    } catch (err) {
      console.warn(err);
      setError("Unable to save changes right now.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box flex={1} bg={background} alignItems="center" justifyContent="center">
        <Spinner size="lg" color="primary.400" />
      </Box>
    );
  }

  if (!post || post.author?.id !== user?.id) {
    return (
      <Box flex={1} bg={background} alignItems="center" justifyContent="center" px="6">
        <Text color="error.400" mb="4" textAlign="center">
          {error || "You are not allowed to edit this tutorial."}
        </Text>
        <Button colorScheme="primary" onPress={() => router.replace("/(tabs)/feed")}>
          Back to feed
        </Button>
      </Box>
    );
  }

  return (
    <ScrollView flex={1} bg={background} contentContainerStyle={{ padding: 24 }}>
      <VStack space="4">
        <Heading size="lg" color={headingColor}>
          Edit tutorial
        </Heading>
        {error && (
          <Text color="error.400" fontSize="sm">
            {error}
          </Text>
        )}

        <VStack space="3">
          <Input
            placeholder="Title"
            value={form.title}
            onChangeText={(text) => handleChange("title", text)}
            bg={cardBg}
          />
          <Input
            placeholder="Summary"
            value={form.summary}
            onChangeText={(text) => handleChange("summary", text)}
            bg={cardBg}
          />
          <TextArea
            placeholder="Content"
            value={form.content}
            onChangeText={(text) => handleChange("content", text)}
            bg={cardBg}
            h="40"
          />
          <Input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChangeText={(text) => handleChange("tags", text)}
            bg={cardBg}
          />
        </VStack>

        <Box
          bg={cardBg}
          borderRadius="2xl"
          p="4"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text color={mutedColor}>Published</Text>
          <Switch
            size="md"
            colorScheme="primary"
            isChecked={form.isPublished}
            onToggle={(value) => handleChange("isPublished", Boolean(value))}
          />
        </Box>

        <Button
          colorScheme="primary"
          onPress={handleSave}
          isLoading={saving}
        >
          Save changes
        </Button>
      </VStack>
    </ScrollView>
  );
};

export default EditPostScreen;

