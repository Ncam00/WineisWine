import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WineCategory, useWines } from "@/context/WineContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES: WineCategory[] = [
  "red",
  "white",
  "sparkling",
  "rosé",
  "dessert",
  "fortified",
];

const CATEGORY_COLORS: Record<WineCategory, string> = {
  red: "#8B1A2A",
  white: "#B8922A",
  sparkling: "#4A7C8E",
  rosé: "#D4607A",
  dessert: "#7A4A8E",
  fortified: "#6B4423",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {label}
        {required && (
          <Text style={{ color: colors.primary }}> *</Text>
        )}
      </Text>
      {children}
    </View>
  );
}

export default function AddWineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addWine } = useWines();

  const [name, setName] = useState("");
  const [producer, setProducer] = useState("");
  const [vintage, setVintage] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [varietal, setVarietal] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [drinkFrom, setDrinkFrom] = useState("");
  const [drinkUntil, setDrinkUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [category, setCategory] = useState<WineCategory>("red");
  const [rating, setRating] = useState(3);
  const [saving, setSaving] = useState(false);

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
      color: colors.foreground,
    },
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a wine name.");
      return;
    }
    if (!vintage || isNaN(Number(vintage))) {
      Alert.alert("Required", "Please enter a valid vintage year.");
      return;
    }

    setSaving(true);
    try {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await addWine({
        name: name.trim(),
        producer: producer.trim(),
        vintage: Number(vintage),
        region: region.trim(),
        country: country.trim(),
        varietal: varietal.trim(),
        quantity: Math.max(1, Number(quantity) || 1),
        purchasePrice: Number(purchasePrice) || 0,
        currentValue: Number(currentValue) || Number(purchasePrice) || 0,
        purchaseDate: new Date().toISOString().split("T")[0],
        drinkFrom: Number(drinkFrom) || Number(vintage) + 2,
        drinkUntil: Number(drinkUntil) || Number(vintage) + 10,
        notes: notes.trim(),
        rating,
        storageLocation: storageLocation.trim(),
        category,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: Platform.OS === "web" ? 16 : 0,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>
          Add Wine
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: colors.gold }]}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.form,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Wine Name" required>
          <TextInput
            style={inputStyle}
            placeholder="e.g. Opus One"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
          />
        </Field>

        <Field label="Category">
          <View style={styles.catGrid}>
            {CATEGORIES.map((c) => {
              const active = category === c;
              const cc = CATEGORY_COLORS[c];
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? cc : colors.card,
                      borderColor: active ? cc : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: active ? "#FFFFFF" : colors.mutedForeground },
                    ]}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Producer">
              <TextInput
                style={inputStyle}
                placeholder="Producer"
                placeholderTextColor={colors.mutedForeground}
                value={producer}
                onChangeText={setProducer}
              />
            </Field>
          </View>
          <View style={{ width: 90 }}>
            <Field label="Vintage" required>
              <TextInput
                style={inputStyle}
                placeholder="2020"
                placeholderTextColor={colors.mutedForeground}
                value={vintage}
                onChangeText={setVintage}
                keyboardType="number-pad"
                maxLength={4}
              />
            </Field>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Region">
              <TextInput
                style={inputStyle}
                placeholder="e.g. Napa Valley"
                placeholderTextColor={colors.mutedForeground}
                value={region}
                onChangeText={setRegion}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Country">
              <TextInput
                style={inputStyle}
                placeholder="e.g. France"
                placeholderTextColor={colors.mutedForeground}
                value={country}
                onChangeText={setCountry}
              />
            </Field>
          </View>
        </View>

        <Field label="Grape / Varietal">
          <TextInput
            style={inputStyle}
            placeholder="e.g. Cabernet Sauvignon"
            placeholderTextColor={colors.mutedForeground}
            value={varietal}
            onChangeText={setVarietal}
          />
        </Field>

        <View style={styles.row}>
          <View style={{ width: 80 }}>
            <Field label="Quantity">
              <TextInput
                style={inputStyle}
                placeholder="1"
                placeholderTextColor={colors.mutedForeground}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Purchase Price ($)">
              <TextInput
                style={inputStyle}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="decimal-pad"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Current Value ($)">
              <TextInput
                style={inputStyle}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                value={currentValue}
                onChangeText={setCurrentValue}
                keyboardType="decimal-pad"
              />
            </Field>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Drink From (year)">
              <TextInput
                style={inputStyle}
                placeholder="2025"
                placeholderTextColor={colors.mutedForeground}
                value={drinkFrom}
                onChangeText={setDrinkFrom}
                keyboardType="number-pad"
                maxLength={4}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Drink Until (year)">
              <TextInput
                style={inputStyle}
                placeholder="2035"
                placeholderTextColor={colors.mutedForeground}
                value={drinkUntil}
                onChangeText={setDrinkUntil}
                keyboardType="number-pad"
                maxLength={4}
              />
            </Field>
          </View>
        </View>

        <Field label="Storage Location">
          <TextInput
            style={inputStyle}
            placeholder="e.g. Rack A-1"
            placeholderTextColor={colors.mutedForeground}
            value={storageLocation}
            onChangeText={setStorageLocation}
          />
        </Field>

        <Field label="Rating">
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Ionicons
                  name={n <= rating ? "star" : "star-outline"}
                  size={28}
                  color={n <= rating ? colors.gold : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Tasting Notes">
          <TextInput
            style={[inputStyle, styles.textarea]}
            placeholder="Your impressions, food pairings, or cellar notes..."
            placeholderTextColor={colors.mutedForeground}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    color: "#0B0810",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 4,
  },
  fieldWrap: {
    gap: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    minHeight: 90,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  stars: {
    flexDirection: "row",
    gap: 8,
  },
});
