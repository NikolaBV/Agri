import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import agent from "../../src/api/agent";
import { PostDto } from "../../src/api/models";
import { useAuth } from "../../src/contexts/AuthContext";

const FeedScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (searchValue?: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await agent.Posts.list({
        onlyPublished: true,
        search: searchValue?.trim() || undefined,
      });
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load posts right now.");
      console.warn(err);
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

  const renderItem = ({ item }: { item: PostDto }) => (
    <Card
      mode="contained"
      style={{ marginBottom: 16, backgroundColor: colors.secondary }}
      onPress={() => router.push(`/post/${item.id}`)}
    >
      <Card.Title
        title={item.title}
        subtitle={
          item.author
            ? `by ${item.author.displayName || item.author.id}`
            : undefined
        }
        titleNumberOfLines={2}
        titleStyle={{ color: colors.onSurface }}
        subtitleStyle={{ color: colors.onSurface }}
      />
      <Card.Content style={{ gap: 12 }}>
        <Text
          variant="bodyMedium"
          numberOfLines={4}
          style={{ color: colors.onSurface }}
        >
          {item.summary}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {(item.tags ?? []).map((tag) => (
            <Chip key={`${item.id}-${tag}`} compact onPress={() => handleApplyFilter(tag)}>
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => router.push(`/post/${item.id}`)}>Open</Button>
        {isAuthenticated && user?.id === item.author?.id && (
          <Button onPress={() => router.push(`/post/${item.id}/edit`)}>
            Edit
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Searchbar
        placeholder="Search tutorials"
        value={searchInput}
        onChangeText={setSearchInput}
        onSubmitEditing={() => setQuery(searchInput)}
        style={{ marginBottom: 16 }}
        returnKeyType="search"
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {topicFilters.map((tag) => (
          <Chip
            key={tag}
            onPress={() => handleApplyFilter(tag)}
            selected={query === tag}
          >
            {tag}
          </Chip>
        ))}
      </View>

      {error && (
        <Text style={{ color: colors.error, marginBottom: 12 }}>{error}</Text>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={{ padding: 32, alignItems: "center" }}>
              <Text style={{ color: colors.onSurface, marginBottom: 8 }}>
                No tutorials yet
              </Text>
              <Text style={{ color: colors.onSurface }}>
                Try adjusting your filters or check back later.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default FeedScreen;
