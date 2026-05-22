import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface InsightCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  body: string;
  accent?: boolean;
}

export function InsightCard({
  icon,
  iconColor,
  title,
  body,
  accent,
}: InsightCardProps) {
  const colors = useColors();
  const bgColor = accent ? colors.primary + "18" : colors.card;
  const borderColor = accent ? colors.primary + "40" : colors.border;
  const resolvedIconColor = iconColor ?? (accent ? colors.primary : colors.gold);

  return (
    <View
      style={[styles.card, { backgroundColor: bgColor, borderColor }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: resolvedIconColor + "22" }]}>
        <Ionicons name={icon} size={18} color={resolvedIconColor} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
