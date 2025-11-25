import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const Index = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.onSurface }}>Home</Text>
    </View>
  );
};

export default Index;
