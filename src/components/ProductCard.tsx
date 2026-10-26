import React, { useState } from 'react';
import { ShoppingBag, Star, Eye, Heart, Share2 } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { StarRating } from './StarRating.tsx';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onShareFacebook?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct, onShareFacebook }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const discountPercent = product.regularPrice > product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);

    const defaultSize = product.sizes[0] || 'L';
    const defaultColor = product.colors[0] || 'Default';

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      size: defaultSize,
      color: defaultColor,
      price: product.salePrice,
      maxStock: product.stock
    }, 1);

    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40"
    >
      {/* 65%-75% Card Height Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
        {!imgError && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-900 text-zinc-600">
            <ShoppingBag className="w-8 h-8 mb-1" />
            <span className="text-xs">{product.name}</span>
          </div>
        )}

        {/* Quiet subtle discount badge or low stock indicator */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-lime-400 text-zinc-950 px-2 py-0.5 rounded font-mono">
              -{discountPercent}%
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-zinc-950 px-1.5 py-0.5 rounded">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/90 text-white px-1.5 py-0.5 rounded">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            isFavorited
              ? 'bg-red-500/20 text-red-500 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-zinc-950/60 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80'
          }`}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFavorited ? 'fill-red-500' : ''}`} />
        </button>

        {/* Hover Quick Action overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-lg backdrop-blur-sm transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
            <span>Details</span>
          </button>

          {onShareFacebook && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShareFacebook(product);
              }}
              className="p-2.5 bg-[#1877F2]/90 hover:bg-[#1877F2] text-white rounded-lg backdrop-blur-sm transition-colors text-xs font-semibold"
              title="Share on Facebook"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          
          {product.stock > 0 && (
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="p-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold rounded-lg shadow-md transition-colors text-xs flex items-center gap-1.5"
              title="Quick Add to Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAdding ? 'Added!' : 'Add to Bag'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metadata & Pricing Details */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div>
          {/* Zero-Pill Unboxed Clean Metadata with dot separator */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] truncate">
              {product.team}
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize text-[11px] truncate">{product.category.replace('-', ' ')}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-2 mt-1">
            {product.name}
          </h3>
        </div>

        {/* Price & Rating Row */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-white font-mono tabular-nums">
              ৳{product.salePrice.toLocaleString()}
            </span>
            {product.regularPrice > product.salePrice && (
              <span className="text-xs text-zinc-500 line-through font-mono tabular-nums">
                ৳{product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>

          <StarRating
            rating={product.rating}
            showNumber={true}
            reviewCount={product.reviewCount}
            size="xs"
          />
        </div>
      </div>
    </div>
  );
};
