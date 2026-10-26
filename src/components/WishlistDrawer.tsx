import React from 'react';
import { 
  X, 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Star 
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import type { Product } from '../types/index.ts';

interface WishlistDrawerProps {
  onSelectProduct: (product: Product) => void;
  onExploreProducts: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  onSelectProduct,
  onExploreProducts
}) => {
  const { 
    wishlist, 
    isWishlistOpen, 
    setIsWishlistOpen, 
    removeFromWishlist, 
    clearWishlist 
  } = useWishlist();
  
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToBag = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      size: product.sizes[0] || 'L',
      color: product.colors[0] || 'Default',
      price: product.salePrice,
      maxStock: product.stock
    }, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={() => setIsWishlistOpen(false)} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-base font-bold uppercase font-display tracking-wider text-white">
                Saved Wishlist ({wishlist.length})
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {wishlist.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors mr-2 font-medium"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors"
                aria-label="Close wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlist.length > 0 ? (
              wishlist.map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    setIsWishlistOpen(false);
                    onSelectProduct(product);
                  }}
                  className="group p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer flex gap-3 relative transition-all"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-zinc-900 shrink-0 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider truncate">
                          {product.team}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400 text-[10px] font-mono">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{product.rating}</span>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-lime-400 transition-colors truncate mt-0.5">
                        {product.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-sm font-bold text-white tabular-nums">
                          ৳{product.salePrice.toLocaleString()}
                        </span>
                        {product.regularPrice > product.salePrice && (
                          <span className="text-[11px] text-zinc-500 line-through tabular-nums">
                            ৳{product.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleMoveToBag(product, e)}
                          disabled={product.stock === 0}
                          className="px-2.5 py-1 bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-zinc-950 text-xs font-bold uppercase rounded-md transition-colors flex items-center gap-1 shadow-sm"
                          title="Move to Shopping Bag"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(product.id);
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600 mb-3">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white uppercase font-display">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Click the heart icon on any jersey or sportswear item to save it for later.
                </p>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    onExploreProducts();
                  }}
                  className="mt-5 px-4 py-2 bg-lime-400 text-zinc-950 font-bold text-xs uppercase rounded-lg hover:bg-lime-300 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          {wishlist.length > 0 && (
            <div className="p-4 bg-zinc-950 border-t border-zinc-850 text-center">
              <p className="text-[11px] text-zinc-500">
                Items in your wishlist remain saved on this browser even after leaving the page.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
