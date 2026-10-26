import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair Quality',
  3: 'Good / Standard Match Fit',
  4: 'Very Good / High Quality',
  5: 'Elite / Matchday Perfection'
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'sm',
  showNumber = false,
  reviewCount,
  interactive = false,
  onChange,
  className = '',
  showLabel = false
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = interactive && hoverRating !== null ? hoverRating : rating;

  // Star size classes
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base font-bold'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Stars row */}
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {Array.from({ length: maxStars }).map((_, i) => {
          const starPosition = i + 1;
          const isFilled = activeRating >= starPosition;
          const isHalf = !interactive && !isFilled && activeRating >= starPosition - 0.75;

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange && onChange(starPosition)}
                onMouseEnter={() => setHoverRating(starPosition)}
                className="p-0.5 transition-transform hover:scale-125 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded"
                title={`${starPosition} Star${starPosition > 1 ? 's' : ''} - ${RATING_LABELS[starPosition]}`}
                aria-label={`Rate ${starPosition} out of 5 stars`}
              >
                <Star
                  className={`${starSizes[size]} transition-colors ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
                      : 'fill-zinc-850 text-zinc-700 hover:text-amber-400/50'
                  }`}
                />
              </button>
            );
          }

          if (isHalf) {
            return (
              <div key={i} className={`relative ${starSizes[size]} shrink-0`} title={`${rating} out of 5 stars`}>
                {/* Empty base star */}
                <Star className={`absolute inset-0 ${starSizes[size]} fill-zinc-800 text-zinc-700`} />
                {/* Half clipped star */}
                <div className="absolute inset-0 overflow-hidden w-[50%]">
                  <Star className={`${starSizes[size]} fill-amber-400 text-amber-400`} />
                </div>
              </div>
            );
          }

          return (
            <Star
              key={i}
              className={`${starSizes[size]} shrink-0 transition-colors ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-zinc-800 text-zinc-700'
              }`}
            />
          );
        })}
      </div>

      {/* Numeric Rating */}
      {showNumber && (
        <span className={`font-mono font-bold text-white tabular-nums ${textSizes[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {/* Review Count Badge */}
      {reviewCount !== undefined && (
        <span className={`text-zinc-500 font-mono tabular-nums ${textSizes[size]}`}>
          ({reviewCount})
        </span>
      )}

      {/* Text Label on interactive hover or active rating */}
      {showLabel && interactive && (
        <span className="text-xs text-amber-400 font-medium ml-1">
          {RATING_LABELS[Math.round(activeRating)] || 'Select a rating'}
        </span>
      )}
    </div>
  );
};
