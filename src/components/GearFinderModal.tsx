import React, { useState } from 'react';
import { X, Compass, Check, ArrowRight, RotateCcw, ShoppingBag, Eye } from 'lucide-react';
import type { Product, ProductSize, ProductCategory } from '../types/index.ts';

interface GearFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const GearFinderModal: React.FC<GearFinderModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(2000);

  if (!isOpen) return null;

  // Filter actual products from inventory
  const filteredProducts = products.filter((p) => {
    if (!p.isPublished || p.stock <= 0) return false;

    // Sport / Team filter
    if (selectedSport === 'football') {
      if (p.category === 'sports-tshirts') return false;
    } else if (selectedSport === 'cricket') {
      if (p.team !== 'National Squad' && p.category !== 'sports-tshirts') return false;
    } else if (selectedSport === 'training') {
      if (p.category !== 'sports-tshirts') return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    // Size filter
    if (selectedSize !== 'all' && !p.sizes.includes(selectedSize as ProductSize)) {
      return false;
    }

    // Budget filter
    if (p.salePrice > maxBudget) {
      return false;
    }

    return true;
  });

  const handleReset = () => {
    setStep(1);
    setSelectedSport('all');
    setSelectedCategory('all');
    setSelectedSize('all');
    setMaxBudget(2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gear-finder-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="gear-finder-title" className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-white">
                  Smart Sports Gear Finder
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                  Step {step} of 4
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Filter by sport, body size, category, and budget to find available stock immediately
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close Gear Finder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="px-6 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`w-7 h-7 rounded-full text-xs font-bold font-mono transition-all flex items-center justify-center ${
                  step === s
                    ? 'bg-lime-400 text-zinc-950 shadow-sm'
                    : step > s
                    ? 'bg-zinc-800 text-lime-400 border border-lime-400/30'
                    : 'bg-zinc-900 text-zinc-500'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Criteria</span>
          </button>
        </div>

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* STEP 1: SPORT */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Step 1: What sport or activity are you shopping for?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'all', title: 'Any Sport / Lifestyle', desc: 'Browse full sports apparel catalog' },
                  { id: 'football', title: 'Football & Futsal', desc: 'Club jerseys, national team kits, player prints' },
                  { id: 'cricket', title: 'Cricket & National Squad', desc: 'Bangladesh Tigers green & red kits' },
                  { id: 'training', title: 'Gym & Fitness Tops', desc: 'Breathable micro-mesh training t-shirts' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSport(s.id);
                      setStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedSport === s.id
                        ? 'border-lime-400 bg-lime-400/5 ring-1 ring-lime-400/30'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <h4 className="text-sm font-bold text-white">{s.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Step 2: Choose preferred apparel category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'all', title: 'All Collections' },
                  { id: 'club-jerseys', title: 'European Club Football Jerseys' },
                  { id: 'national-team', title: 'National Team Championship Kits' },
                  { id: 'custom-jerseys', title: 'Custom Printed Name & Number Kits' },
                  { id: 'sports-tshirts', title: 'High-Performance Training T-Shirts' },
                  { id: 'retro-classics', title: 'Retro 90s Vintage Kits' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setStep(3);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedCategory === c.id
                        ? 'border-lime-400 bg-lime-400/5 ring-1 ring-lime-400/30'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-white">{c.title}</h4>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SIZE */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Step 3: Select your jersey size
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'all', label: 'Any Size' },
                  { id: 'S', label: 'Small (Chest 38")' },
                  { id: 'M', label: 'Medium (Chest 40")' },
                  { id: 'L', label: 'Large (Chest 42")' },
                  { id: 'XL', label: 'Extra Large (Chest 44")' },
                  { id: 'XXL', label: 'Double XL (Chest 46")' }
                ].map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => {
                      setSelectedSize(sz.id);
                      setStep(4);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedSize === sz.id
                        ? 'border-lime-400 bg-lime-400/5 ring-1 ring-lime-400/30'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm font-bold text-white block">{sz.id}</span>
                    <span className="text-[11px] text-zinc-400">{sz.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET & RESULTS */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-zinc-300">Max Budget Limit:</span>
                  <span className="font-mono font-black text-lime-400 text-sm">৳{maxBudget} BDT</span>
                </div>
                <input
                  type="range"
                  min={700}
                  max={2000}
                  step={50}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-lime-400"
                />
              </div>

              {/* Matched Products */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Matched Products in Stock ({filteredProducts.length})
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-semibold">Ready for Cash on Delivery</span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 space-y-2">
                    <p className="text-xs">No products match your exact criteria.</p>
                    <button
                      onClick={handleReset}
                      className="text-xs text-lime-400 font-bold underline"
                    >
                      Broaden filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-3"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-xl border border-zinc-850 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-zinc-400">{p.team} · Stock: {p.stock}</p>
                          <p className="text-xs font-mono font-black text-lime-400">৳{p.salePrice}</p>
                          <button
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="mt-1 text-[11px] font-semibold text-lime-400 hover:text-lime-300 flex items-center gap-1"
                          >
                            <span>View Details & Order</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
            >
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold rounded-lg transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
