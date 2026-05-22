import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Wine } from "@/context/WineContext";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<string, string> = {
  red: "#8B1A2A",
  white: "#B8922A",
  sparkling: "#4A7C8E",
  dessert: "#7A4A8E",
  fortified: "#6B4423",
  rosé: "#D4607A",
};

const CATEGORY_ICONS: Record<string, string> = {
  red: "wine",
  white: "wine-outline",
  sparkling: "sparkles",
  dessert: "star",
  fortified: "flask",
  rosé: "flower",
};

interface WineCardProps {
  wine: Wine;
}

const currentYear = new Date().getFullYear();

export function WineCard({ wine }: WineCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const catColor = CATEGORY_COLORS[wine.category] ?? "#8B1A2A";

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    router.push(`/wine/${wine.id}`);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const roi = wine.purchasePrice > 0
    ? ((wine.currentValue - wine.purchasePrice) / wine.purchasePrice) * 100
    : 0;

  const isPeaking =
    currentYear >= wine.drinkFrom && currentYear <= wine.drinkUntil;
  const isPastPeak = currentYear > wine.drinkUntil;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.categoryBar, { backgroundColor: catColor }]} />
          <View style={styles.content}>
            <View style={styles.row}>
              <View style={styles.nameBlock}>
                <Text style={[styles.vintage, { color: colors.mutedForeground }]}>
                  {wine.vintage}
                </Text>
                <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                  {wine.name}
                </Text>
                <Text style={[styles.producer, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {wine.producer} · {wine.region}
                </Text>
              </View>
              <View style={styles.rightBlock}>
                <Text style={[styles.value, { color: colors.foreground }]}>
                  ${wine.currentValue.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.roi,
                    { color: roi >= 0 ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {roi >= 0 ? "+" : ""}
                  {roi.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                  {wine.quantity} btl
                </Text>
              </View>
              {isPeaking && (
                <View style={[styles.badge, { backgroundColor: "#1A3A1A" }]}>
                  <Ionicons name="checkmark-circle" size={11} color="#4CAF50" />
                  <Text style={[styles.badgeText, { color: "#4CAF50" }]}>
                    {" "}Peak now
                  </Text>
                </View>
              )}
              {isPastPeak && (
                <View style={[styles.badge, { backgroundColor: "#3A1A1A" }]}>
                  <Ionicons name="alert-circle" size={11} color="#F44336" />
                  <Text style={[styles.badgeText, { color: "#F44336" }]}>
                    {" "}Past peak
                  </Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: catColor + "22" }]}>
                <Text style={[styles.badgeText, { color: catColor }]}>
                  {wine.category}
                </Text>
              </View>
              <View style={styles.stars}>
                {Array.from({ length: wine.rating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={10} color={colors.gold} />
                ))}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 10,
  },
  categoryBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameBlock: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  vintage: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  producer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  rightBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  value: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  roi: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  stars: {
    flexDirection: "row",
    gap: 1,
    marginLeft: "auto" as const,
  },
});
