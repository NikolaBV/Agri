import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  ScrollView,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "native-base";
import ThemeToggle from "../../src/components/ThemeToggle";
import agent from "../../src/api/agent";
import { PostDto } from "../../src/api/models";
import { useAuth } from "../../src/contexts/AuthContext";

const focusAreas = [
  "Soil health",
  "Irrigation",
  "Organic inputs",
  "Smart devices",
  "Agroforestry",
  "Post-harvest care",
];

const Index = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [highlights, setHighlights] = useState<PostDto[]>([]);
  const [loadingHighlights, setLoadingHighlights] = useState(false);

  const background = useColorModeValue("brand.lightBg", "brand.darkBg");
  const cardBg = useColorModeValue("brand.lightCard", "brand.darkCard");
  const headingColor = useColorModeValue("muted.900", "muted.100");
  const bodyColor = useColorModeValue("muted.800", "muted.100");
  const mutedColor = useColorModeValue("muted.600", "muted.300");

  useEffect(() => {
    let active = true;
    const loadHighlights = async () => {
      setLoadingHighlights(true);
      try {
        const posts = await agent.Posts.list({ onlyPublished: true });
        if (active) {
          const safePosts = Array.isArray(posts) ? posts : [];
          setHighlights(safePosts.slice(0, 3));
        }
      } catch (error) {
        console.warn(error);
      } finally {
        if (active) {
          setLoadingHighlights(false);
        }
      }
    };

    loadHighlights();
    return () => {
      active = false;
    };
  }, []);

  const heroSubtitle = useMemo(
    () =>
      isAuthenticated
        ? `Welcome back, ${user?.displayName || user?.username}. Ready to share your next tutorial?`
        : "Learn and teach modern farming with bite-sized tutorials.",
    [isAuthenticated, user]
  );

  return (
    <ScrollView flex={1} bg={background} px="6" py="8">
      <VStack space="8">
        <VStack space="4">
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="lg" color={headingColor}>
              Grow better together
            </Heading>
            <ThemeToggle compact />
          </HStack>
          <Text fontSize="md" color={bodyColor} lineHeight="lg">
            {heroSubtitle}
          </Text>
          <HStack space="3">
            <Button flex={1} colorScheme="primary" onPress={() => router.push("/(tabs)/feed")}>
              Browse feed
            </Button>
            <Button
              flex={1}
              variant="outline"
              colorScheme="primary"
              onPress={() =>
                router.push(isAuthenticated ? "/post/create" : "/auth/register")
              }
            >
              {isAuthenticated ? "Share a tutorial" : "Join the growers"}
            </Button>
          </HStack>
          <Button
            variant="link"
            colorScheme="primary"
            onPress={() => (isAuthenticated ? logout() : router.push("/auth/login"))}
          >
            {isAuthenticated ? "Sign out" : "Already sharing? Sign in"}
          </Button>
        </VStack>

        <VStack space="3">
          <Heading size="sm" color={headingColor}>
            Explore topics
          </Heading>
          <HStack flexWrap="wrap" space="2">
            {focusAreas.map((label) => (
              <Button
                key={label}
                size="sm"
                variant="outline"
                colorScheme="primary"
                rounded="full"
                onPress={() => router.push("/(tabs)/feed")}
              >
                {label}
              </Button>
            ))}
          </HStack>
        </VStack>

        <VStack space="4">
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="sm" color={headingColor}>
              Fresh from the field
            </Heading>
            <Button
              variant="ghost"
              colorScheme="primary"
              onPress={() => router.push("/(tabs)/feed")}
            >
              View all
            </Button>
          </HStack>
          {loadingHighlights ? (
            <Spinner size="lg" color="primary.400" />
          ) : highlights.length ? (
            highlights.map((post) => (
              <Box
                key={post.id}
                bg={cardBg}
                borderRadius="2xl"
                p="5"
                shadow="3"
              >
                <VStack space="3">
                  <Heading size="md" color={headingColor}>
                    {post.title}
                  </Heading>
                  <Text fontSize="sm" color={mutedColor}>
                    {post.author
                      ? `by ${post.author.displayName || post.author.id}`
                      : "Community"}
                  </Text>
                  <Text color={bodyColor}>{post.summary}</Text>
                  <HStack flexWrap="wrap" space="2">
                    {(post.tags ?? []).slice(0, 3).map((tag) => (
                      <Button
                        key={`${post.id}-${tag}`}
                        size="sm"
                        variant="outline"
                        colorScheme="primary"
                        rounded="full"
                      >
                        {tag}
                      </Button>
                    ))}
                  </HStack>
                  <Button
                    alignSelf="flex-start"
                    variant="ghost"
                    colorScheme="primary"
                    onPress={() => router.push(`/post/${post.id}`)}
                  >
                    Read tutorial
                  </Button>
                </VStack>
              </Box>
            ))
          ) : (
            <Text color={mutedColor}>
              Tutorials you save or publish will appear here.
            </Text>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default Index;
