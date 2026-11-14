"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
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
import { translate, type TranslationKey } from "@/lib/i18n";

const KEYS = {
  cart: "trendora:v1:cart",
  wishlist: "trendora:v1:wishlist",
  currency: "trendora:v1:currency",
  language: "trendora:v1:language",
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

type StoreContextValue = {
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("TZS");
  const [language, setLanguageState] = useState<Language>("sw");
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setCart(read<CartItem[]>(KEYS.cart, []));
    setWishlist(read<WishlistItem[]>(KEYS.wishlist, []));
    setCurrencyState(read<Currency>(KEYS.currency, "TZS"));
    setLanguageState(read<Language>(KEYS.language, "en"));
    setDiscount(read<Discount | null>(KEYS.discount, null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEYS.cart, JSON.stringify(cart));
      window.localStorage.setItem(KEYS.wishlist, JSON.stringify(wishlist));
      window.localStorage.setItem(KEYS.currency, JSON.stringify(currency));
      window.localStorage.setItem(KEYS.language, JSON.stringify(language));
      window.localStorage.setItem(KEYS.discount, JSON.stringify(discount));
    } catch {
      // Storage can be unavailable in private modes; the session still works.
    }
  }, [cart, wishlist, currency, language, discount, hydrated]);

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
      toast(
        language === "sw"
          ? `${product.name} imeongezwa kwenye kikapu`
          : `${product.name} added to cart`
      );
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
          toast(
            language === "sw"
              ? "Imeondolewa kwenye orodha ya kupenda"
              : "Removed from wishlist",
            "info"
          );
          return current.filter((item) => item.productId !== product.id);
        }
        toast(
          language === "sw" ? "Imeongezwa kwenye orodha ya kupenda" : "Added to wishlist"
        );
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
  const setLanguage = useCallback((next: Language) => setLanguageState(next), []);
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

  const value: StoreContextValue = {
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
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
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
              aria-label="Dismiss notification"
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
