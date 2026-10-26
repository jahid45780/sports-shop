import React from 'react';
import { ShieldCheck, Wind, Sparkles, Clock } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="text-xs font-bold text-lime-400 tracking-wider uppercase mb-1">
            Engineered For Athletes
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white font-display">
            Why Footballers Choose ApexKit
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            We source match-grade textiles built to endure high temperatures and intense tournament play.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-lime-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400 mb-4">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase font-display">
              Moisture-Vapor Weave
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Engineered with honeycomb perforations that channel sweat outward for rapid evaporation under Bangladesh's humid weather.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-lime-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase font-display">
              3D Heat-Applied Crests
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Lightweight silicone badges and tournament crests applied seamlessly to eliminate internal skin abrasion and friction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-lime-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase font-display">
              Official Font Printing
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Commercial-grade heat transfer vinyl with authentic league typography. Guaranteed wash durability without peeling.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-lime-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase font-display">
              Nationwide COD Delivery
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              24-48 hours inside Dhaka city and 3-4 days nationwide via reliable courier partners with Cash on Delivery peace of mind.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
