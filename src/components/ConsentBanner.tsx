import React, { useState, useEffect } from 'react';
import { Shield, Settings2, Check, X, ChevronRight } from 'lucide-react';
import { tracking } from '../services/tracking.ts';
import type { UserTrackingConsent } from '../types/index.ts';

interface ConsentBannerProps {
  onOpenPrivacy?: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [consent, setConsent] = useState<UserTrackingConsent>(() => tracking.getConsent());
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Preference switches inside customize modal
  const [allowAnalytics, setAllowAnalytics] = useState(consent.analytics);
  const [allowMarketing, setAllowMarketing] = useState(consent.marketing);

  useEffect(() => {
    // Show banner only if user has not yet decided
    if (!consent.decided) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [consent.decided]);

  const handleAcceptAll = () => {
    const updated = tracking.updateConsent({
      analytics: true,
      marketing: true
    });
    setConsent(updated);
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  const handleRejectNonEssential = () => {
    const updated = tracking.updateConsent({
      analytics: false,
      marketing: false
    });
    setConsent(updated);
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  const handleSavePreferences = () => {
    const updated = tracking.updateConsent({
      analytics: allowAnalytics,
      marketing: allowMarketing
    });
    setConsent(updated);
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  if (!isVisible && !isCustomizeOpen) return null;

  return (
    <>
      {/* 1. Main Bottom Privacy Banner */}
      {isVisible && !isCustomizeOpen && (
        <div 
          role="region" 
          aria-label="Privacy and Tracking Preferences"
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-5 shadow-2xl text-zinc-200 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center shrink-0 text-lime-400">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Privacy & Athletic Telemetry
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Apex Kit uses cookies, Meta Pixel, and analytics tags to measure ad performance, personalize kit recommendations, and ensure genuine order verification across Bangladesh.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-lime-400 text-black hover:bg-lime-300 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Detailed Preference Customization Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-lime-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-display text-white">
                  Tracking & Cookie Preferences
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose which categories of cookies and tracking tags you permit. Essential cookies are required to process your shopping cart and Cash on Delivery order security.
              </p>

              {/* 1. Essential */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Essential Cookies & Cart</span>
                    <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Always Active</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Maintains your shopping bag, order tracking ID, and authentication tokens.
                  </p>
                </div>
                <div className="w-5 h-5 rounded bg-lime-400/20 text-lime-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 2. Analytics */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div className="pr-4">
                  <span className="text-xs font-semibold text-white">Google Analytics 4 (GA4)</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Helps us measure site traffic, popular jersey sizes, and page performance without recording private identity.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={allowAnalytics}
                    onChange={(e) => setAllowAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-400"></div>
                </label>
              </div>

              {/* 3. Marketing */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div className="pr-4">
                  <span className="text-xs font-semibold text-white">Meta Pixel & Google Ads</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Allows attribution for Facebook/Instagram ads and measures genuine order conversions with deduplicated IDs.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={allowMarketing}
                    onChange={(e) => setAllowMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-400"></div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-1.5 text-xs font-semibold bg-lime-400 text-black hover:bg-lime-300 rounded-lg transition-colors cursor-pointer"
                >
                  Save Choices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
