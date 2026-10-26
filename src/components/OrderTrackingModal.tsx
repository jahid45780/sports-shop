import React, { useState } from 'react';
import { 
  X, 
  Search, 
  PackageCheck, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Order, OrderStatus } from '../types/index.ts';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
  initialPhone?: string;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Order Placed', desc: 'Received in system' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Stock reserved & verified' },
  { key: 'processing', label: 'In Tailoring / Packing', desc: 'Custom print & quality inspection' },
  { key: 'shipped', label: 'On Route', desc: 'Handed to courier rider' },
  { key: 'delivered', label: 'Delivered', desc: 'Collected at doorstep' }
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
  initialPhone = ''
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const order = await api.trackOrder(orderNumber.trim(), phone.trim());
      setTrackedOrder(order);
    } catch (err: any) {
      setError(err.message || 'No matching order found. Please verify order ID and phone number.');
      setTrackedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'cancelled') return 'cancelled';
    const orderIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey);
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-lime-400" />
            <h2 className="text-base font-bold uppercase font-display tracking-wider text-white">
              Track Sports Jersey Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleTrack} className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APK-2026-1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Customer Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Track Live Delivery Status</span>
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tracked Order Result View */}
          {trackedOrder && (
            <div className="space-y-5">
              
              {/* Order Status Pill Bar */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-mono">Order {trackedOrder.orderNumber}</span>
                  <div className="text-sm font-bold text-white capitalize flex items-center gap-2 mt-0.5">
                    <span>Status: {trackedOrder.orderStatus}</span>
                    {trackedOrder.paymentStatus === 'unpaid' ? (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                        ৳{trackedOrder.total} COD Due
                      </span>
                    ) : (
                      <span className="text-[10px] bg-lime-400/10 text-lime-400 px-2 py-0.5 rounded border border-lime-400/30">
                        Paid
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-zinc-400 font-mono">
                  {new Date(trackedOrder.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Visual Timeline Stepper */}
              {trackedOrder.orderStatus !== 'cancelled' ? (
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Live Dispatch Progress
                  </h4>

                  <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                    {STATUS_STEPS.map((step) => {
                      const state = getStepStatus(step.key, trackedOrder.orderStatus);
                      return (
                        <div key={step.key} className="relative">
                          <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                            state === 'completed'
                              ? 'bg-lime-400 border-lime-400 text-zinc-950'
                              : state === 'current'
                              ? 'bg-zinc-950 border-lime-400 text-lime-400 animate-pulse'
                              : 'bg-zinc-950 border-zinc-700 text-zinc-700'
                          }`}>
                            {state === 'completed' && <CheckCircle2 className="w-3 h-3 fill-current text-zinc-950" />}
                          </div>

                          <div className="text-xs font-semibold text-white">
                            {step.label}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {step.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  This order was cancelled. Stock has been restored.
                </div>
              )}

              {/* Delivery Destination */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-lime-400" />
                  <span>Destination:</span>
                </div>
                <div className="text-zinc-200">
                  {trackedOrder.customer.fullName} · {trackedOrder.customer.fullAddress}, {trackedOrder.customer.thana}, {trackedOrder.customer.district}
                </div>
              </div>

              {/* Items in order */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2 text-xs">
                <span className="text-zinc-400 font-semibold block">Parcel Items:</span>
                {trackedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-zinc-300">
                    <span>{i.name} ({i.size}) x{i.quantity}</span>
                    <span className="font-mono tabular-nums">৳{i.itemTotal}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
