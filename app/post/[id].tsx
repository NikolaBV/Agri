import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Chip,
  Text,
  useTheme,
} from "react-native-paper";
import agent from "../../src/api/agent";
import { PostDto } from "../../src/api/models";
import { useAuth } from "../../src/contexts/AuthContext";

const PostDetailsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
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

  const handleDelete = () => {
    if (!postId) {
      return;
    }
    Alert.alert(
      "Delete tutorial",
      "This action cannot be undone. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setMutating(true);
              await agent.Posts.delete(postId);
              router.replace("/(tabs)/feed");
            } catch (err) {
              console.warn(err);
              setMutating(false);
              Alert.alert("Unable to delete this post right now.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ color: colors.error, marginBottom: 16 }}>
          {error || "Post not found."}
        </Text>
        <Button mode="contained" onPress={() => router.replace("/(tabs)/feed")}>
          Back to feed
        </Button>
      </View>
    );
  }

  const isOwner = isAuthenticated && user?.id === post.author?.id;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, gap: 24 }}
      style={{ flex: 1 }}
    >
      <View style={{ gap: 8 }}>
        <Text variant="headlineMedium" style={{ color: colors.onSurface }}>
          {post.title}
        </Text>
        {post.author && (
          <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
            by {post.author.displayName || post.author.id}
          </Text>
        )}
        <Text variant="bodySmall" style={{ color: colors.onSurface }}>
          {new Date(post.createdAt).toLocaleDateString()} •{" "}
          {post.isPublished ? "Published" : "Draft"}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          Summary
        </Text>
        <Text variant="bodyLarge" style={{ color: colors.onSurface }}>
          {post.summary}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          Tutorial
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurface, lineHeight: 24 }}>
          {post.content}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          Tags
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {post.tags.map((tag, index) => (
            <Chip key={`${tag}-${index}`}>{tag}</Chip>
          ))}
        </View>
      </View>

      {isOwner && (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Button
            mode="contained"
            style={{ flex: 1 }}
            onPress={() => router.push(`/post/${post.id}/edit`)}
            disabled={mutating}
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            style={{ flex: 1 }}
            onPress={handleDelete}
            disabled={mutating}
            textColor={colors.error}
          >
            Delete
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

export default PostDetailsScreen;

