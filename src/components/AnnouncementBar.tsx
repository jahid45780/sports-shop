import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ 
  message = "FREE Delivery inside Dhaka on orders over ৳1,999 · Cash on Delivery nationwide" 
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-lime-400 text-zinc-950 text-xs font-semibold py-2 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center truncate">
          <Zap className="w-3.5 h-3.5 shrink-0 fill-current" />
          <span className="tracking-wide uppercase font-bold text-[11px] sm:text-xs truncate">
            {message}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-zinc-950/70 hover:text-zinc-950 p-1 rounded transition-colors shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
