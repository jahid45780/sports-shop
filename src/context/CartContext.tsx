import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, ProductSize, Coupon, DeliveryZone } from '../types/index.ts';
import { api } from '../services/api.ts';
import { tracking } from '../services/tracking.ts';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string, size: ProductSize, color: string) => void;
  updateQuantity: (productId: string, size: ProductSize, color: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliveryZone: DeliveryZone;
  setDeliveryZone: (zone: DeliveryZone) => void;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'apexkit_cart_items_v1';
const ZONE_STORAGE_KEY = 'apexkit_delivery_zone_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [deliveryZone, setDeliveryZoneState] = useState<DeliveryZone>(() => {
    try {
      const stored = localStorage.getItem(ZONE_STORAGE_KEY);
      return stored === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';
    } catch {
      return 'inside_dhaka';
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Store setting fees (defaults, will sync if updated)
  const [feeInside, setFeeInside] = useState(70);
  const [feeOutside, setFeeOutside] = useState(130);
  const [freeThreshold, setFreeThreshold] = useState(1999);

  useEffect(() => {
    api.getSettings().then(s => {
      setFeeInside(s.deliveryFeeInsideDhaka);
      setFeeOutside(s.deliveryFeeOutsideDhaka);
      setFreeThreshold(s.freeDeliveryThreshold);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const setDeliveryZone = (zone: DeliveryZone) => {
    setDeliveryZoneState(zone);
    localStorage.setItem(ZONE_STORAGE_KEY, zone);
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        i => i.productId === item.productId && 
             i.size === item.size && 
             i.color === item.color &&
             i.customPrint?.playerName === item.customPrint?.playerName &&
             i.customPrint?.playerNumber === item.customPrint?.playerNumber
      );

      if (existingIdx > -1) {
        const next = [...prev];
        const newQty = Math.min(next[existingIdx].maxStock, next[existingIdx].quantity + quantity);
        next[existingIdx] = { ...next[existingIdx], quantity: newQty };
        return next;
      } else {
        return [...prev, { ...item, quantity: Math.min(item.maxStock, quantity) }];
      }
    });

    setIsCartOpen(true);

    try {
      tracking.trackAddToCart({
        id: item.productId,
        name: item.name,
        sku: item.productId,
        salePrice: item.price,
        regularPrice: item.price,
        category: 'club-jerseys' as any,
        team: 'Apex Kit',
        stock: item.maxStock,
        sizes: [item.size],
        colors: [item.color],
        images: [item.image],
        description: '',
        slug: '',
        isFeatured: false,
        isBestSeller: false,
        isPublished: true,
        fabric: '',
        fitType: '',
        rating: 5,
        reviewCount: 0,
        allowCustomPrint: false,
        createdAt: ''
      }, quantity, item.size, item.color);
    } catch {
      // Non-blocking tracking
    }
  };

  const removeFromCart = (productId: string, size: ProductSize, color: string) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size && i.color === color)));
  };

  const updateQuantity = (productId: string, size: ProductSize, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.productId === productId && item.size === size && item.color === color) {
        return { ...item, quantity: Math.min(item.maxStock, quantity) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const customCost = item.customPrint?.extraCost || 0;
    return sum + (item.price + customCost) * item.quantity;
  }, 0);

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Delivery Fee calculation
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = isFreeDelivery ? 0 : (deliveryZone === 'inside_dhaka' ? feeInside : feeOutside);
  const amountNeededForFreeDelivery = Math.max(0, freeThreshold - subtotal);

  // Re-calculate coupon discount if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < appliedCoupon.minOrderAmount) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(`Coupon removed: minimum order of ৳${appliedCoupon.minOrderAmount} required.`);
      } else {
        if (appliedCoupon.discountType === 'percentage') {
          let disc = Math.round((subtotal * appliedCoupon.discountValue) / 100);
          if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
            disc = appliedCoupon.maxDiscount;
          }
          setCouponDiscount(disc);
        } else {
          setCouponDiscount(appliedCoupon.discountValue);
        }
      }
    }
  }, [subtotal, appliedCoupon]);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponDiscount(res.discountAmount);
        return true;
      } else {
        setCouponError(res.message || 'Invalid coupon code');
        return false;
      }
    } catch (e: any) {
      setCouponError(e.message || 'Error validating coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        deliveryZone,
        setDeliveryZone,
        appliedCoupon,
        couponDiscount,
        couponError,
        applyCoupon,
        removeCoupon,
        subtotal,
        deliveryFee,
        total,
        itemCount,
        freeDeliveryThreshold: freeThreshold,
        amountNeededForFreeDelivery
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
