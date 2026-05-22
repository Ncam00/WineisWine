import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type WineCategory =
  | "red"
  | "white"
  | "sparkling"
  | "dessert"
  | "fortified"
  | "rosé";

export interface Wine {
  id: string;
  name: string;
  producer: string;
  vintage: number;
  region: string;
  country: string;
  varietal: string;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  drinkFrom: number;
  drinkUntil: number;
  notes: string;
  rating: number;
  storageLocation: string;
  category: WineCategory;
}

const SAMPLE_WINES: Wine[] = [
  {
    id: "1",
    name: "Opus One",
    producer: "Opus One Winery",
    vintage: 2018,
    region: "Napa Valley",
    country: "USA",
    varietal: "Cabernet Sauvignon blend",
    quantity: 3,
    purchasePrice: 350,
    currentValue: 425,
    purchaseDate: "2020-06-15",
    drinkFrom: 2025,
    drinkUntil: 2040,
    notes: "Exceptional Napa Bordeaux-style blend. Deep cassis and cedar.",
    rating: 5,
    storageLocation: "Rack A-1",
    category: "red",
  },
  {
    id: "2",
    name: "Dom Pérignon",
    producer: "Moët & Chandon",
    vintage: 2013,
    region: "Champagne",
    country: "France",
    varietal: "Chardonnay / Pinot Noir",
    quantity: 2,
    purchasePrice: 200,
    currentValue: 285,
    purchaseDate: "2021-12-24",
    drinkFrom: 2023,
    drinkUntil: 2033,
    notes: "Creamy and complex. Toasty brioche with vibrant citrus finish.",
    rating: 5,
    storageLocation: "Fridge B-2",
    category: "sparkling",
  },
  {
    id: "3",
    name: "Barolo Cascina Francia",
    producer: "Giacomo Conterno",
    vintage: 2017,
    region: "Piedmont",
    country: "Italy",
    varietal: "Nebbiolo",
    quantity: 1,
    purchasePrice: 150,
    currentValue: 200,
    purchaseDate: "2022-03-10",
    drinkFrom: 2027,
    drinkUntil: 2042,
    notes: "Traditional Barolo. Incredible structure. Needs more time.",
    rating: 4,
    storageLocation: "Rack C-3",
    category: "red",
  },
  {
    id: "4",
    name: "Grange",
    producer: "Penfolds",
    vintage: 2018,
    region: "Barossa Valley",
    country: "Australia",
    varietal: "Shiraz",
    quantity: 2,
    purchasePrice: 800,
    currentValue: 960,
    purchaseDate: "2021-09-05",
    drinkFrom: 2028,
    drinkUntil: 2045,
    notes: "Australia's greatest wine. Dense, concentrated, and extraordinary.",
    rating: 5,
    storageLocation: "Rack A-5",
    category: "red",
  },
  {
    id: "5",
    name: "Sauvignon Blanc",
    producer: "Cloudy Bay",
    vintage: 2022,
    region: "Marlborough",
    country: "New Zealand",
    varietal: "Sauvignon Blanc",
    quantity: 6,
    purchasePrice: 32,
    currentValue: 35,
    purchaseDate: "2023-01-20",
    drinkFrom: 2023,
    drinkUntil: 2026,
    notes: "Classic Marlborough style. Vibrant passionfruit and grapefruit.",
    rating: 3,
    storageLocation: "Fridge A-1",
    category: "white",
  },
];

const STORAGE_KEY = "vinoq_wines_v1";

interface WineContextType {
  wines: Wine[];
  addWine: (wine: Omit<Wine, "id">) => Promise<void>;
  updateWine: (id: string, updates: Partial<Wine>) => Promise<void>;
  deleteWine: (id: string) => Promise<void>;
  getWine: (id: string) => Wine | undefined;
  totalValue: number;
  totalPurchaseValue: number;
  isLoading: boolean;
}

const WineContext = createContext<WineContextType | null>(null);

export function WineProvider({ children }: { children: React.ReactNode }) {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWines(JSON.parse(stored));
      } else {
        setWines(SAMPLE_WINES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_WINES));
      }
    } catch {
      setWines(SAMPLE_WINES);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWines = async (updated: Wine[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setWines(updated);
  };

  const addWine = useCallback(
    async (wine: Omit<Wine, "id">) => {
      const newWine: Wine = {
        ...wine,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      };
      await saveWines([...wines, newWine]);
    },
    [wines]
  );

  const updateWine = useCallback(
    async (id: string, updates: Partial<Wine>) => {
      const updated = wines.map((w) => (w.id === id ? { ...w, ...updates } : w));
      await saveWines(updated);
    },
    [wines]
  );

  const deleteWine = useCallback(
    async (id: string) => {
      const updated = wines.filter((w) => w.id !== id);
      await saveWines(updated);
    },
    [wines]
  );

  const getWine = useCallback(
    (id: string) => wines.find((w) => w.id === id),
    [wines]
  );

  const totalValue = wines.reduce(
    (sum, w) => sum + w.currentValue * w.quantity,
    0
  );
  const totalPurchaseValue = wines.reduce(
    (sum, w) => sum + w.purchasePrice * w.quantity,
    0
  );

  return (
    <WineContext.Provider
      value={{
        wines,
        addWine,
        updateWine,
        deleteWine,
        getWine,
        totalValue,
        totalPurchaseValue,
        isLoading,
      }}
    >
      {children}
    </WineContext.Provider>
  );
}

export function useWines() {
  const ctx = useContext(WineContext);
  if (!ctx) throw new Error("useWines must be used inside WineProvider");
  return ctx;
}
