import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  Box,
  Button,
  Heading,
  HStack,
  Modal,
  ScrollView,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "native-base";
import agent from "../../src/api/agent";
import { PostDto } from "../../src/api/models";
import { useAuth } from "../../src/contexts/AuthContext";

const PostDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const background = useColorModeValue("brand.lightBg", "brand.darkBg");
  const cardBg = useColorModeValue("brand.lightCard", "brand.darkCard");
  const headingColor = useColorModeValue("muted.900", "muted.100");
  const bodyColor = useColorModeValue("muted.800", "muted.100");
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

  const confirmDelete = async () => {
    if (!postId) return;
    try {
      setMutating(true);
      setShowDeleteModal(false);
      await agent.Posts.delete(postId);
      router.replace("/(tabs)/feed");
    } catch (err) {
      console.warn(err);
      setMutating(false);
      if (Platform.OS === "web") {
        window.alert("Unable to delete this post right now.");
      } else {
        Alert.alert("Error", "Unable to delete this post right now.");
      }
    }
  };

  const handleDelete = () => {
    if (!postId) return;

    if (Platform.OS === "web") {
      // Use modal on web since Alert.alert doesn't work
      setShowDeleteModal(true);
    } else {
      // Use native Alert on mobile
      Alert.alert(
        "Delete tutorial",
        "This action cannot be undone. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirmDelete },
        ],
        { cancelable: true }
      );
    }
  };

  if (loading) {
    return (
      <Box flex={1} bg={background} alignItems="center" justifyContent="center">
        <Spinner size="lg" color="primary.400" />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box flex={1} bg={background} alignItems="center" justifyContent="center" px="6">
        <Text color="error.400" mb="4" textAlign="center">
          {error || "Post not found."}
        </Text>
        <Button colorScheme="primary" onPress={() => router.replace("/(tabs)/feed")}>
          Back to feed
        </Button>
      </Box>
    );
  }

  const isOwner = isAuthenticated && user?.id === post.author?.id;

  return (
    <ScrollView flex={1} bg={background} contentContainerStyle={{ padding: 24 }}>
      <VStack space="8">
        <VStack space="2">
          <Heading size="lg" color={headingColor}>
            {post.title}
          </Heading>
          {post.author && (
            <Text color={mutedColor}>
              by {post.author.displayName || post.author.id}
            </Text>
          )}
          <Text color={mutedColor} fontSize="sm">
            {new Date(post.createdAt).toLocaleDateString()} •{" "}
            {post.isPublished ? "Published" : "Draft"}
          </Text>
        </VStack>

        <VStack space="3" bg={cardBg} borderRadius="2xl" p="5" shadow="2">
          <Heading size="sm" color={headingColor}>
            Summary
          </Heading>
          <Text color={bodyColor}>{post.summary}</Text>
        </VStack>

        <VStack space="3" bg={cardBg} borderRadius="2xl" p="5" shadow="2">
          <Heading size="sm" color={headingColor}>
            Tutorial
          </Heading>
          <Text color={bodyColor} lineHeight="lg">
            {post.content}
          </Text>
        </VStack>

        <VStack space="3" bg={cardBg} borderRadius="2xl" p="5" shadow="2">
          <Heading size="sm" color={headingColor}>
            Tags
          </Heading>
          <HStack flexWrap="wrap" space="2">
            {(post.tags ?? []).map((tag, index) => (
              <Button
                key={`${tag}-${index}`}
                size="sm"
                variant="outline"
                colorScheme="primary"
                rounded="full"
              >
                {tag}
              </Button>
            ))}
          </HStack>
        </VStack>

        {isOwner && (
          <HStack space="3">
            <Button
              flex={1}
              colorScheme="primary"
              onPress={() => router.push(`/post/${post.id}/edit`)}
              isDisabled={mutating}
            >
              Edit
            </Button>
            <Button
              flex={1}
              variant="outline"
              colorScheme="error"
              onPress={handleDelete}
              isDisabled={mutating}
              isLoading={mutating}
            >
              Delete
            </Button>
          </HStack>
        )}
      </VStack>

      {/* Delete Confirmation Modal for Web */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Delete tutorial</Modal.Header>
          <Modal.Body>
            <Text>This action cannot be undone. Are you sure you want to delete this tutorial?</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="muted"
                onPress={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="error" onPress={confirmDelete}>
                Delete
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </ScrollView>
  );
};

export default PostDetailsScreen;

