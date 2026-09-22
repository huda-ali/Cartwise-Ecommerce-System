import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon, Product, ProductVariant } from '../types';
import { AVAILABLE_COUPONS } from '../data/mockData';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  savedForLater: CartItem[];
  appliedCoupon: Coupon | null;
  couponError: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  cartCount: number;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => { success: boolean; message: string };
  updateQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  saveForLater: (cartItemId: string) => void;
  moveToCartFromSaved: (cartItemId: string) => void;
  removeSavedForLater: (cartItemId: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => void;
  clearCartItemWarnings: (cartItemId: string) => void;
  mergeGuestCartIntoUserCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user ? `cartwise_cart_${user.id}` : 'cartwise_guest_cart';
  const savedKey = user ? `cartwise_saved_${user.id}` : 'cartwise_guest_saved';

  // Seed with 1 initial sample item so cart isn't empty on first glance, but easily cleared
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'cart-init-1',
        productId: 'prod-aura-one',
        productTitle: 'Aura One Wireless ANC Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80',
        brand: 'Aura',
        variantId: 'var-aura-1',
        variantTitle: 'Matte Black / Standard Hardcase',
        attributes: { Color: 'Matte Black', 'Case Edition': 'Standard Hardcase' },
        price: 349,
        compareAtPrice: 399,
        quantity: 1,
        maxStock: 24,
        isAvailable: true,
      },
    ];
  });

  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Sync to storage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  useEffect(() => {
    localStorage.setItem(savedKey, JSON.stringify(savedForLater));
  }, [savedForLater, savedKey]);

  // Merge guest cart into user cart when user logs in
  useEffect(() => {
    if (user) {
      const guestCartRaw = localStorage.getItem('cartwise_guest_cart');
      if (guestCartRaw) {
        try {
          const guestItems: CartItem[] = JSON.parse(guestCartRaw);
          if (guestItems.length > 0) {
            setCartItems((prev) => {
              const merged = [...prev];
              guestItems.forEach((gItem) => {
                const existing = merged.find((m) => m.variantId === gItem.variantId);
                if (existing) {
                  existing.quantity = Math.min(existing.quantity + gItem.quantity, existing.maxStock);
                } else {
                  merged.push(gItem);
                }
              });
              return merged;
            });
            localStorage.removeItem('cartwise_guest_cart');
          }
        } catch (e) {}
      }
    }
  }, [user]);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    if (!variant.isAvailable || variant.stock <= 0) {
      return { success: false, message: 'This variant is currently out of stock.' };
    }

    let addedOrUpdated = false;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.variantId === variant.id);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, variant.stock);
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          maxStock: variant.stock,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          isAvailable: true,
        };
        addedOrUpdated = true;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          productId: product.id,
          productTitle: product.title,
          productImage: variant.image || product.images[0],
          brand: product.brand,
          variantId: variant.id,
          variantTitle: variant.title,
          attributes: variant.attributes,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          quantity: Math.min(quantity, variant.stock),
          maxStock: variant.stock,
          isAvailable: true,
        };
        addedOrUpdated = true;
        return [...prev, newItem];
      }
    });

    return {
      success: true,
      message: `Added ${product.title} (${variant.title}) to your cart.`,
    };
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const clampedQty = Math.min(newQty, item.maxStock);
          return {
            ...item,
            quantity: clampedQty,
            priceChangedNote: clampedQty < newQty ? `Maximum available stock is ${item.maxStock}` : undefined,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const saveForLaterAction = (cartItemId: string) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
    setSavedForLater((prev) => {
      if (prev.some((s) => s.variantId === item.variantId)) return prev;
      return [...prev, item];
    });
  };

  const moveToCartFromSaved = (cartItemId: string) => {
    const item = savedForLater.find((i) => i.id === cartItemId);
    if (!item) return;
    setSavedForLater((prev) => prev.filter((i) => i.id !== cartItemId));
    setCartItems((prev) => {
      const existing = prev.find((p) => p.variantId === item.variantId);
      if (existing) {
        return prev.map((p) =>
          p.variantId === item.variantId ? { ...p, quantity: Math.min(p.quantity + 1, p.maxStock) } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeSavedForLater = (cartItemId: string) => {
    setSavedForLater((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const applyCoupon = (code: string): boolean => {
    setCouponError(null);
    const cleaned = code.trim().toUpperCase();
    const match = AVAILABLE_COUPONS.find((c) => c.code === cleaned);

    if (!match) {
      setCouponError('Invalid coupon code. Try WELCOME10 or CARTWISE25');
      return false;
    }

    if (match.minOrderAmount && subtotal < match.minOrderAmount) {
      setCouponError(`This coupon requires a minimum subtotal of $${match.minOrderAmount}.`);
      return false;
    }

    setAppliedCoupon(match);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const clearCartItemWarnings = (cartItemId: string) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, priceChangedNote: undefined } : i))
    );
  };

  const mergeGuestCartIntoUserCart = () => {
    const guestSaved = localStorage.getItem('cartwise_guest_cart');
    if (guestSaved) {
      try {
        const guestItems: CartItem[] = JSON.parse(guestSaved);
        if (guestItems.length > 0) {
          setCartItems((prev) => {
            const merged = [...prev];
            guestItems.forEach((g) => {
              const existing = merged.find((m) => m.variantId === g.variantId);
              if (existing) {
                existing.quantity = Math.min(existing.quantity + g.quantity, existing.maxStock);
              } else {
                merged.push(g);
              }
            });
            return merged;
          });
          localStorage.removeItem('cartwise_guest_cart');
        }
      } catch (e) {}
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENT') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  // Free standard shipping if subtotal > $100, else $0 as standard promo
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.95) : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = subtotal > 0 ? Number((taxableAmount * 0.0825).toFixed(2)) : 0;
  const total = Number((taxableAmount + shipping + tax).toFixed(2));
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedForLater,
        appliedCoupon,
        couponError,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        saveForLater: saveForLaterAction,
        moveToCartFromSaved,
        removeSavedForLater,
        applyCoupon,
        removeCoupon,
        clearCart,
        clearCartItemWarnings,
        mergeGuestCartIntoUserCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
