import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const FeedScreen = () => {
  const { colors } = useTheme();

  return (
    <View>
      <Text style={{ color: colors.onSurface }}>Feed screen</Text>
    </View>
  );
};

export default FeedScreen;
