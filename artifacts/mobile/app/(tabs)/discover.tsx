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

const BUYING_OPPORTUNITIES = [
  {
    name: "2020 Pomerol AOC",
    producer: "Various",
    region: "Bordeaux, France",
    reason: "Right Bank undervalued post-2020 vintage reassessment",
    discount: "~15% below market",
    icon: "trending-up" as const,
  },
  {
    name: "2019 Barolo DOCG",
    producer: "Langhe region",
    region: "Piedmont, Italy",
    reason: "Exceptional vintage, currently underappreciated internationally",
    discount: "~12% below peers",
    icon: "star" as const,
  },
  {
    name: "2021 Margaret River Cab",
    producer: "Western Australia",
    region: "Australia",
    reason: "Cool climate vintage, superb structure, under the radar",
    discount: "~20% below Napa equivalent",
    icon: "diamond" as const,
  },
];

const MARKET_TRENDS = [
  {
    title: "Burgundy demand rising",
    body: "Premier Cru Burgundy up 8% in the last quarter. Consider acquiring before prices climb further.",
    trend: "+8%",
    positive: true,
  },
  {
    title: "Napa Cab stabilising",
    body: "After two years of rapid appreciation, top Napa Cabernets are settling. Good time to hold.",
    trend: "~flat",
    positive: null,
  },
  {
    title: "Champagne momentum",
    body: "Prestige cuvées seeing renewed collector interest. DP, Cristal, and Salon leading the way.",
    trend: "+5%",
    positive: true,
  },
  {
    title: "Rhône corrections",
    body: "Some over-valued Rhône bottles correcting 5-10%. Review your holdings for rebalancing.",
    trend: "-7%",
    positive: false,
  },
];

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { wines } = useWines();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const agentInsights = useMemo(() => {
    const insights: Array<{
      icon: keyof typeof Ionicons.glyphMap;
      iconColor?: string;
      title: string;
      body: string;
      accent?: boolean;
    }> = [];

    const peakingNow = wines.filter(
      (w) => currentYear >= w.drinkFrom && currentYear <= w.drinkUntil
    );
    if (peakingNow.length > 0) {
      const best = peakingNow[0];
      insights.push({
        icon: "wine",
        iconColor: colors.gold,
        title: `Tonight: ${best.vintage} ${best.name}`,
        body: `Your ${best.producer} from ${best.region} is at peak drinking window. Ideal for tonight.`,
        accent: true,
      });
    }

    const redCount = wines.reduce(
      (s, w) => s + (w.category === "red" ? w.quantity : 0),
      0
    );
    const totalBottles = wines.reduce((s, w) => s + w.quantity, 0);
    if (totalBottles > 0 && redCount / totalBottles > 0.6) {
      insights.push({
        icon: "pie-chart",
        title: "Consider diversifying",
        body: "Your cellar leans heavily red. Adding Champagne or quality Burgundy white could improve balance and investment profile.",
      });
    }

    const highROI = wines
      .filter(
        (w) =>
          w.purchasePrice > 0 &&
          (w.currentValue - w.purchasePrice) / w.purchasePrice > 0.15
      )
      .sort(
        (a, b) =>
          (b.currentValue - b.purchasePrice) / b.purchasePrice -
          (a.currentValue - a.purchasePrice) / a.purchasePrice
      );

    if (highROI.length > 0) {
      const top = highROI[0];
      const roi = ((top.currentValue - top.purchasePrice) / top.purchasePrice) * 100;
      insights.push({
        icon: "trending-up",
        iconColor: "#4CAF50",
        title: `${top.name} up ${roi.toFixed(0)}%`,
        body: `Strongest performer in your cellar. Consider whether to hold for further appreciation or lock in gains.`,
      });
    }

    return insights;
  }, [wines, colors]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.burgundy + "99", colors.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.gold }]}>
            <Ionicons name="sparkles" size={18} color="#0B0810" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.primaryForeground }]}>
              Discover
            </Text>
            <Text style={[styles.headerSub, { color: colors.primaryForeground + "AA" }]}>
              AI-powered insights & opportunities
            </Text>
          </View>
        </View>
      </LinearGradient>

      {agentInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Your Cellar Agents
          </Text>
          {agentInsights.map((ins, i) => (
            <InsightCard key={i} {...ins} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Buying Opportunities
        </Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          AI-identified undervalued wines
        </Text>
        {BUYING_OPPORTUNITIES.map((opp, i) => (
          <View
            key={i}
            style={[styles.oppCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.oppHeader}>
              <View style={styles.oppInfo}>
                <Text style={[styles.oppName, { color: colors.foreground }]}>
                  {opp.name}
                </Text>
                <Text style={[styles.oppRegion, { color: colors.mutedForeground }]}>
                  {opp.region}
                </Text>
              </View>
              <View style={[styles.discountBadge, { backgroundColor: "#1A3A1A" }]}>
                <Text style={styles.discountText}>{opp.discount}</Text>
              </View>
            </View>
            <Text style={[styles.oppReason, { color: colors.mutedForeground }]}>
              {opp.reason}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Market Pulse
        </Text>
        {MARKET_TRENDS.map((trend, i) => (
          <View
            key={i}
            style={[styles.trendCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.trendHeader}>
              <Text style={[styles.trendTitle, { color: colors.foreground }]}>
                {trend.title}
              </Text>
              <Text
                style={[
                  styles.trendBadge,
                  {
                    color:
                      trend.positive === true
                        ? "#4CAF50"
                        : trend.positive === false
                        ? "#F44336"
                        : colors.mutedForeground,
                  },
                ]}
              >
                {trend.trend}
              </Text>
            </View>
            <Text style={[styles.trendBody, { color: colors.mutedForeground }]}>
              {trend.body}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, styles.agentSection]}>
        <View style={[styles.agentCard, { backgroundColor: colors.card, borderColor: colors.primary + "44" }]}>
          <LinearGradient
            colors={[colors.primary + "22", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="sparkles" size={24} color={colors.gold} />
          <Text style={[styles.agentTitle, { color: colors.foreground }]}>
            Fraud & Authenticity Agent
          </Text>
          <Text style={[styles.agentBody, { color: colors.mutedForeground }]}>
            Our provenance AI detects suspicious pricing, fake bottle indicators,
            and auction irregularities. Coming soon for premium subscribers.
          </Text>
          <View style={[styles.comingSoon, { backgroundColor: colors.gold + "22" }]}>
            <Text style={[styles.comingSoonText, { color: colors.gold }]}>
              Coming Soon
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  oppCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  oppHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  oppInfo: {
    flex: 1,
    gap: 2,
  },
  oppName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  oppRegion: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#4CAF50",
  },
  oppReason: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  trendCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  trendBadge: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  trendBody: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  agentSection: {
    paddingBottom: 8,
  },
  agentCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    overflow: "hidden",
  },
  agentTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  agentBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  comingSoon: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
