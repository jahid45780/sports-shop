import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  AlertCircle, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { api } from '../services/api.ts';
import { tracking } from '../services/tracking.ts';
import type { Order, DeliveryZone } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

const BD_DISTRICTS = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Chittagong', 'Sylhet', 
  'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Comilla', 'Bogra', 'Noakhali', 'Feni', 'Cox\'s Bazar', 'Jessore'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderPlaced
}) => {
  const { 
    cart, 
    subtotal, 
    deliveryFee, 
    total, 
    deliveryZone, 
    setDeliveryZone, 
    appliedCoupon, 
    couponDiscount, 
    clearCart 
  } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [instructions, setInstructions] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && cart.length > 0) {
      try {
        tracking.trackBeginCheckout(cart, total);
      } catch {
        // Non-blocking tracking
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-switch delivery zone when district changes
  const handleDistrictChange = (selected: string) => {
    setDistrict(selected);
    if (selected === 'Dhaka') {
      setDeliveryZone('inside_dhaka');
    } else {
      setDeliveryZone('outside_dhaka');
    }
  };

  const validatePhoneBD = (p: string) => {
    const clean = p.replace(/[^0-9]/g, '');
    // Bangladeshi mobile: 11 digits, starts with 01
    return clean.length === 11 && clean.startsWith('01');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!validatePhoneBD(phone)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    if (!district || !thana.trim() || !fullAddress.trim()) {
      setErrorMessage('Please provide complete delivery address with District, Thana, and House/Road details.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          district: district.trim(),
          thana: thana.trim(),
          fullAddress: fullAddress.trim(),
          instructions: instructions.trim() || undefined
        },
        items: cart.map(item => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          customPrint: item.customPrint
        })),
        deliveryZone,
        couponCode: appliedCoupon?.code
      };

      const res = await api.createOrder(payload);

      if (res.success && res.order) {
        clearCart();
        onClose();
        onOrderPlaced(res.order);
      } else {
        setErrorMessage(res.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while submitting order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-lime-400" />
            <h2 className="text-base font-bold uppercase font-display tracking-wider text-white">
              Cash on Delivery Checkout
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-6 space-y-6">
          
          {/* Top Info Banner */}
          <div className="p-3.5 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300">
              <span className="font-bold text-white">No online prepayment needed.</span> Inspect your jersey when delivered to your address, verify the fabric and fit, and pay cash directly to the courier delivery agent.
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Delivery Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Customer & Delivery Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name <span className="text-lime-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Mahmud"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mobile Number (Bangladesh) <span className="text-lime-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Rider will call this number before arrival.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address <span className="text-zinc-500 font-normal">(Optional for invoice receipt)</span>
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  District <span className="text-lime-400">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                >
                  {BD_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Thana / Upazila <span className="text-lime-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhanmondi / Mirpur / Nasirabad"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Full Street Address, House & Road No <span className="text-lime-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. House #24, Road #7, Block C, Apt 3B, Dhanmondi, Dhaka"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Special Delivery Instructions <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Deliver afternoon, or leave with building security guard"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Payment Method
            </h3>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-lime-400/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-lime-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Cash on Delivery (COD)</div>
                  <div className="text-[11px] text-zinc-400">Pay cash directly when parcel is received</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-lime-400 uppercase font-bold tracking-wider">
                Official Standard
              </span>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wide text-zinc-400 pb-2 border-b border-zinc-850">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </h4>
            
            <div className="max-h-36 overflow-y-auto divide-y divide-zinc-900 pr-1">
              {cart.map(item => (
                <div key={`${item.productId}-${item.size}`} className="py-2 flex items-center justify-between">
                  <div className="truncate max-w-[240px]">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="text-zinc-500 font-mono text-[10px] ml-1.5">
                      ({item.size} x{item.quantity})
                    </span>
                  </div>
                  <span className="font-mono text-zinc-300 tabular-nums">
                    ৳{((item.price + (item.customPrint?.extraCost || 0)) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-850 space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200 tabular-nums">৳{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-lime-400">
                  <span>Coupon Discount</span>
                  <span className="font-mono tabular-nums">-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Delivery Charge ({deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-mono text-zinc-200 tabular-nums">
                  {deliveryFee === 0 ? <span className="text-lime-400 font-bold uppercase">FREE</span> : `৳${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Payable on Delivery:</span>
                <span className="text-base text-lime-400 font-mono tabular-nums">৳{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-400/10 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Order — Pay ৳{total.toLocaleString()} on Delivery</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
