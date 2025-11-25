import { Tabs } from "expo-router";
import { useColorModeValue } from "native-base";

const TabLayout = () => {
  const tabBg = useColorModeValue("#ffffff", "#101720");
  const borderColor = useColorModeValue("#e2e8f0", "#1f2732");
  const activeTint = useColorModeValue("#2f8f83", "#4ad7c1");
  const inactiveTint = useColorModeValue("#7b8796", "#a0aec0");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopColor: borderColor,
        },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
    </Tabs>
  );
};

export default TabLayout;
