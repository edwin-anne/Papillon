import React, { memo, useCallback } from "react";
import { View, Text } from "react-native";
import { ArrowUpRight } from "lucide-react-native";
import { NavigationContainerRef, useTheme } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import type { RouteParameters } from "@/router/helpers/types";

interface RedirectButtonProps {
  navigation: NavigationContainerRef<RouteParameters> | null;
  redirect: keyof RouteParameters;
}

const RedirectButton: React.FC<RedirectButtonProps> = ({ navigation, redirect }) => {
  const theme = useTheme();
  const { colors } = theme;

  const handlePress = useCallback(() => {
    // @ts-expect-error
    navigation?.navigate(redirect);
  }, [navigation, redirect]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.text + "20",
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 100,
          marginVertical: -5,
          marginTop: -7,
          gap: 5,
          opacity: 0.6,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 15, fontFamily: "semibold" }}>
          Voir plus
        </Text>
        <ArrowUpRight
          strokeWidth={2.5}
          size={20}
          color={colors.text}
        />
      </View>
    </TouchableOpacity>
  );
};

export default memo(RedirectButton);
