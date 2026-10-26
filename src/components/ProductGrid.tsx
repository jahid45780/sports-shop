import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RotateCcw, PackageX } from 'lucide-react';
import type { Product, ProductCategory, ProductSize } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProduct: (product: Product) => void;
  onShareFacebook?: (product: Product) => void;
  isLoading?: boolean;
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'club-jerseys', label: 'Club Editions' },
  { id: 'national-team', label: 'National Teams' },
  { id: 'custom-jerseys', label: 'Custom Jerseys' },
  { id: 'sports-tshirts', label: 'Sports T-Shirts' },
  { id: 'retro-classics', label: 'Retro 90s' }
];

const SIZES: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onShareFacebook,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceMax, setPriceMax] = useState<number>(3000);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Teams extracted dynamically from products
  const availableTeams = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.team) set.add(p.team);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Team
      if (selectedTeam !== 'all' && p.team !== selectedTeam) {
        return false;
      }
      // Size
      if (selectedSize !== 'all' && !p.sizes.includes(selectedSize as ProductSize)) {
        return false;
      }
      // Price
      if (p.salePrice > priceMax) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchTeam = p.team.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchTeam && !matchSku && !matchDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.salePrice - b.salePrice;
      if (sortBy === 'price_desc') return b.salePrice - a.salePrice;
      if (sortBy === 'popular') return b.rating - a.rating || b.reviewCount - a.reviewCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, selectedTeam, selectedSize, priceMax, searchQuery, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedTeam !== 'all' || selectedSize !== 'all' || priceMax < 3000 || searchQuery.length > 0;

  const handleResetFilters = () => {
    onSelectCategory('all');
    setSelectedTeam('all');
    setSelectedSize('all');
    setPriceMax(3000);
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <section id="shop-catalog" className="py-12 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-lime-400 tracking-wider uppercase mb-1">
              Matchday & Training Gear
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
              Official Store Catalog
            </h2>
          </div>

          {/* Search bar inside header */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search jerseys, clubs, squads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs: Functional Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-zinc-850">
          {CATEGORY_TABS.map(tab => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-lime-400 text-zinc-950 shadow-sm shadow-lime-400/20'
                    : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-850 hover:text-white border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter & Sort Toolbar */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Left Filter cluster */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Team Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Club / Team:</span>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-lime-400 cursor-pointer"
                >
                  <option value="all">All Teams</option>
                  {availableTeams.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Size Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 font-medium mr-1">Size:</span>
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`w-7 h-7 rounded text-xs font-bold ${
                    selectedSize === 'all'
                      ? 'bg-white text-zinc-950'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  All
                </button>
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-7 h-7 rounded text-xs font-bold font-mono ${
                      selectedSize === s
                        ? 'bg-lime-400 text-zinc-950'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Price filter */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Max Price:</span>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-24 accent-lime-400 cursor-pointer"
                />
                <span className="text-xs font-mono text-zinc-300 tabular-nums">৳{priceMax}</span>
              </div>
            </div>

            {/* Right Sort cluster */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-lime-400 cursor-pointer"
                >
                  <option value="newest">Newest Releases</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Top Rated</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-lime-400" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>

          </div>

          {/* Active Results Count indicator */}
          <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Showing {filteredProducts.length} sportswear items</span>
            {hasActiveFilters && (
              <span className="text-lime-400 text-[11px] font-sans">Filters active</span>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-zinc-900 rounded-xl h-80 border border-zinc-800" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onShareFacebook={onShareFacebook}
              />
            ))}
          </div>
        ) : (
          /* Friendly Empty State */
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase font-display">
              No matching sports jerseys found
            </h3>
            <p className="text-xs text-zinc-400 mt-2">
              We couldn't find any products matching your current filters. Try expanding the price range or clearing search keywords.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-4 py-2 bg-lime-400 text-zinc-950 font-bold text-xs uppercase rounded-lg hover:bg-lime-300 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
