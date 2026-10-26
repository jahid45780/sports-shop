import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, ArrowRight, ShieldCheck, Check, ShoppingBag, Loader2 } from 'lucide-react';
import { api } from '../services/api.ts';
import type { Product, SportType, ProductSize } from '../types/index.ts';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('football');
  const [selectedBudget, setSelectedBudget] = useState<number>(1500);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [skillLevel, setSkillLevel] = useState<string>('match_player');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ advice: string; products: Product[] } | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '⚽ Pro Football Match Kit (Under ৳1,500)', sport: 'football', budget: 1500, prompt: 'Recommend best football match jersey under ৳1500 for hot weather' },
    { label: '✨ Custom Printed Striker Jersey #10', sport: 'football', budget: 1800, prompt: 'Looking for a custom name and number jersey with high durability' },
    { label: '🏋️‍♂️ Breathable Gym Training T-Shirt', sport: 'training', budget: 1000, prompt: 'Lightweight sweat-wicking gym training tops for intense workouts' },
    { label: '🇧🇩 National Tigers Kit (Size L / XL)', sport: 'cricket', budget: 1500, prompt: 'Authentic Bangladesh national sports kit in Size L or XL' }
  ];

  const handleAsk = async (customPrompt?: string, sportOverride?: string, budgetOverride?: number) => {
    const finalPrompt = customPrompt || query || `Sports recommendations for ${selectedSport}`;
    const finalSport = sportOverride || selectedSport;
    const finalBudget = budgetOverride || selectedBudget;

    setIsLoading(true);
    try {
      const data = await api.getAiRecommendations({
        query: finalPrompt,
        sport: finalSport,
        budget: finalBudget,
        size: selectedSize,
        skillLevel
      });
      setAiResponse({
        advice: data.advice,
        products: data.products
      });
    } catch (err) {
      console.error('Error with AI assistant:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ai-assistant-title" className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-white">
                  AI Sports Shopping Assistant
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                  Google Gemini Powered
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Ground-truth sports advice verified strictly against live warehouse stock & official prices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accuracy Guarantee Sub-bar */}
        <div className="px-6 py-2 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-medium">100% Real Warehouse Inventory · Zero Invented Prices</span>
          </div>
          <span className="hidden sm:inline text-zinc-400 font-mono">
            Hotline: <a href="tel:01763943446" className="text-lime-400 hover:underline">01763-943446</a>
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Preset Prompts Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-lime-400" />
              <span>Instant Gear Recommendations</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSport(qp.sport);
                    setSelectedBudget(qp.budget);
                    setQuery(qp.prompt);
                    handleAsk(qp.prompt, qp.sport, qp.budget);
                  }}
                  className="p-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left text-xs font-medium text-zinc-200 transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{qp.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-lime-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Parameters Filter Strip */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Sport</label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-semibold focus:outline-none focus:border-lime-400"
              >
                <option value="football">Football / Soccer</option>
                <option value="cricket">Cricket / Tigers</option>
                <option value="training">Gym & Fitness</option>
                <option value="all">Any Sport</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Budget</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-semibold focus:outline-none focus:border-lime-400"
              >
                <option value={1000}>Under ৳1,000</option>
                <option value={1500}>Under ৳1,500</option>
                <option value={2000}>Under ৳2,000</option>
                <option value={3000}>Any Budget</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-semibold focus:outline-none focus:border-lime-400"
              >
                <option value="S">Small (S)</option>
                <option value="M">Medium (M)</option>
                <option value="L">Large (L)</option>
                <option value="XL">Extra Large (XL)</option>
                <option value="XXL">Double XL (XXL)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Usage Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 font-semibold focus:outline-none focus:border-lime-400"
              >
                <option value="match_player">Match / Competitive</option>
                <option value="casual_fan">Fan Wear & Casual</option>
                <option value="training">Heavy Gym Training</option>
              </select>
            </div>
          </div>

          {/* AI Response Display */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-zinc-950/40 rounded-2xl border border-zinc-800">
              <Loader2 className="w-7 h-7 text-lime-400 animate-spin" />
              <p className="text-xs font-medium text-zinc-300">Consulting real inventory records with Gemini AI...</p>
            </div>
          ) : aiResponse ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Expert Commentary Box */}
              <div className="p-4 bg-zinc-950 border border-lime-400/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-lime-400 text-xs font-bold">
                  <Bot className="w-4 h-4" />
                  <span>Apex Kit Gear Specialist Advice</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {aiResponse.advice}
                </p>
              </div>

              {/* Recommended Product Cards Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Recommended In-Stock Merchandise ({aiResponse.products.length})
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiResponse.products.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center gap-3 transition-colors group"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-xl border border-zinc-850 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <span className="text-[10px] font-bold text-lime-400 uppercase tracking-wider">
                          {p.team}
                        </span>
                        <h5 className="text-xs font-bold text-white truncate">{p.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-white">৳{p.salePrice}</span>
                          <span className="text-[10px] text-zinc-500 line-through">৳{p.regularPrice}</span>
                          <span className="text-[10px] text-emerald-400 font-semibold">Stock: {p.stock}</span>
                        </div>
                        <button
                          onClick={() => {
                            onSelectProduct(p);
                            onClose();
                          }}
                          className="mt-1 text-[11px] font-semibold text-lime-400 hover:text-lime-300 flex items-center gap-1"
                        >
                          <span>View Product Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

        </div>

        {/* Input Bar */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask anything: e.g. 'What kit is best for a midfielder in summer?'..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading}
            className="py-2.5 px-5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 text-xs font-black uppercase rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Get Advice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
