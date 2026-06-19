"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  addLine,
  createCart,
  getCart,
  removeLine,
  updateLine,
  type Cart,
} from "@/lib/shopify-cart";

type CartContextValue = {
  cart: Cart | null;
  /** True while a cart mutation is in flight. */
  pending: boolean;
  totalCount: number;
  addItem: (variantId: string, quantity?: number) => void;
  updateQty: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "daily-grind-cart-id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [pending, startTransition] = useTransition();

  // On mount, restore the saved cart id and refetch the live cart from Shopify.
  useEffect(() => {
    const id = localStorage.getItem(STORAGE_KEY);
    if (!id) return;
    startTransition(async () => {
      try {
        const restored = await getCart(id);
        if (restored) setCart(restored);
        else localStorage.removeItem(STORAGE_KEY); // stale/expired cart
      } catch {
        // leave cart empty if Shopify is unreachable
      }
    });
  }, []);

  // Persist the cart id whenever it changes.
  function persist(next: Cart | null) {
    setCart(next);
    if (next) localStorage.setItem(STORAGE_KEY, next.id);
    else localStorage.removeItem(STORAGE_KEY);
  }

  const addItem: CartContextValue["addItem"] = (variantId, quantity = 1) => {
    startTransition(async () => {
      try {
        const next = cart
          ? await addLine(cart.id, variantId, quantity)
          : await createCart(variantId, quantity);
        persist(next);
      } catch {
        // ignore; UI stays on previous cart state
      }
    });
  };

  const updateQty: CartContextValue["updateQty"] = (lineId, quantity) => {
    if (!cart) return;
    startTransition(async () => {
      try {
        const next =
          quantity <= 0
            ? await removeLine(cart.id, lineId)
            : await updateLine(cart.id, lineId, quantity);
        persist(next);
      } catch {
        // ignore
      }
    });
  };

  const removeItem: CartContextValue["removeItem"] = (lineId) => {
    if (!cart) return;
    startTransition(async () => {
      try {
        persist(await removeLine(cart.id, lineId));
      } catch {
        // ignore
      }
    });
  };

  const clear = () => persist(null);

  const value: CartContextValue = {
    cart,
    pending,
    totalCount: cart?.totalQuantity ?? 0,
    addItem,
    updateQty,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
