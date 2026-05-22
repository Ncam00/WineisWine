import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWines } from "@/context/WineContext";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "intro",
    role: "assistant",
    content:
      "Welcome to your AI Sommelier. I can help you with wine pairings, drinking windows, cellar strategy, and insights about your collection. What would you like to know?",
  },
];

const SUGGESTIONS = [
  "What should I drink tonight?",
  "Analyse my cellar",
  "Best wine for a steak dinner?",
  "Which bottles are underperforming?",
];

export default function SommelierScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { wines } = useWines();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
      };

      const history = messages.filter((m) => m.id !== "intro");
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      try {
        const domain = process.env.EXPO_PUBLIC_DOMAIN;
        const baseUrl = domain ? `https://${domain}` : "";

        const res = await fetch(`${baseUrl}/api/sommelier/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            wines: wines.map((w) => ({
              name: w.name,
              producer: w.producer,
              vintage: w.vintage,
              region: w.region,
              country: w.country,
              varietal: w.varietal,
              quantity: w.quantity,
              purchasePrice: w.purchasePrice,
              currentValue: w.currentValue,
              drinkFrom: w.drinkFrom,
              drinkUntil: w.drinkUntil,
              category: w.category,
              rating: w.rating,
              notes: w.notes,
            })),
            history: history.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            data.message ||
            data.error ||
            "I'm unable to respond right now. Please check your AI integration setup.",
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Connection error. Please ensure the API server is running and AI integration is configured.",
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [messages, wines]
  );

  const handleSend = () => {
    if (input.trim() && !loading) {
      sendMessage(input.trim());
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          {
            backgroundColor: isUser ? colors.primary : colors.card,
            borderColor: isUser ? "transparent" : colors.border,
          },
        ]}
      >
        {!isUser && (
          <View style={[styles.avatarDot, { backgroundColor: colors.gold }]} />
        )}
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? colors.primaryForeground : colors.foreground },
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.burgundy + "99", colors.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.aiDot, { backgroundColor: colors.gold }]}>
            <Ionicons name="sparkles" size={16} color="#0B0810" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.primaryForeground }]}>
              AI Sommelier
            </Text>
            <Text style={[styles.headerSub, { color: colors.primaryForeground + "AA" }]}>
              Powered by GPT · {wines.length} wines in context
            </Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 12 },
        ]}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={renderMessage}
        ListFooterComponent={
          loading ? (
            <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={[styles.typingText, { color: colors.mutedForeground }]}>
                Sommelier is thinking...
              </Text>
            </View>
          ) : messages.length === 1 ? (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => sendMessage(s)}
                  style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  <Text style={[styles.chipText, { color: colors.foreground }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted }]}
            placeholder="Ask your sommelier..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || loading}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  input.trim() && !loading ? colors.gold : colors.muted,
              },
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={input.trim() && !loading ? "#0B0810" : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
  aiDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  userBubble: {
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  avatarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  typingText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 8,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
