import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Target, 
  Eye, 
  HeartHandshake, 
  MapPin, 
  User, 
  ArrowRight, 
  Phone, 
  Mail, 
  MessageCircle, 
  ExternalLink, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { FounderProfile } from '../types/index.ts';

interface AboutPageProps {
  onShopNow: () => void;
  onOpenJerseyStudio?: () => void;
  onOpenContact?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onShopNow,
  onOpenJerseyStudio
}) => {
  const [profile, setProfile] = useState<FounderProfile>({
    name: 'MD Jahid',
    position: 'CEO',
    address: 'DHAKA',
    photoUrl: '',
    bio: 'Visionary founder dedicated to elevating the sportswear landscape of Bangladesh by delivering authentic, player-grade football kits and custom apparel to every passionate athlete and supporter.'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const officialFacebookPageUrl = 'https://www.facebook.com/profile.php?id=100069685460999';
  const messengerUrl = 'https://m.me/100069685460999';

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const data = await api.getFounderProfile();
        if (data && isMounted) {
          setProfile(data);
          setImageError(false);
        }
      } catch (err) {
        console.error('Failed to load founder profile:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'MJ';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-zinc-850 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold tracking-widest uppercase mb-6 animate-pulse">
            <Flame className="w-3.5 h-3.5" />
            <span>Official Sports Enterprise</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight uppercase text-white mb-6 leading-tight">
            THE ENGINE BEHIND <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-lime-200">
              BANGLADESH SPORTSWEAR
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-300 text-sm sm:text-base leading-relaxed mb-8">
            Welcome to ApexKit. We are an authentic sports apparel company headquartered in Dhaka, engineered to supply top-tier football kits, custom-printed team jerseys, and athletic training gear to players and passionate supporters nationwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onShopNow}
              className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-lime-400/20 flex items-center gap-2 group"
            >
              <span>Explore Gear Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {onOpenJerseyStudio && (
              <button
                onClick={onOpenJerseyStudio}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-750 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-lime-400" />
                <span>Jersey Customizer</span>
              </button>
            )}

            <a
              href={officialFacebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-md"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Follow Official Facebook</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. WELCOMING STORE INTRODUCTION */}
      <section className="py-16 sm:py-20 border-b border-zinc-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-lime-400 uppercase tracking-widest font-sans">
                <Trophy className="w-4 h-4" />
                <span>Our Story & Purpose</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-white leading-tight">
                Authentic Sports Gear Built for Bangladesh's Sporting Spirit
              </h2>

              <p className="text-zinc-300 text-sm leading-relaxed">
                Founded with a straightforward mission: deliver genuine, high-performance athletic apparel to sports fans and grassroots football teams across Dhaka and all 64 districts of Bangladesh. Too often, athletes have had to compromise between overpriced imported shirts and poor-quality local knockoffs.
              </p>

              <p className="text-zinc-400 text-sm leading-relaxed">
                At ApexKit, every kit is engineered with breathable micro-mesh fabrics, high-resilience stretch polyester, and professional heat-transfer vinyl typography. Whether you are stepping onto the pitch for an intense tournament or cheering on matchday, our kits provide the comfort, durability, and prestige you deserve.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-2xl font-black font-mono text-lime-400">64</div>
                  <div className="text-xs text-zinc-400 font-medium mt-1">Districts Covered</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-2xl font-black font-mono text-white">100%</div>
                  <div className="text-xs text-zinc-400 font-medium mt-1">Cash on Delivery</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-2xl font-black font-mono text-lime-400">24-48h</div>
                  <div className="text-xs text-zinc-400 font-medium mt-1">Dhaka Express Delivery</div>
                </div>
              </div>
            </div>

            {/* 3. FOUNDER PROFILE CARD */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 rounded-full blur-2xl pointer-events-none group-hover:bg-lime-400/10 transition-colors" />
                
                <div className="flex items-center justify-between mb-6 border-b border-zinc-800/80 pb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Executive Leadership
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-bold border border-lime-400/20 font-mono">
                    CONFIRMED FOUNDER
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                  {/* Photo or Initials Fallback */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-950 border-2 border-lime-400/40 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                    {profile.photoUrl && !imageError ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center text-lime-400">
                        <span className="text-2xl sm:text-3xl font-black font-display tracking-wider">
                          {getInitials(profile.name)}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                          Apex Leader
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left space-y-1.5 flex-1">
                    <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-white">
                      {profile.name}
                    </h3>
                    <div className="inline-block px-2.5 py-0.5 bg-lime-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded">
                      {profile.position}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                      <span className="font-semibold text-zinc-200">{profile.address}</span>
                      <span className="text-zinc-500">· Bangladesh</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 text-xs text-zinc-300 leading-relaxed italic mb-6">
                  "{profile.bio || 'Our goal is simple: empower every sports lover in Bangladesh with authentic apparel they can wear with absolute pride on matchday and beyond.'}"
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Store Headquarters:</span>
                    <span className="text-zinc-200 font-medium">Dhaka, Bangladesh</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Direct WhatsApp:</span>
                    <a 
                      href="https://wa.me/8801763943446"
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-lime-400 font-mono font-medium hover:underline"
                    >
                      01763-943446
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Facebook ID:</span>
                    <span className="text-zinc-300 font-mono">100069685460999</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MISSION & VISION & COMMITMENTS */}
      <section className="py-16 sm:py-20 border-b border-zinc-850 bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-white mb-3">
              OUR PILLARS OF EXCELLENCE
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              The fundamental core principles guiding our daily catalog curation, jersey manufacturing, and customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Mission */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight text-white mb-2">
                Our Mission
              </h3>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed flex-1">
                To equip athletes, recreational players, and football enthusiasts across Bangladesh with superior sports merchandise, authentic club and international kits, and precision custom printing with zero markup exploitation.
              </p>
            </div>

            {/* Vision */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight text-white mb-2">
                Our Vision
              </h3>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed flex-1">
                To become the most dependable and inspiring sportswear destination in South Asia, cultivating a flourishing community where sportsmanship, local tournaments, and football passion thrive together.
              </p>
            </div>

            {/* Commitment to Customers */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight text-white mb-2">
                Customer Commitment
              </h3>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed flex-1">
                Your satisfaction is guaranteed. We inspect every stitch, provide transparent Cash on Delivery so you pay only upon arrival, offer hassle-free size exchanges, and support you continuously via WhatsApp & Messenger.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FOCUS ON SPORTS PRODUCTS & ATHLETES */}
      <section className="py-16 sm:py-20 border-b border-zinc-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-lime-400 uppercase tracking-widest font-sans">
                <Sparkles className="w-4 h-4" />
                <span>Craftsmanship & Athletic Focus</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-white leading-tight">
                Engineered for High-Output Movement and Matchday Fervor
              </h2>

              <p className="text-zinc-300 text-sm leading-relaxed">
                Whether you are competing in a 7-a-side floodlit tournament in Dhaka or training for weekend cricket league fixtures, standard cotton tops trap perspiration and restrict movement.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-850">
                  <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aero-Mesh Micro Ventilation</h4>
                    <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                      Advanced moisture-wicking technology actively draws sweat away from the skin, ensuring peak performance during humid Bangladesh weather conditions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-850">
                  <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">High-Density Vinyl & Official Badging</h4>
                    <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                      Custom names and numbers are applied using industrial heat press technology that withstands rigorous washing without peeling or cracking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-850">
                  <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Sport Range</h4>
                    <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                      Comprehensive collections spanning football club jerseys, national team kits, cricket warmup apparel, retro classics, and athletic gym gear.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Specs Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6">
              <h3 className="text-base font-bold font-display uppercase tracking-tight text-white flex items-center justify-between">
                <span>Kit Quality Standard</span>
                <span className="text-xs text-lime-400 font-mono">PLAYER ISSUE</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                    <span>Breathability & Air Flow</span>
                    <span className="text-lime-400 font-mono">98%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-lime-400 h-full rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                    <span>Fabric Durability & Stretch</span>
                    <span className="text-lime-400 font-mono">95%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-lime-400 h-full rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                    <span>Heat-Press Typography Adhesion</span>
                    <span className="text-lime-400 font-mono">99%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-lime-400 h-full rounded-full" style={{ width: '99%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 block mb-1">Need customized team sets for your squad?</span>
                <button
                  onClick={onShopNow}
                  className="text-xs text-lime-400 font-bold hover:underline"
                >
                  Browse Club Catalog with Bulk Inquiries &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION & CONTACT BUTTONS */}
      <section className="py-16 sm:py-24 bg-gradient-to-t from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black font-display uppercase tracking-tight text-white">
              GEAR UP WITH APEXKIT TODAY
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Fast door-to-door delivery inside Dhaka (৳70) and nationwide across 64 districts (৳130). 100% Cash on Delivery protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onShopNow}
              className="px-8 py-3.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-lime-400/20 flex items-center gap-2 group"
            >
              <span>Shop All Kits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="tel:01763943446"
              className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-lime-400" />
              <span>Call 01763-943446</span>
            </a>

            <a
              href="https://wa.me/8801763943446"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-white border border-emerald-500/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp (01763-943446)</span>
            </a>

            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#00B2FF]" />
              <span>Facebook Messenger</span>
            </a>
          </div>

          {/* Facebook Official Link Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 max-w-md mx-auto flex items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Official Facebook Community</div>
                <div className="text-[11px] text-zinc-400">Join our official verified sports page</div>
              </div>
            </div>

            <a
              href={officialFacebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Follow</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};
