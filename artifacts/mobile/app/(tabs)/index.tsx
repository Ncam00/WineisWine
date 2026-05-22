import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WineCard } from "@/components/WineCard";
import { WineCategory, useWines } from "@/context/WineContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES: { label: string; value: WineCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Red", value: "red" },
  { label: "White", value: "white" },
  { label: "Sparkling", value: "sparkling" },
  { label: "Rosé", value: "rosé" },
  { label: "Dessert", value: "dessert" },
  { label: "Fortified", value: "fortified" },
];

export default function CellarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { wines, totalValue, totalPurchaseValue } = useWines();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<WineCategory | "all">("all");

  const filtered = useMemo(() => {
    return wines.filter((w) => {
      const matchesCategory = category === "all" || w.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.producer.toLowerCase().includes(q) ||
        w.region.toLowerCase().includes(q) ||
        w.varietal.toLowerCase().includes(q) ||
        w.country.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [wines, search, category]);

  const roi =
    totalPurchaseValue > 0
      ? ((totalValue - totalPurchaseValue) / totalPurchaseValue) * 100
      : 0;

  const totalBottles = wines.reduce((s, w) => s + w.quantity, 0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.burgundy + "CC", colors.background]}
        style={[styles.headerGradient, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerLabel, { color: colors.primaryForeground + "99" }]}>
              CELLAR VALUE
            </Text>
            <Text style={[styles.headerValue, { color: colors.primaryForeground }]}>
              ${totalValue.toLocaleString()}
            </Text>
            <Text style={[styles.headerSub, { color: colors.primaryForeground + "BB" }]}>
              {totalBottles} bottles · {roi >= 0 ? "+" : ""}
              {roi.toFixed(1)}% return
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.gold }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync();
              router.push("/wine/add");
            }}
          >
            <Ionicons name="add" size={24} color="#0B0810" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search wines..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(w) => w.id}
        scrollEnabled={!!filtered.length}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 90 },
        ]}
        ListHeaderComponent={
          <FlatList
            data={CATEGORIES}
            horizontal
            keyExtractor={(c) => c.value}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipList}
            renderItem={({ item }) => {
              const active = category === item.value;
              return (
                <TouchableOpacity
                  onPress={() => setCategory(item.value)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.muted,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? colors.primaryForeground : colors.mutedForeground },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        }
        renderItem={({ item }) => <WineCard wine={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="wine-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search ? "No wines found" : "Your cellar is empty"}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              {search
                ? "Try a different search or filter"
                : "Add your first bottle to get started"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  headerValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  chipList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
