import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWines } from "@/context/WineContext";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<string, string> = {
  red: "#8B1A2A",
  white: "#B8922A",
  sparkling: "#4A7C8E",
  dessert: "#7A4A8E",
  fortified: "#6B4423",
  rosé: "#D4607A",
};

const currentYear = new Date().getFullYear();

function InfoRow({ label, value }: { label: string; value: string | number }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function WineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getWine, deleteWine } = useWines();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const wine = getWine(id ?? "");

  if (!wine) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.foreground }]}>
          Wine not found
        </Text>
      </View>
    );
  }

  const roi =
    wine.purchasePrice > 0
      ? ((wine.currentValue - wine.purchasePrice) / wine.purchasePrice) * 100
      : 0;

  const catColor = CATEGORY_COLORS[wine.category] ?? "#8B1A2A";
  const isPeaking =
    currentYear >= wine.drinkFrom && currentYear <= wine.drinkUntil;
  const isPastPeak = currentYear > wine.drinkUntil;

  const windowTotal = wine.drinkUntil - wine.drinkFrom;
  const windowProgress =
    windowTotal > 0
      ? Math.max(
          0,
          Math.min(1, (currentYear - wine.drinkFrom) / windowTotal)
        )
      : 0;

  const handleDelete = () => {
    Alert.alert(
      "Remove Wine",
      `Remove ${wine.vintage} ${wine.name} from your cellar?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            await deleteWine(wine.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[catColor + "CC", colors.background]}
          style={styles.heroGradient}
        >
          <View style={[styles.catDot, { backgroundColor: catColor }]}>
            <Ionicons name="wine" size={28} color="#FFF" />
          </View>
          <Text style={[styles.vintage, { color: "rgba(255,255,255,0.7)" }]}>
            {wine.vintage}
          </Text>
          <Text style={[styles.name, { color: "#FFFFFF" }]}>{wine.name}</Text>
          <Text style={[styles.producer, { color: "rgba(255,255,255,0.8)" }]}>
            {wine.producer}
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: "#FFFFFF" }]}>
                ${wine.currentValue.toLocaleString()}
              </Text>
              <Text style={[styles.heroStatLabel, { color: "rgba(255,255,255,0.7)" }]}>
                Current Value
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: roi >= 0 ? "#4CAF50" : "#F44336" }]}>
                {roi >= 0 ? "+" : ""}
                {roi.toFixed(1)}%
              </Text>
              <Text style={[styles.heroStatLabel, { color: "rgba(255,255,255,0.7)" }]}>
                ROI
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: "#FFFFFF" }]}>
                {wine.quantity}
              </Text>
              <Text style={[styles.heroStatLabel, { color: "rgba(255,255,255,0.7)" }]}>
                Bottles
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={[styles.drinkWindow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.drinkWindowHeader}>
              <Text style={[styles.drinkWindowTitle, { color: colors.foreground }]}>
                Drinking Window
              </Text>
              {isPeaking && (
                <View style={[styles.statusBadge, { backgroundColor: "#1A3A1A" }]}>
                  <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                  <Text style={[styles.statusText, { color: "#4CAF50" }]}>
                    {" "}Peak now
                  </Text>
                </View>
              )}
              {isPastPeak && (
                <View style={[styles.statusBadge, { backgroundColor: "#3A1A1A" }]}>
                  <Ionicons name="alert-circle" size={12} color="#F44336" />
                  <Text style={[styles.statusText, { color: "#F44336" }]}>
                    {" "}Past peak
                  </Text>
                </View>
              )}
              {!isPeaking && !isPastPeak && (
                <View style={[styles.statusBadge, { backgroundColor: colors.muted }]}>
                  <Ionicons name="time" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                    {" "}Not ready
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.drinkWindowYears}>
              <Text style={[styles.yearLabel, { color: colors.mutedForeground }]}>
                {wine.drinkFrom}
              </Text>
              <Text style={[styles.yearLabel, { color: colors.mutedForeground }]}>
                {wine.drinkUntil}
              </Text>
            </View>
            <View style={[styles.windowBarBg, { backgroundColor: colors.muted }]}>
              <LinearGradient
                colors={[catColor, catColor + "88"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.windowBarFill, { width: `${windowProgress * 100}%` }]}
              />
              <View
                style={[
                  styles.nowMarker,
                  {
                    left: `${windowProgress * 100}%`,
                    backgroundColor: isPeaking ? "#4CAF50" : colors.foreground,
                  },
                ]}
              />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Details
            </Text>
            <InfoRow label="Producer" value={wine.producer} />
            <InfoRow label="Region" value={wine.region} />
            <InfoRow label="Country" value={wine.country} />
            <InfoRow label="Varietal" value={wine.varietal} />
            <InfoRow label="Category" value={wine.category} />
            <InfoRow label="Location" value={wine.storageLocation || "—"} />
            <InfoRow label="Purchased" value={wine.purchaseDate} />
            <InfoRow label="Purchase Price" value={`$${wine.purchasePrice.toLocaleString()}`} />
          </View>

          {wine.notes ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Notes</Text>
              <Text style={[styles.notes, { color: colors.mutedForeground }]}>
                {wine.notes}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.deleteBtn, { borderColor: colors.destructive + "44" }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              <Text style={[styles.deleteBtnText, { color: colors.destructive }]}>
                Remove from Cellar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  heroGradient: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  catDot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  vintage: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
  },
  name: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
    textAlign: "center",
  },
  producer: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    textAlign: "center",
  },
  heroStats: {
    flexDirection: "row",
    marginTop: 20,
    gap: 0,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  heroStatVal: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  heroStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  heroDivider: {
    width: 1,
    height: 32,
    alignSelf: "center",
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  drinkWindow: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  drinkWindowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drinkWindowTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  drinkWindowYears: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  yearLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  windowBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "visible",
    position: "relative",
  },
  windowBarFill: {
    height: 8,
    borderRadius: 4,
  },
  nowMarker: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginLeft: -8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 0,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  notes: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  actions: {
    marginTop: 4,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
  },
  deleteBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
