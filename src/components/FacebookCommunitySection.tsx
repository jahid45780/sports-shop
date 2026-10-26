import React, { useState } from 'react';
import { ExternalLink, MessageCircle, Share2, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { FacebookShareModal } from './FacebookShareModal.tsx';

export const FacebookCommunitySection: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [shareOffer, setShareOffer] = useState<{ title: string; description: string; discountCode: string } | null>(null);

  const officialPageUrl = 'https://www.facebook.com/profile.php?id=100069685460999';
  const messengerUrl = 'https://m.me/100069685460999';

  const pluginSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(officialPageUrl)}&tabs=timeline&width=380&height=480&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  return (
    <section className="py-16 bg-zinc-950 border-t border-zinc-900 text-zinc-100 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#1877F2]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1877F2]/10 text-[#4599FF] border border-[#1877F2]/30">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>OFFICIAL FACEBOOK SPORTS HUB</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase font-display tracking-tight text-white">
              Connect With Our <span className="text-[#1877F2]">Facebook Page</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Stay in the loop with live match day kit reveals, community polls, custom player name prints, and direct WhatsApp / Messenger order assistance for sports enthusiasts across Bangladesh.
            </p>
          </div>

          {/* Quick Follow & Contact CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={officialPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-[#1877F2]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Follow on Facebook</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#00B2FF]" />
              <span>Facebook Contact</span>
            </a>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Official Facebook Page Embed / Fallback Card */}
          <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center text-white font-bold">
                  f
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Official Page Stream</h3>
                  <p className="text-[10px] text-zinc-400">profile.php?id=100069685460999</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                Verified Link
              </span>
            </div>

            {/* Embedded Facebook Page Plugin with automatic fallback handling */}
            <div className="relative min-h-[380px] bg-zinc-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-zinc-850">
              
              {!iframeError && (
                <iframe
                  src={pluginSrc}
                  title="Official ApexKit Facebook Sports Page"
                  className="w-full h-[460px] border-none overflow-hidden rounded-xl"
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                />
              )}

              {/* High-Fidelity Fallback Profile Card when embed is blocked by ad-blocker or CSP */}
              {(!iframeLoaded || iframeError) && (
                <div className="w-full p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#1877F2] to-blue-400 p-0.5 shadow-lg shadow-blue-500/20">
                    <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center text-2xl font-black text-white font-display">
                      AK
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                      <span>ApexKit Sports & Jerseys</span>
                      <CheckCircle2 className="w-4 h-4 text-[#1877F2] fill-[#1877F2]/20" />
                    </h4>
                    <p className="text-xs text-zinc-400">Official Sports E-Commerce & Jersey Page</p>
                    <p className="text-[11px] text-zinc-500 font-mono">Page ID: 100069685460999</p>
                  </div>

                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Official Facebook community for football club jerseys, national team kits, player name printing, and customer delivery updates in Bangladesh.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href={officialPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Visit Facebook Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={messengerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#00B2FF]" />
                      <span>Direct Message</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Community Perks & Share Offers */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Jersey Drop Previews</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Get first look at new club jersey player editions, retro re-releases, and World Cup kit arrivals before public catalog updates.
                </p>
              </div>

              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#00B2FF]/10 border border-[#00B2FF]/20 flex items-center justify-center text-[#00B2FF]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Instant Messenger Support</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Need sizing advice or want custom team jersey names for your 7-a-side team? Message us directly on Facebook for 10-minute replies.
                </p>
              </div>

            </div>

            {/* Special Share Offers Banner */}
            <div className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">COMMUNITY PROMOTIONS</span>
                  <h4 className="text-base font-bold text-white">Exclusive Facebook Share Offers</h4>
                </div>
                <span className="text-xs text-zinc-400 font-medium">Valid for Cash on Delivery</span>
              </div>

              {/* Offer 1 */}
              <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-lime-400/15 text-lime-400 font-mono text-[11px] font-bold border border-lime-400/30">
                      APEXFREE
                    </span>
                    <span className="text-xs font-bold text-white">Dhaka Free Delivery Coupon</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Get free doorstep delivery in Dhaka on orders over ৳1,999.
                  </p>
                </div>
                <button
                  onClick={() => setShareOffer({
                    title: 'Dhaka Free Delivery Coupon: APEXFREE',
                    description: 'Get free doorstep delivery inside Dhaka on sports jerseys with Cash on Delivery!',
                    discountCode: 'APEXFREE'
                  })}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Share Offer</span>
                </button>
              </div>

              {/* Offer 2 */}
              <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono text-[11px] font-bold border border-blue-500/30">
                      APEX100
                    </span>
                    <span className="text-xs font-bold text-white">৳100 Off First Club Jersey</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Enjoy an instant ৳100 discount on your first authentic club or national football kit.
                  </p>
                </div>
                <button
                  onClick={() => setShareOffer({
                    title: '৳100 Off First Jersey: APEX100',
                    description: 'Enjoy ৳100 off your first sports kit from ApexKit Bangladesh with Cash on Delivery.',
                    discountCode: 'APEX100'
                  })}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Share Offer</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Share Modal Dialog */}
      <FacebookShareModal
        isOpen={Boolean(shareOffer)}
        onClose={() => setShareOffer(null)}
        offer={shareOffer}
      />
    </section>
  );
};
