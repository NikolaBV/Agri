import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
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
  const { colors } = useTheme();
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
            tags: data.tags.join(", "),
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!post || post.author?.id !== user?.id) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: colors.error, marginBottom: 16 }}>
          {error || "You are not allowed to edit this tutorial."}
        </Text>
        <Button mode="contained" onPress={() => router.replace("/(tabs)/feed")}>
          Back to feed
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      {error && <Text style={{ color: colors.error }}>{error}</Text>}

      <TextInput
        label="Title"
        value={form.title}
        onChangeText={(text) => handleChange("title", text)}
        mode="outlined"
      />
      <TextInput
        label="Summary"
        value={form.summary}
        onChangeText={(text) => handleChange("summary", text)}
        mode="outlined"
        multiline
      />
      <TextInput
        label="Content"
        value={form.content}
        onChangeText={(text) => handleChange("content", text)}
        mode="outlined"
        multiline
        numberOfLines={6}
        style={{ minHeight: 160 }}
      />
      <TextInput
        label="Tags"
        value={form.tags}
        onChangeText={(text) => handleChange("tags", text)}
        mode="outlined"
        placeholder="Comma separated"
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: colors.onSurface }}>Published</Text>
        <Switch
          value={form.isPublished}
          onValueChange={(value) => handleChange("isPublished", value)}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={saving}
        style={{ marginTop: 8 }}
      >
        Save changes
      </Button>
    </ScrollView>
  );
};

export default EditPostScreen;

