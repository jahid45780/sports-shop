import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Zap, 
  Ruler, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  MessageSquarePlus,
  Send,
  Heart,
  Loader2,
  Share2
} from 'lucide-react';
import type { Product, ProductSize, RatingSummary } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { SizeGuideModal } from './SizeGuideModal.tsx';
import { StarRating } from './StarRating.tsx';
import { api } from '../services/api.ts';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckoutDirect: () => void;
  onSelectRelatedProduct: (p: Product) => void;
  allProducts: Product[];
  onOpenShareFacebook?: (product: Product) => void;
  onOpenCustomStudio?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenCheckoutDirect,
  onSelectRelatedProduct,
  allProducts,
  onOpenShareFacebook,
  onOpenCustomStudio
}) => {
  if (!isOpen || !product) return null;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFavorited = isInWishlist(product.id);

  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Custom printing state
  const [wantsCustomPrint, setWantsCustomPrint] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const CUSTOM_PRINT_FEE = 200; // BDT ৳200 (Matches server-side order calculation)

  // Ratings from API state
  const [ratingsSummary, setRatingsSummary] = useState<RatingSummary | null>(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setIsLoadingRatings(true);
      api.getProductRatings(product.id)
        .then(data => setRatingsSummary(data))
        .catch(err => console.error('Failed fetching product ratings:', err))
        .finally(() => setIsLoadingRatings(false));
    } else {
      setRatingsSummary(null);
    }
  }, [isOpen, product?.id]);

  const currentRating = ratingsSummary?.rating ?? product.rating;
  const currentReviewCount = ratingsSummary?.reviewCount ?? product.reviewCount;
  const currentReviews = ratingsSummary?.reviews ?? product.reviews ?? [];

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const discountPercent = product.regularPrice > product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const effectivePrice = product.salePrice + (wantsCustomPrint ? CUSTOM_PRINT_FEE : 0);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      size: selectedSize,
      color: selectedColor,
      price: product.salePrice,
      maxStock: product.stock,
      customPrint: wantsCustomPrint && customName.trim() ? {
        playerName: customName.trim().toUpperCase(),
        playerNumber: customNumber.trim() || '10',
        extraCost: CUSTOM_PRINT_FEE
      } : undefined
    }, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    onOpenCheckoutDirect();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview({
        productId: product.id,
        customerName: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      if (res && res.summary) {
        setRatingsSummary(res.summary);
        product.rating = res.summary.rating;
        product.reviewCount = res.summary.reviewCount;
        product.reviews = res.summary.reviews;
      }
      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewComment('');
      setReviewerName('');
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Related products
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.team === product.team))
    .slice(0, 3);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div 
          className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Close Bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider">{product.team}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{product.category.replace('-', ' ')}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close product view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Contiguous Purchase Module */}
          <div className="overflow-y-auto p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Product Imagery */}
              <div className="space-y-4">
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-lime-400 text-zinc-950 text-xs font-black uppercase px-2.5 py-1 rounded font-mono">
                      -{discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Badges / Guarantees */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
                    <span className="text-[11px] text-zinc-300 font-medium">100% Player Edition</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-lime-400 shrink-0" />
                    <span className="text-[11px] text-zinc-300 font-medium">Cash on Delivery</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Contiguous Purchase Module */}
              <div className="space-y-5">
                
                {/* Title & SKU */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white uppercase font-display tracking-tight leading-snug">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                    <span className="font-mono text-zinc-500">SKU: {product.sku}</span>
                    <span aria-hidden="true">·</span>
                    <StarRating
                      rating={currentRating}
                      size="sm"
                      showNumber={true}
                      reviewCount={currentReviewCount}
                    />
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                      ৳{effectivePrice.toLocaleString()}
                    </span>
                    {product.regularPrice > product.salePrice && (
                      <span className="text-sm text-zinc-500 line-through font-mono tabular-nums">
                        ৳{product.regularPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {product.stock > 0 ? (
                      <span className="text-xs font-semibold text-lime-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        In Stock ({product.stock} units)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-red-400">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Size Selection with Size Guide Trigger */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Select Size:
                    </span>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300 underline font-medium"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 h-10 px-3 rounded-lg text-xs font-bold font-mono transition-all duration-150 ${
                          selectedSize === size
                            ? 'bg-lime-400 text-zinc-950 font-black shadow-sm'
                            : 'bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Display */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2">
                      Color / Pattern:
                    </span>
                    <div className="flex items-center gap-2">
                      {product.colors.map(c => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            selectedColor === c
                              ? 'bg-zinc-800 border-lime-400 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Custom Player Name & Number Add-on */}
                {product.allowCustomPrint && (
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wantsCustomPrint}
                          onChange={(e) => setWantsCustomPrint(e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-lime-400 focus:ring-lime-400 accent-lime-400"
                        />
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                          Add Custom Player Name & Number (+৳200)
                        </span>
                      </label>
                    </div>

                    {wantsCustomPrint && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Player Name:</label>
                          <input
                            type="text"
                            maxLength={12}
                            placeholder="e.g. MESSI"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-lime-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Jersey Number:</label>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="e.g. 10"
                            value={customNumber}
                            onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-lime-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity Stepper & Buy Buttons */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-2 text-zinc-400 hover:text-white disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="px-3 py-2 text-zinc-400 hover:text-white disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-lime-400" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                        isFavorited
                          ? 'bg-red-500/20 text-red-500 border-red-500/40 hover:bg-red-500/30'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                      }`}
                      title={isFavorited ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      aria-label={isFavorited ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
                    </button>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="w-full py-3.5 px-4 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lime-400/10"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Order Now (Cash on Delivery)</span>
                  </button>

                  {/* Share on Facebook & Studio Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onOpenShareFacebook?.(product)}
                      className="flex-1 py-2 px-3 bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#4599FF] border border-[#1877F2]/30 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      title="Share this kit on Facebook"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Share on Facebook</span>
                    </button>

                    {product.allowCustomPrint && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCustomStudio?.();
                        }}
                        className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-lime-400 border border-zinc-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open 2D Studio</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Description & Specs */}
                <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs text-zinc-300">
                  <p className="leading-relaxed text-zinc-400">
                    {product.description}
                  </p>
                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-zinc-500 font-sans">Fabric:</span> {product.fabric}
                    </div>
                    <div>
                      <span className="text-zinc-500 font-sans">Fit:</span> {product.fitType}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Authentic Customer Reviews Section */}
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-display tracking-tight flex items-center gap-2">
                    <span>Customer Ratings & Reviews</span>
                    {isLoadingRatings && (
                      <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Verified feedback from footballers & sportswear fans across Bangladesh.
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-lime-400 bg-lime-400/10 hover:bg-lime-400/20 rounded-lg transition-colors border border-lime-400/30"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
                </button>
              </div>

              {/* Comprehensive Rating Overview & Distribution Histogram */}
              <div className="mb-6 p-5 rounded-2xl bg-zinc-950 border border-zinc-850 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left side: Overall Score */}
                <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-3 sm:border-r sm:border-zinc-850">
                  <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight tabular-nums">
                    {currentRating.toFixed(1)}
                  </div>
                  <div className="mt-2">
                    <StarRating rating={currentRating} size="md" />
                  </div>
                  <div className="text-xs text-zinc-400 mt-2 font-mono">
                    Based on <span className="text-white font-bold">{currentReviewCount}</span> customer ratings
                  </div>
                  <div className="text-[11px] text-lime-400/90 font-semibold mt-1">
                    100% Verified Matchday Purchases
                  </div>
                </div>

                {/* Right side: Star Breakdown Bars */}
                <div className="md:col-span-7 space-y-2">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const distCount = ratingsSummary?.distribution?.[starNum as 1|2|3|4|5] ?? 0;
                    const totalCount = currentReviewCount > 0 ? currentReviewCount : 1;
                    const percent = Math.min(100, Math.round((distCount / totalCount) * 100));

                    return (
                      <div key={starNum} className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 w-14 shrink-0 font-mono text-zinc-400">
                          <span>{starNum}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="flex-1 h-2 bg-zinc-850 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Count & Percentage */}
                        <div className="w-16 text-right font-mono text-[11px] text-zinc-500 tabular-nums shrink-0">
                          {distCount} ({percent}%)
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {reviewSuccess && (
                <div className="mb-4 p-3 bg-lime-400/10 border border-lime-400/30 rounded-xl text-xs text-lime-400 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Thank you! Your verified review and rating have been recorded.</span>
                </div>
              )}

              {/* Submit Review Form with Interactive Star Picker */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-8 p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                  <div className="font-bold text-xs uppercase tracking-wider text-white font-display">
                    Share Your Product Experience
                  </div>

                  {/* Interactive Star Rating Selector */}
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Overall Rating (Click stars to rate) <span className="text-lime-400">*</span>
                    </label>
                    <div className="pt-1">
                      <StarRating
                        rating={reviewRating}
                        interactive={true}
                        size="lg"
                        showLabel={true}
                        onChange={(newRating) => setReviewRating(newRating)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Your Full Name <span className="text-lime-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Asif Mahmud"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Review Comment & Fit Details <span className="text-lime-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="How does the jersey fit? Did the micro-mesh keep you cool during play? What did you think of the print and delivery?"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-3.5 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-5 py-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Rating & Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {currentReviews && currentReviews.length > 0 ? (
                  currentReviews.map(r => (
                    <div key={r.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{r.customerName}</span>
                          {r.verifiedPurchase !== false && (
                            <span className="text-[10px] text-lime-400 font-mono flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StarRating rating={r.rating} size="xs" />
                          {r.createdAt && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic p-4 text-center border border-zinc-850 rounded-xl bg-zinc-950">
                    No reviews yet for this edition. Be the first to rate and review!
                  </p>
                )}
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-zinc-800">
                <h3 className="text-lg font-bold text-white uppercase font-display tracking-tight mb-4">
                  You Might Also Like
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedProducts.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectRelatedProduct(rel)}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all flex items-center gap-3"
                    >
                      <img
                        src={rel.images[0]}
                        alt={rel.name}
                        className="w-14 h-14 rounded-lg object-cover bg-zinc-900 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{rel.name}</div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">৳{rel.salePrice}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Sizing Modal */}
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </>
  );
};
