import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ProductCategory } from '../types/index.ts';

interface CategoryShowcaseProps {
  onSelectCategory: (category: ProductCategory) => void;
}

const CATEGORIES: {
  id: ProductCategory;
  title: string;
  subtitle: string;
  image: string;
}[] = [
  {
    id: 'club-jerseys',
    title: 'Club Editions',
    subtitle: 'European & domestic champions',
    image: '/src/assets/images/product_club_jersey_1792747635830.jpg'
  },
  {
    id: 'national-team',
    title: 'National Kits',
    subtitle: 'Tournament & World Cup editions',
    image: '/src/assets/images/product_national_jersey_1792747636134.jpg'
  },
  {
    id: 'custom-jerseys',
    title: 'Custom Printed',
    subtitle: 'Your name & favorite squad number',
    image: '/src/assets/images/product_custom_jersey_1792747711299.jpg'
  },
  {
    id: 'sports-tshirts',
    title: 'Training Tops',
    subtitle: 'Gym, running & lightweight performance',
    image: '/src/assets/images/product_training_tshirt_1792747637025.jpg'
  },
  {
    id: 'retro-classics',
    title: 'Retro 90s Heritage',
    subtitle: 'Vintage collar & classic patterns',
    image: '/src/assets/images/product_retro_jersey_1792747711923.jpg'
  }
];

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-12 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-lime-400 tracking-wider uppercase mb-1">
              Curated Sports Apparel
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-display">
              Browse by Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            Engineered micro-mesh athletic apparel tailored for Bangladeshi climate and everyday matchdays.
          </p>
        </div>

        {/* 5-Column Clean Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-lime-400/50 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-850">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-lime-400 transition-colors uppercase font-display tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 group-hover:text-lime-400 transition-colors mt-3">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
