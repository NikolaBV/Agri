import { HStack, Switch, Text, useColorMode, useColorModeValue } from "native-base";

type ThemeToggleProps = {
  compact?: boolean;
};

const ThemeToggle = ({ compact = false }: ThemeToggleProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const labelColor = useColorModeValue("muted.700", "muted.200");
  const trackOn = useColorModeValue("primary.400", "primary.200");
  const trackOff = useColorModeValue("muted.200", "muted.700");

  return (
    <HStack alignItems="center" space={compact ? 2 : 3}>
      {!compact && (
        <Text fontSize="sm" color={labelColor} fontWeight="medium">
          {colorMode === "dark" ? "Dark mode" : "Light mode"}
        </Text>
      )}
      <Switch
        size="md"
        isChecked={colorMode === "dark"}
        onToggle={toggleColorMode}
        onTrackColor={trackOn}
        offTrackColor={trackOff}
      />
    </HStack>
  );
};

export default ThemeToggle;


