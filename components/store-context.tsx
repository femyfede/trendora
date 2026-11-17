"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type {
  CartItem,
  Currency,
  Discount,
  Language,
  Product,
  WishlistItem
} from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { LANGUAGE_COOKIE, pick, translate, type TranslationKey } from "@/lib/i18n";

const KEYS = {
  cart: "trendora:v1:cart",
  wishlist: "trendora:v1:wishlist",
  currency: "trendora:v1:currency",
  discount: "trendora:v1:discount"
};

type Toast = {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
};

type AddToCartInput = {
  product: Pick<Product, "id" | "slug" | "name" | "images" | "price" | "stock">;
  size: string;
  color: string;
  qty?: number;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

type StoreContextValue = {
  user: SessionUser | null;
  userLoaded: boolean;
  refreshUser: () => Promise<SessionUser | null>;
  setUser: (user: SessionUser | null) => void;
  tr: (en: string, sw: string) => string;
  hydrated: boolean;
  cart: CartItem[];
  wishlist: WishlistItem[];
  currency: Currency;
  language: Language;
  discount: Discount | null;
  cartCount: number;
  wishlistCount: number;
  cartSubtotal: number;
  addToCart: (input: AddToCartInput) => void;
  updateQty: (lineId: string, qty: number) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setCurrency: (currency: Currency) => void;
  setLanguage: (language: Language) => void;
  applyDiscount: (discount: Discount | null) => void;
  format: (amount: number) => string;
  t: (key: TranslationKey) => string;
  toast: (message: string, variant?: Toast["variant"]) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({
  children,
  initialLanguage = "sw"
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("TZS");
  // The language comes from a cookie read on the server, so the first render is
  // already in the right language (Kiswahili by default) with no flash.
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setCart(read<CartItem[]>(KEYS.cart, []));
    setWishlist(read<WishlistItem[]>(KEYS.wishlist, []));
    setCurrencyState(read<Currency>(KEYS.currency, "TZS"));
    setDiscount(read<Discount | null>(KEYS.discount, null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEYS.cart, JSON.stringify(cart));
      window.localStorage.setItem(KEYS.wishlist, JSON.stringify(wishlist));
      window.localStorage.setItem(KEYS.currency, JSON.stringify(currency));
      window.localStorage.setItem(KEYS.discount, JSON.stringify(discount));
    } catch {
      // Storage can be unavailable in private modes; the session still works.
    }
  }, [cart, wishlist, currency, discount, hydrated]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await response.json()) as { user: SessionUser | null };
      setUser(data.user ?? null);
      return data.user ?? null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setUserLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEYS.cart) setCart(read<CartItem[]>(KEYS.cart, []));
      if (event.key === KEYS.wishlist)
        setWishlist(read<WishlistItem[]>(KEYS.wishlist, []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toast = useCallback(
    (message: string, variant: Toast["variant"] = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 4200);
    },
    []
  );

  const addToCart = useCallback(
    ({ product, size, color, qty = 1 }: AddToCartInput) => {
      const lineId = `${product.id}::${size}::${color}`;
      setCart((current) => {
        const existing = current.find((item) => item.lineId === lineId);
        if (existing) {
          return current.map((item) =>
            item.lineId === lineId
              ? {
                  ...item,
                  qty: Math.min(product.stock, item.qty + qty),
                  stock: product.stock
                }
              : item
          );
        }
        return [
          ...current,
          {
            lineId,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price: product.price,
            size,
            color,
            qty: Math.min(product.stock, Math.max(1, qty)),
            stock: product.stock
          }
        ];
      });
      toast(pick(language, `${product.name} added to your cart`, `${product.name} imewekwa kwenye kikapu`));
    },
    [language, toast]
  );

  const updateQty = useCallback((lineId: string, qty: number) => {
    setCart((current) =>
      current.map((item) =>
        item.lineId === lineId
          ? { ...item, qty: Math.max(1, Math.min(item.stock, qty)) }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((lineId: string) => {
    setCart((current) => current.filter((item) => item.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(null);
  }, []);

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((current) => {
        const exists = current.some((item) => item.productId === product.id);
        if (exists) {
          toast(pick(language, "Removed from saved items", "Imeondolewa kwenye ulivyopenda"), "info");
          return current.filter((item) => item.productId !== product.id);
        }
        toast(pick(language, "Saved to your list", "Imehifadhiwa kwenye ulivyopenda"));
        return [
          ...current,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price: product.price
          }
        ];
      });
    },
    [language, toast]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.some((item) => item.productId === productId),
    [wishlist]
  );

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const setCurrency = useCallback((next: Currency) => setCurrencyState(next), []);
  const setLanguage = useCallback(
    (next: Language) => {
      setLanguageState(next);
      document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      document.documentElement.lang = next;
      // Re-render server components (page text, metadata) in the new language.
      router.refresh();
    },
    [router]
  );
  const applyDiscount = useCallback(
    (next: Discount | null) => setDiscount(next),
    []
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );
  const wishlistCount = wishlist.length;
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const format = useCallback(
    (amount: number) => formatPrice(amount, currency),
    [currency]
  );
  const t = useCallback(
    (key: TranslationKey) => translate(key, language),
    [language]
  );
  const tr = useCallback((en: string, sw: string) => pick(language, en, sw), [language]);

  const value: StoreContextValue = {
    user,
    userLoaded,
    refreshUser,
    setUser,
    tr,
    hydrated,
    cart,
    wishlist,
    currency,
    language,
    discount,
    cartCount,
    wishlistCount,
    cartSubtotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    removeFromWishlist,
    isWishlisted,
    setCurrency,
    setLanguage,
    applyDiscount,
    format,
    t,
    toast
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-[120] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-lift animate-fade-up",
              item.variant === "error" && "border-red-200",
              item.variant === "success" && "border-emerald-200",
              item.variant === "info" && "border-zinc-200"
            )}
          >
            {item.variant === "success" && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            )}
            {item.variant === "error" && (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            {item.variant === "info" && (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            )}
            <p className="flex-1 text-sm font-medium text-ink">{item.message}</p>
            <button
              type="button"
              onClick={() =>
                setToasts((current) => current.filter((t) => t.id !== item.id))
              }
              className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-ink"
              aria-label={pick(language, "Dismiss notification", "Funga taarifa")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
