import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Product } from '../types/index.ts';

interface TeamMerchandiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const TeamMerchandiseModal: React.FC<TeamMerchandiseModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [selectedHub, setSelectedHub] = useState<string>('all');

  if (!isOpen) return null;

  const hubs = [
    { id: 'all', label: 'All Teams & Clubs' },
    { id: 'club-jerseys', label: '⚽ Football Club Editions' },
    { id: 'national-team', label: '🇧🇩 National Teams' },
    { id: 'custom-jerseys', label: '✨ Custom Printed Kits' },
    { id: 'sports-tshirts', label: '🏃 Athletic Training Tops' }
  ];

  const filteredProducts = products.filter((p) => {
    if (!p.isPublished || p.stock <= 0) return false;
    if (selectedHub !== 'all' && p.category !== selectedHub) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-merch-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="team-merch-title" className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-white">
                Team Merchandise Hub
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                100% In-Stock Verified
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Browse official club editions, national tournament kits, and athletic gear actually available in warehouse
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close Team Merchandise"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hub Tabs */}
        <div className="p-3 sm:px-6 bg-zinc-950 border-b border-zinc-800 flex gap-2 overflow-x-auto text-xs shrink-0">
          {hubs.map((h) => {
            const isSelected = selectedHub === h.id;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHub(h.id)}
                className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
                }`}
              >
                {h.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Displaying {filteredProducts.length} verified products with immediate shipping availability.</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cash on Delivery</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-850">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-lime-400 border border-zinc-800">
                      {p.team}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-zinc-800">
                      Stock: {p.stock}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{p.description}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Fabric: {p.fabric}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between mt-3">
                  <div>
                    <span className="text-sm font-black font-mono text-lime-400">৳{p.salePrice}</span>
                    <span className="text-[10px] text-zinc-500 line-through ml-1.5 font-mono">৳{p.regularPrice}</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>View Kit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <p>Official player editions with moisture-wicking Aero-Weave micro-mesh.</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
