import { Tabs } from "expo-router";
import { withTheme } from "react-native-paper";

const TabLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="feed"
        options={{ title: "Feed", headerShown: false }}
      />
    </Tabs>
  );
};

export default withTheme(TabLayout);
