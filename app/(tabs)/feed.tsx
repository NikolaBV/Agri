import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import {
  Box,
  Button,
  Fab,
  Heading,
  HStack,
  Icon,
  Input,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "native-base";
import ThemeToggle from "../../src/components/ThemeToggle";
import agent, { API_URL } from "../../src/api/agent";
import { PostDto } from "../../src/api/models";
import { useAuth } from "../../src/contexts/AuthContext";

const FeedScreen = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const background = useColorModeValue("brand.lightBg", "brand.darkBg");
  const cardBg = useColorModeValue("brand.lightCard", "brand.darkCard");
  const headingColor = useColorModeValue("muted.900", "muted.100");
  const bodyColor = useColorModeValue("muted.800", "muted.100");
  const mutedColor = useColorModeValue("muted.600", "muted.300");

  const loadPosts = useCallback(async (searchValue?: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await agent.Posts.list({
        onlyPublished: true,
        search: searchValue?.trim() || undefined,
      });
      setPosts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Unable to load posts right now.";
      setError(`Unable to load posts: ${errorMessage}`);
      console.error("API Error:", {
        message: err?.message,
        response: err?.response?.status,
        url: err?.config?.url,
        baseURL: err?.config?.baseURL,
        fullError: err
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPosts(query);
    }, [loadPosts, query])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts(query);
  }, [loadPosts, query]);

  const topicFilters = useMemo(() => {
    const safePosts = Array.isArray(posts) ? posts : [];
    if (!safePosts.length) {
      return [];
    }
    const unique = new Set<string>();
    safePosts.forEach((post) => (post.tags ?? []).forEach((tag) => unique.add(tag)));
    return Array.from(unique).slice(0, 6);
  }, [posts]);

  const handleApplyFilter = (value: string) => {
    setSearchInput(value);
    setQuery(value);
  };

  const renderItem = ({ item }: { item: PostDto }) => {
    const isOwner = isAuthenticated && user?.id === item.author?.id;

    return (
      <Box
        bg={cardBg}
        borderRadius="2xl"
        p="5"
        mb="4"
        shadow="3"
      >
        <VStack space="3">
          <Heading size="md" color={headingColor}>
            {item.title}
          </Heading>
          {item.author && (
            <Text fontSize="sm" color={mutedColor}>
              by {item.author.displayName || item.author.id}
            </Text>
          )}
          <Text color={bodyColor}>{item.summary}</Text>
          <HStack flexWrap="wrap" space="2">
            {(item.tags ?? []).map((tag) => (
              <Button
                key={`${item.id}-${tag}`}
                size="sm"
                variant="outline"
                colorScheme="primary"
                rounded="full"
                onPress={() => handleApplyFilter(tag)}
              >
                {tag}
              </Button>
            ))}
          </HStack>
          <HStack space="3" mt="2">
            <Button flex={1} colorScheme="primary" onPress={() => router.push(`/post/${item.id}`)}>
              Open
            </Button>
            {isOwner && (
              <Button
                flex={1}
                variant="outline"
                colorScheme="primary"
                onPress={() => router.push(`/post/${item.id}/edit`)}
              >
                Edit
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>
    );
  };

  return (
    <Box flex={1} bg={background} safeArea px="4" pt="4">
      <VStack space="4" flex={1}>
        <HStack alignItems="center" justifyContent="space-between">
          <Heading size="lg" color={headingColor}>
            Community feed
          </Heading>
          <ThemeToggle compact />
        </HStack>

        <Input
          placeholder="Search tutorials"
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={() => setQuery(searchInput)}
          InputLeftElement={
            <Icon
              as={Ionicons}
              name="search"
              size="5"
              color="muted.400"
              ml="3"
            />
          }
          bg={cardBg}
          returnKeyType="search"
        />

        <HStack flexWrap="wrap" space="2">
          {topicFilters.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant={query === tag ? "solid" : "outline"}
              colorScheme="primary"
              rounded="full"
              onPress={() => handleApplyFilter(tag)}
            >
              {tag}
            </Button>
          ))}
        </HStack>

        {error && (
          <VStack space="1" px="4">
            <Text color="error.400" fontSize="sm">
              {error}
            </Text>
            <Text color="muted.500" fontSize="xs" textAlign="center">
              API URL: {API_URL}
            </Text>
          </VStack>
        )}

        {loading && !refreshing ? (
          <Spinner size="lg" color="primary.400" accessibilityLabel="Loading tutorials" />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <Box py="10" alignItems="center">
                <Heading size="sm" color={headingColor} mb="1">
                  No tutorials yet
                </Heading>
                <Text color={mutedColor} textAlign="center">
                  Try adjusting your filters or check back later.
                </Text>
              </Box>
            }
          />
        )}
      </VStack>

      {isAuthenticated && (
        <Fab
          renderInPortal={false}
          shadow={4}
          size="lg"
          colorScheme="primary"
          icon={<Icon as={Ionicons} name="add" size="lg" color="white" />}
          onPress={() => router.push("/post/create")}
          label="New Post"
          position="absolute"
          bottom={6}
          right={4}
        />
      )}
    </Box>
  );
};

export default FeedScreen;
