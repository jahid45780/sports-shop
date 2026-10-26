import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  Truck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreProducts
}) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
    deliveryZone,
    setDeliveryZone,
    appliedCoupon,
    couponDiscount,
    couponError,
    applyCoupon,
    removeCoupon,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={() => setIsCartOpen(false)} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-lime-400" />
              <h2 className="text-base font-bold uppercase font-display tracking-wider text-white">
                Your Shopping Bag ({cart.reduce((c, i) => c + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          <div className="px-6 py-3 bg-zinc-950/60 border-b border-zinc-850">
            {amountNeededForFreeDelivery > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">
                    Add <span className="font-bold text-lime-400 font-mono">৳{amountNeededForFreeDelivery}</span> more for Free Delivery!
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-lime-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-lime-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>You unlocked FREE Delivery nationwide!</span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${item.customPrint?.playerName || ''}`}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex gap-3 relative"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover bg-zinc-900 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="font-mono text-zinc-300 font-semibold">{item.size}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.color}</span>
                      </div>

                      {item.customPrint && (
                        <div className="mt-1 text-[10px] text-lime-400 font-mono flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>PRINT: {item.customPrint.playerName} #{item.customPrint.playerNumber} (+৳{item.customPrint.extraCost})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold font-mono text-white tabular-nums">
                        ৳{((item.price + (item.customPrint?.extraCost || 0)) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="text-zinc-500 hover:text-red-400 p-1 self-start transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-white uppercase font-display">
                  Your bag is empty
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Pick your favorite football clubs, national team kits, or gym performance gear.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreProducts();
                  }}
                  className="mt-4 px-4 py-2 bg-lime-400 text-zinc-950 font-bold text-xs uppercase rounded-lg hover:bg-lime-300 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer with Calculations & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 bg-zinc-950 border-t border-zinc-800 space-y-4">
              
              {/* Delivery Zone Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-lime-400" />
                    Delivery Location:
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-center border transition-all ${
                      deliveryZone === 'inside_dhaka'
                        ? 'bg-zinc-850 border-lime-400 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Inside Dhaka (৳70)
                  </button>
                  <button
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-center border transition-all ${
                      deliveryZone === 'outside_dhaka'
                        ? 'bg-zinc-850 border-lime-400 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Outside Dhaka (৳130)
                  </button>
                </div>
              </div>

              {/* Promo Code Input */}
              <div>
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Promo code (e.g. APEX10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-lime-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-lime-400/10 border border-lime-400/30 text-xs">
                    <div className="flex items-center gap-1.5 text-lime-400 font-mono font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code} Applied (-৳{couponDiscount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-zinc-400 hover:text-red-400 font-sans text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <div className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs border-t border-zinc-850 pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200 tabular-nums">৳{subtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-lime-400">
                    <span>Promo Discount</span>
                    <span className="font-mono tabular-nums">-৳{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery Fee</span>
                  <span className="font-mono text-zinc-200 tabular-nums">
                    {deliveryFee === 0 ? <span className="text-lime-400 font-bold uppercase">FREE</span> : `৳${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-850">
                  <span>Payable Total (COD)</span>
                  <span className="font-mono text-lg text-lime-400 tabular-nums">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-lime-400/10"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
