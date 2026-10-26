import React, { useEffect } from 'react';
import { CheckCircle, Printer, ArrowRight, PackageCheck, Copy, Check, HardDrive } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Order } from '../types/index.ts';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderNumber: string, phone: string) => void;
  onOpenGoogleDrive?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
  onOpenGoogleDrive
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen && order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback if canvas not available
      }
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:m-0 print:border-none print:shadow-none print:bg-white print:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon & Banner */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-800 text-center">
          <div className="w-14 h-14 rounded-full bg-lime-400/10 border border-lime-400/30 flex items-center justify-center mx-auto text-lime-400 mb-3">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white font-display">
            Order Confirmed!
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Your Cash on Delivery sports apparel order has been registered and sent to our Dhaka dispatch facility.
          </p>
        </div>

        {/* Receipt Details Body */}
        <div className="overflow-y-auto p-6 space-y-5 text-xs text-zinc-300">
          
          {/* Order ID Box */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Order Reference:</span>
              <span className="text-base font-bold font-mono text-lime-400 tracking-wider">
                {order.orderNumber}
              </span>
            </div>
            <button
              onClick={handleCopyOrderNumber}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs rounded-lg border border-zinc-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Delivery & Customer Info */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">
              Delivery Destination
            </h4>
            <div className="space-y-1 text-zinc-400">
              <div className="text-zinc-200 font-semibold">{order.customer.fullName}</div>
              <div className="font-mono text-zinc-300">{order.customer.phone}</div>
              <div>{order.customer.fullAddress}, {order.customer.thana}, {order.customer.district}</div>
              {order.customer.instructions && (
                <div className="text-[11px] text-zinc-500 italic">
                  Note: "{order.customer.instructions}"
                </div>
              )}
            </div>
          </div>

          {/* Items Purchased */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">
              Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h4>
            <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-xs truncate">{item.name}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Size: {item.size} · Qty: {item.quantity} · {item.color}
                    </div>
                    {item.customPrint && (
                      <div className="text-[10px] text-lime-400 font-mono">
                        Printed: {item.customPrint.playerName} #{item.customPrint.playerNumber}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-200 shrink-0">
                    ৳{item.itemTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-200">৳{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-lime-400">
                <span>Discount ({order.couponCode}):</span>
                <span className="font-mono">-৳{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>Delivery Fee ({order.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
              <span className="font-mono text-zinc-200">
                {order.deliveryFee === 0 ? 'FREE' : `৳${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-850">
              <span>Payable on Delivery (Cash):</span>
              <span className="font-mono text-lime-400 text-base">৳{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Status reminder */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 text-[11px] leading-relaxed">
            Please keep <strong>৳{order.total.toLocaleString()}</strong> exact cash ready when the courier rider arrives. You will receive an SMS when the shipment leaves the hub.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-855 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            {onOpenGoogleDrive && (
              <button
                onClick={() => {
                  onClose();
                  onOpenGoogleDrive();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/30 transition-colors"
                title="Export Receipt to Google Drive"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Save to Google Drive</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.orderNumber, order.customer.phone);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <PackageCheck className="w-3.5 h-3.5 text-lime-400" />
              <span>Track Parcel</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-bold uppercase rounded-lg transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
