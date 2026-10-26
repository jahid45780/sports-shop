import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Share2, MessageCircle } from 'lucide-react';
import type { Product } from '../types/index.ts';

interface FacebookShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  offer?: { title: string; description: string; discountCode: string } | null;
}

export const FacebookShareModal: React.FC<FacebookShareModalProps> = ({
  isOpen,
  onClose,
  product,
  offer
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://apexkit.store';
  const shareUrl = product 
    ? `${currentOrigin}/#product-${product.slug}`
    : currentOrigin;

  const title = product 
    ? `${product.name} | ApexKit Bangladesh`
    : (offer?.title || 'ApexKit - Premium Sports Jerseys & Performance Sportswear');

  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const messengerUrl = `https://m.me/100069685460999`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#1877F2]/15 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 id="share-modal-title" className="text-base font-bold text-white font-sans">
              {product ? 'Share Sports Kit' : 'Share Special Offer'}
            </h3>
            <p className="text-xs text-zinc-400">
              Share with football & cricket friends on Facebook
            </p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mb-5 p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
          {product ? (
            <>
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-14 h-14 object-cover rounded-lg border border-zinc-800 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{product.name}</p>
                <p className="text-[11px] text-zinc-400">{product.team} · ৳{product.salePrice}</p>
                <span className="inline-block mt-1 text-[10px] text-lime-400 font-medium">
                  Cash on Delivery Available
                </span>
              </div>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/20 rounded mb-1">
                CODE: {offer?.discountCode || 'APEXFREE'}
              </span>
              <p className="text-xs font-bold text-white">{offer?.title || 'ApexKit Store Promotion'}</p>
              <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{offer?.description || 'Authentic football jerseys and sports apparel.'}</p>
            </div>
          )}
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={fbShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Share on Facebook Feed / Story</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
          </a>

          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-750 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#00B2FF]" />
            <span>Send in Facebook Messenger to Friends</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
          </a>

          <div className="pt-2 flex items-center gap-2">
            <div className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl text-[11px] text-zinc-400 font-mono truncate">
              {shareUrl}
            </div>
            <button
              onClick={handleCopy}
              className="py-2 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-lime-400" />
                  <span className="text-lime-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-[10px] text-zinc-500 text-center">
          Official Facebook Page: <a href="https://www.facebook.com/profile.php?id=100069685460999" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white underline">facebook.com/profile.php?id=100069685460999</a>
        </p>
      </div>
    </div>
  );
};
