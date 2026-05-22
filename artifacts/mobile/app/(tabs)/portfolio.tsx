import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InsightCard } from "@/components/InsightCard";
import { useWines } from "@/context/WineContext";
import { useColors } from "@/hooks/useColors";

const currentYear = new Date().getFullYear();

function StatCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      {sub && (
        <Text
          style={[
            styles.statSub,
            { color: positive === true ? "#4CAF50" : positive === false ? "#F44336" : colors.gold },
          ]}
        >
          {sub}
        </Text>
      )}
    </View>
  );
}

function RegionBar({
  region,
  count,
  total,
}: {
  region: string;
  count: number;
  total: number;
}) {
  const colors = useColors();
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.regionRow}>
      <View style={styles.regionLabel}>
        <Text style={[styles.regionName, { color: colors.foreground }]}>{region}</Text>
        <Text style={[styles.regionCount, { color: colors.mutedForeground }]}>
          {count} btl · {pct.toFixed(0)}%
        </Text>
      </View>
      <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
        <LinearGradient
          colors={[colors.burgundy, colors.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${pct}%` }]}
        />
      </View>
    </View>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { wines, totalValue, totalPurchaseValue } = useWines();

  const roi =
    totalPurchaseValue > 0
      ? ((totalValue - totalPurchaseValue) / totalPurchaseValue) * 100
      : 0;

  const totalBottles = wines.reduce((s, w) => s + w.quantity, 0);
  const avgValue = wines.length > 0 ? totalValue / totalBottles : 0;

  const peakingNow = wines.filter(
    (w) => currentYear >= w.drinkFrom && currentYear <= w.drinkUntil
  );
  const pastPeak = wines.filter((w) => currentYear > w.drinkUntil);
  const notReady = wines.filter((w) => currentYear < w.drinkFrom);

  const regions = useMemo(() => {
    const map: Record<string, number> = {};
    wines.forEach((w) => {
      const key = w.region || w.country;
      map[key] = (map[key] ?? 0) + w.quantity;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [wines]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    wines.forEach((w) => {
      map[w.category] = (map[w.category] ?? 0) + w.quantity;
    });
    return map;
  }, [wines]);

  const topWines = useMemo(
    () =>
      [...wines]
        .sort((a, b) => b.currentValue * b.quantity - a.currentValue * a.quantity)
        .slice(0, 3),
    [wines]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const insights = useMemo(() => {
    const list = [];

    if (peakingNow.length > 0) {
      list.push({
        icon: "checkmark-circle" as const,
        title: `${peakingNow.length} wine${peakingNow.length > 1 ? "s" : ""} at peak maturity`,
        body: `Drink ${peakingNow.slice(0, 2).map((w) => w.name).join(", ")} now for optimal experience.`,
        accent: true,
      });
    }

    if (pastPeak.length > 0) {
      list.push({
        icon: "alert-circle" as const,
        iconColor: "#F44336",
        title: `${pastPeak.length} wine${pastPeak.length > 1 ? "s" : ""} past their peak`,
        body: `Consider drinking or selling these bottles soon.`,
      });
    }

    const redPct =
      totalBottles > 0 ? ((categoryCounts["red"] ?? 0) / totalBottles) * 100 : 0;
    if (redPct > 70) {
      list.push({
        icon: "pie-chart" as const,
        title: "Cellar heavily Red-weighted",
        body: `${redPct.toFixed(0)}% of your collection is red wine. Consider diversifying into white or sparkling.`,
      });
    }

    if (notReady.length > 0) {
      list.push({
        icon: "time" as const,
        iconColor: "#4A7C8E",
        title: `${notReady.length} wine${notReady.length > 1 ? "s" : ""} still maturing`,
        body: `${notReady.map((w) => `${w.name} (ready ${w.drinkFrom})`).join(", ")}.`,
      });
    }

    if (roi > 10) {
      list.push({
        icon: "trending-up" as const,
        iconColor: "#4CAF50",
        title: `Portfolio up ${roi.toFixed(1)}% overall`,
        body: `Strong appreciation. Your collection has grown from $${totalPurchaseValue.toLocaleString()} to $${totalValue.toLocaleString()}.`,
      });
    }

    return list;
  }, [wines, peakingNow, pastPeak, notReady, categoryCounts, roi, totalBottles, totalValue, totalPurchaseValue]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.burgundy + "CC", colors.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={[styles.headerLabel, { color: colors.primaryForeground + "99" }]}>
          PORTFOLIO OVERVIEW
        </Text>
        <Text style={[styles.headerValue, { color: colors.primaryForeground }]}>
          ${totalValue.toLocaleString()}
        </Text>
        <Text style={[styles.headerSub, { color: colors.primaryForeground + "BB" }]}>
          Total collection value
        </Text>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Bottles"
          value={totalBottles.toString()}
          sub={`${wines.length} labels`}
        />
        <StatCard
          label="ROI"
          value={`${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`}
          sub={`$${(totalValue - totalPurchaseValue).toLocaleString()} gain`}
          positive={roi >= 0}
        />
        <StatCard
          label="Avg per Bottle"
          value={`$${avgValue.toFixed(0)}`}
          sub="current value"
        />
        <StatCard
          label="Peak Now"
          value={peakingNow.reduce((s, w) => s + w.quantity, 0).toString()}
          sub="bottles to drink"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Cellar Intelligence
        </Text>
        {insights.length > 0 ? (
          insights.map((ins, i) => (
            <InsightCard key={i} {...ins} />
          ))
        ) : (
          <InsightCard
            icon="checkmark-shield"
            title="Collection looks healthy"
            body="Add more wines to unlock deeper AI insights about your cellar."
          />
        )}
      </View>

      {regions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Regional Breakdown
          </Text>
          <View style={[styles.regionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {regions.map(([region, count]) => (
              <RegionBar
                key={region}
                region={region}
                count={count}
                total={totalBottles}
              />
            ))}
          </View>
        </View>
      )}

      {topWines.length > 0 && (
        <View style={[styles.section, { paddingBottom: 0 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Top Holdings
          </Text>
          {topWines.map((w) => {
            const wineRoi = w.purchasePrice > 0
              ? ((w.currentValue - w.purchasePrice) / w.purchasePrice) * 100
              : 0;
            return (
              <View
                key={w.id}
                style={[styles.topWine, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.topWineInfo}>
                  <Text style={[styles.topWineName, { color: colors.foreground }]}>
                    {w.vintage} {w.name}
                  </Text>
                  <Text style={[styles.topWineProducer, { color: colors.mutedForeground }]}>
                    {w.producer}
                  </Text>
                </View>
                <View style={styles.topWineRight}>
                  <Text style={[styles.topWineValue, { color: colors.foreground }]}>
                    ${(w.currentValue * w.quantity).toLocaleString()}
                  </Text>
                  <Text style={[styles.topWineRoi, { color: wineRoi >= 0 ? "#4CAF50" : "#F44336" }]}>
                    {wineRoi >= 0 ? "+" : ""}{wineRoi.toFixed(1)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  headerValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
    paddingTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  regionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  regionRow: {
    gap: 6,
  },
  regionLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  regionName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  regionCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  topWine: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  topWineInfo: {
    flex: 1,
    gap: 2,
  },
  topWineName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  topWineProducer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  topWineRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  topWineValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  topWineRoi: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
