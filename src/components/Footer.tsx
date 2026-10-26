import React from 'react';
import { Phone, Mail, MapPin, Shield, CheckCircle, ExternalLink, MessageCircle, Trophy, Sparkles, Gift } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  onOpenJerseyStudio?: () => void;
  onOpenMatchCenter?: () => void;
  onOpenFanZone?: () => void;
  onOpenTournaments?: () => void;
  onOpenLoyalty?: () => void;
  onOpenGearFinder?: () => void;
  onOpenAbout?: () => void;
  onOpenLiveSports?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenTrackOrder,
  onOpenAdmin,
  onOpenJerseyStudio,
  onOpenMatchCenter,
  onOpenFanZone,
  onOpenTournaments,
  onOpenLoyalty,
  onOpenGearFinder,
  onOpenAbout,
  onOpenLiveSports
}) => {
  const officialFacebookPageUrl = 'https://www.facebook.com/profile.php?id=100069685460999';
  const messengerUrl = 'https://m.me/100069685460999';

  return (
    <footer id="contact-us" className="bg-zinc-950 border-t border-zinc-850 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info & Facebook Page Follow */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-2xl font-black tracking-tight text-white font-display uppercase flex items-center gap-1.5">
              <span>APEX</span>
              <span className="text-lime-400">KIT</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Bangladesh's dedicated performance sportswear and football kit destination. Authentic player-issue micro-mesh jerseys, custom club team orders, and fast Cash on Delivery nationwide.
            </p>

            {/* Official Facebook Social Hub Cluster */}
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2.5 max-w-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Official Facebook Community</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">ID: 100069685460999</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={officialFacebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Follow Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#00B2FF]" />
                  <span>Messenger</span>
                </a>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <div className="flex items-center gap-2 flex-wrap">
                  <a href="tel:01763943446" className="font-mono text-zinc-200 hover:text-lime-400 transition-colors">
                    01763-943446
                  </a>
                  <span className="text-zinc-600">·</span>
                  <a 
                    href="https://wa.me/8801763943446" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-lime-400" />
                <span>support@apexkit.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                <span>Dhanmondi, Dhaka - 1209, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Sports Hubs & Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-sans">
              Sports Hub
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenLiveSports} className="hover:text-lime-400 transition-colors flex items-center gap-1.5 text-zinc-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Live Sports & Scores</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenJerseyStudio} className="hover:text-lime-400 transition-colors flex items-center gap-1.5 text-lime-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Jersey Custom Studio</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenMatchCenter} className="hover:text-lime-400 transition-colors flex items-center gap-1.5">
                  <Trophy className="w-3 h-3 text-lime-400" />
                  <span>Sports Match Center</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenFanZone} className="hover:text-lime-400 transition-colors flex items-center gap-1.5">
                  <span>Fan Zone Quizzes & Polls</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenTournaments} className="hover:text-lime-400 transition-colors flex items-center gap-1.5">
                  <span>Tournament Schedules</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenLoyalty} className="hover:text-lime-400 transition-colors flex items-center gap-1.5">
                  <Gift className="w-3 h-3 text-lime-400" />
                  <span>Apex Loyalty Program</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenGearFinder} className="hover:text-lime-400 transition-colors flex items-center gap-1.5">
                  <span>Smart Gear Finder</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-sans">
              Collections
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectCategory('club-jerseys')} className="hover:text-lime-400 transition-colors">
                  Football Club Jerseys
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('national-team')} className="hover:text-lime-400 transition-colors">
                  National Team Kits
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('custom-jerseys')} className="hover:text-lime-400 transition-colors">
                  Custom Name & Number
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('sports-tshirts')} className="hover:text-lime-400 transition-colors">
                  Athletic Training Tops
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('retro-classics')} className="hover:text-lime-400 transition-colors">
                  Retro 90s Heritage
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care & Delivery */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-sans">
              Delivery Coverage
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Fast door-to-door delivery inside Dhaka (৳70) within 24-48 hours. Reliable district delivery (৳130) across all 64 districts with Cash on Delivery.
            </p>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
              <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-lime-400" />
                <span>100% Cash on Delivery</span>
              </div>
              <p className="text-[10px] text-zinc-400">Inspect parcel before payment</p>
            </div>
            <div className="pt-2 flex flex-col gap-1.5">
              <button
                onClick={onOpenAbout}
                className="text-[11px] text-zinc-400 hover:text-lime-400 transition-colors text-left font-medium"
              >
                About Us & Leadership (MD Jahid, CEO)
              </button>
              <button
                onClick={onOpenTrackOrder}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors text-left"
              >
                Track Your Order
              </button>
              <button
                onClick={onOpenAdmin}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                <Shield className="w-3 h-3 text-lime-400" />
                <span>Admin Management Portal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Facebook legal note */}
        <div className="pt-8 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} ApexKit Sportswear Bangladesh. Official Facebook: <a href={officialFacebookPageUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white underline">facebook.com/profile.php?id=100069685460999</a>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={onOpenAbout} className="hover:text-lime-400 transition-colors">About Us</button>
            <span aria-hidden="true">·</span>
            <span>Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Service</span>
            <span aria-hidden="true">·</span>
            <span>Made for Bangladeshi Sports Fans</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
