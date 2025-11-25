import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Text,
  useTheme,
} from "react-native-paper";
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
  const { colors } = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [highlights, setHighlights] = useState<PostDto[]>([]);
  const [loadingHighlights, setLoadingHighlights] = useState(false);

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
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        gap: 32,
      }}
    >
      <View style={{ gap: 16 }}>
        <Text variant="headlineMedium" style={{ color: colors.onSurface }}>
          Grow better together
        </Text>
        <Text variant="bodyLarge" style={{ color: colors.onSurface }}>
          {heroSubtitle}
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Button
            mode="contained"
            onPress={() => router.push("/(tabs)/feed")}
            style={{ flex: 1 }}
          >
            Browse feed
          </Button>
          <Button
            mode="outlined"
            onPress={() =>
              router.push(isAuthenticated ? "/(tabs)/feed" : "/auth/register")
            }
            style={{ flex: 1 }}
          >
            {isAuthenticated ? "Share a tutorial" : "Join the growers"}
          </Button>
        </View>
        <Button
          onPress={() =>
            isAuthenticated ? logout() : router.push("/auth/login")
          }
        >
          {isAuthenticated ? "Sign out" : "Already sharing? Sign in"}
        </Button>
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          Explore topics
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {focusAreas.map((label) => (
            <Chip
              key={label}
              textStyle={{ color: colors.onSurface }}
              onPress={() => router.push("/(tabs)/feed")}
            >
              {label}
            </Chip>
          ))}
        </View>
      </View>

      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text variant="titleMedium" style={{ color: colors.onSurface }}>
            Fresh from the field
          </Text>
          <Button onPress={() => router.push("/(tabs)/feed")}>View all</Button>
        </View>
        {loadingHighlights ? (
          <ActivityIndicator />
        ) : highlights.length ? (
          highlights.map((post) => (
            <Card key={post.id} mode="contained" style={{ backgroundColor: colors.secondary }}>
              <Card.Title
                title={post.title}
                subtitle={
                  post.author
                    ? `by ${post.author.displayName || post.author.id}`
                    : "Community"
                }
                titleNumberOfLines={2}
                subtitleStyle={{ color: colors.onSurface }}
                titleStyle={{ color: colors.onSurface }}
              />
              <Card.Content style={{ gap: 12 }}>
                <Text
                  variant="bodyMedium"
                  style={{ color: colors.onSurface }}
                  numberOfLines={3}
                >
                  {post.summary}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {(post.tags ?? []).slice(0, 3).map((tag) => (
                    <Chip key={`${post.id}-${tag}`} compact>
                      {tag}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => router.push(`/post/${post.id}`)}>
                  Read tutorial
                </Button>
              </Card.Actions>
            </Card>
          ))
        ) : (
          <Text style={{ color: colors.onSurface }}>
            Tutorials you save or publish will appear here.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default Index;
