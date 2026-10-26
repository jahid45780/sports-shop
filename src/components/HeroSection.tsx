import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

interface HeroSectionProps {
  onShopNow: () => void;
  onCustomJerseys: () => void;
  onOpenJerseyStudio?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow, onCustomJerseys, onOpenJerseyStudio }) => {
  return (
    <section className="relative overflow-hidden bg-zinc-950 border-b border-zinc-850 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      {/* Background subtle mesh glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-lime-400/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2-Column Balanced Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* Editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-lime-400 tracking-wider uppercase">
              <span className="w-2 h-0.5 bg-lime-400"></span>
              <span>2026/27 Matchday Performance Kits</span>
            </div>

            {/* Hero Headline with text-wrap: balance */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-display leading-[0.95] [text-wrap:balance]">
              BUILT FOR SPEED. <br />
              CRAFTED FOR <span className="text-lime-400">CHAMPIONS.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 font-normal max-w-xl leading-relaxed">
              Engineered with pro-grade micro-mesh moisture expulsion fabric. From European club editions to custom-printed squad jerseys with Cash on Delivery across Bangladesh.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold uppercase tracking-wider text-sm rounded-lg transition-all duration-200 shadow-lg shadow-lime-400/10 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                <span>Shop Match Kits</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenJerseyStudio || onCustomJerseys}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white font-semibold tracking-wide text-sm border border-zinc-800 rounded-lg transition-all duration-200 hover:border-zinc-700"
              >
                <Sparkles className="w-4 h-4 text-lime-400" />
                <span>Custom Name & No</span>
              </button>
            </div>

            {/* Quick Micro trust info */}
            <div className="pt-4 flex items-center gap-4 text-xs text-zinc-500">
              <span>Authentic Player Edition Fabrics</span>
              <span aria-hidden="true">·</span>
              <span>2-3 Days Fast Courier</span>
              <span aria-hidden="true">·</span>
              <span>Pay on Delivery</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
              <img
                src="/src/assets/images/hero_sports_jersey_1792747635843.jpg"
                alt="Apex FC Aero Velocity match kit sports jersey"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              {/* Measured contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
              
              {/* Product floating card highlight */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-lime-400">
                    Flagship Release
                  </div>
                  <div className="text-sm font-bold text-white">
                    Aero Velocity Match Edition
                  </div>
                  <div className="text-xs text-zinc-400 tabular-nums">
                    ৳1,290 <span className="line-through text-zinc-600">৳1,600</span>
                  </div>
                </div>
                <button
                  onClick={onShopNow}
                  className="px-3.5 py-2 bg-white text-zinc-950 hover:bg-lime-400 font-bold text-xs uppercase rounded-md transition-colors"
                >
                  View Kit
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column KPI Trust Strip below the hero split */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-zinc-850">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center text-lime-400 mb-2">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">Cash on Delivery</div>
            <div className="text-xs text-zinc-400 mt-0.5">Pay after inspecting your parcel nationwide</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center text-lime-400 mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">Dri-FIT Micro-Mesh</div>
            <div className="text-xs text-zinc-400 mt-0.5">Heat-activated moisture expulsion weave</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center text-lime-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">Player Issue Badges</div>
            <div className="text-xs text-zinc-400 mt-0.5">Heat-sealed 3D silicone crests & labels</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center text-lime-400 mb-2">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">Easy Size Exchange</div>
            <div className="text-xs text-zinc-400 mt-0.5">Hassle-free 48h size replacement support</div>
          </div>
        </div>

      </div>
    </section>
  );
};
