import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Shield, 
  PackageCheck, 
  Heart, 
  Bot, 
  Trophy, 
  Sparkles, 
  Award, 
  Compass, 
  Gift, 
  ExternalLink,
  User,
  HardDrive,
  Phone,
  MessageCircle,
  ChevronDown,
  Flame,
  Shirt,
  Flag,
  PenTool,
  Activity,
  History,
  Home,
  Layers,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenTrackOrder: () => void;
  onSelectCategory: (category: string) => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  onOpenJerseyStudio?: () => void;
  onOpenMatchCenter?: () => void;
  onOpenFanZone?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenTournaments?: () => void;
  onOpenGearFinder?: () => void;
  onOpenLoyalty?: () => void;
  onOpenAbout?: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenLiveSports?: () => void;
  currentPage?: 'store' | 'about' | 'live-sports';
}

const REAL_CATEGORIES = [
  {
    id: 'club-jerseys',
    name: 'Club Editions',
    description: 'European & domestic champions',
    icon: Shirt,
    badge: 'Trending'
  },
  {
    id: 'national-team',
    name: 'National Kits',
    description: 'World Cup & tournament jerseys',
    icon: Flag,
    badge: 'Popular'
  },
  {
    id: 'custom-jerseys',
    name: 'Custom Printed',
    description: 'Custom name & squad number print',
    icon: PenTool,
    badge: 'Custom'
  },
  {
    id: 'sports-tshirts',
    name: 'Training Tops',
    description: 'Gym, running & performance wear',
    icon: Activity,
    badge: 'Dri-FIT'
  },
  {
    id: 'retro-classics',
    name: 'Retro 90s Heritage',
    description: 'Iconic vintage squad jerseys',
    icon: History,
    badge: 'Heritage'
  }
];

const POPULAR_SEARCH_TAGS = [
  'Real Madrid',
  'Argentina',
  'Barcelona',
  'Retro 90s',
  'Custom Print',
  'Gym Tops'
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenTrackOrder,
  onSelectCategory,
  onOpenAdmin,
  onGoHome,
  onOpenJerseyStudio,
  onOpenMatchCenter,
  onOpenFanZone,
  onOpenAiAssistant,
  onOpenTournaments,
  onOpenGearFinder,
  onOpenLoyalty,
  onOpenAbout,
  onOpenGoogleDrive,
  onOpenLiveSports,
  currentPage = 'store'
}) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();

  const handleLiveSportsClick = () => {
    setMobileMenuOpen(false);
    setSearchBarOpen(false);
    onOpenLiveSports?.();
  };

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [sportsDropdownOpen, setSportsDropdownOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);
  const [mobileSportsOpen, setMobileSportsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Refs for click outside
  const categoriesRef = useRef<HTMLDivElement>(null);
  const sportsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const officialFacebookPageUrl = 'https://www.facebook.com/profile.php?id=100069685460999';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle click outside dropdowns & Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (categoriesRef.current && !categoriesRef.current.contains(target)) {
        setCategoriesDropdownOpen(false);
      }
      if (sportsRef.current && !sportsRef.current.contains(target)) {
        setSportsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCategoriesDropdownOpen(false);
        setSportsDropdownOpen(false);
        setSearchBarOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Focus search input when search bar opens
  useEffect(() => {
    if (searchBarOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchBarOpen]);

  // Navigation handlers
  const handleLogoClick = () => {
    onGoHome();
    setMobileMenuOpen(false);
    setSearchBarOpen(false);
  };

  const handleShopClick = () => {
    onSelectCategory('all');
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    onSelectCategory(categoryId);
    setCategoriesDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNewArrivalsClick = () => {
    onSelectCategory('all');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById('shop-catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleBestSellersClick = () => {
    onSelectCategory('all');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById('shop-catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleContactClick = () => {
    setMobileMenuOpen(false);
    const contactEl = document.getElementById('contact-us');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!navSearchQuery.trim()) {
      onOpenSearch();
      setSearchBarOpen(false);
      return;
    }

    const query = navSearchQuery.trim();
    setSearchBarOpen(false);
    setMobileMenuOpen(false);

    // Scroll to catalog and dispatch search to input
    const catalog = document.getElementById('shop-catalog');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
      const input = catalog.querySelector('input') as HTMLInputElement | null;
      if (input) {
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      }
    } else {
      onOpenSearch();
    }
  };

  const handleTagClick = (tag: string) => {
    setNavSearchQuery(tag);
    setSearchBarOpen(false);
    const catalog = document.getElementById('shop-catalog');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
      const input = catalog.querySelector('input') as HTMLInputElement | null;
      if (input) {
        input.value = tag;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      }
    } else {
      onOpenSearch();
    }
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled 
            ? 'bg-zinc-950/98 backdrop-blur-md shadow-lg shadow-black/40 border-b border-zinc-800' 
            : 'bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-850'
        }`}
        role="banner"
      >
        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
            
            {/* ========================================================= */}
            {/* ZONE 1: BRAND LOGO (Left)                                  */}
            {/* ========================================================= */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={handleLogoClick}
                className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-lg p-1 transition-transform active:scale-95"
                aria-label="Apex Kit Home"
              >
                {/* Brand Geometric Shield Emblem */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-zinc-900 border border-zinc-750 group-hover:border-lime-400/60 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm">
                  <div className="w-4 h-4 text-lime-400 transform -rotate-6 transition-transform group-hover:rotate-0">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                </div>

                {/* Brand Typography */}
                <div className="flex flex-col text-left">
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-white font-display uppercase leading-none flex items-center gap-1">
                    <span>APEX</span>
                    <span className="text-lime-400">KIT</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold leading-none mt-0.5 hidden xs:block">
                    Sports Performance
                  </span>
                </div>
              </button>
            </div>

            {/* ========================================================= */}
            {/* ZONE 2: CENTER NAVIGATION LINKS (Desktop: 1024px+)         */}
            {/* ========================================================= */}
            <nav 
              className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-zinc-300"
              role="navigation"
              aria-label="Main Navigation"
            >
              {/* Home */}
              <button 
                onClick={handleLogoClick}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 relative ${
                  currentPage === 'store' 
                    ? 'text-white font-bold' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <span>Home</span>
                {currentPage === 'store' && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-lime-400 rounded-full" />
                )}
              </button>

              {/* Shop (All Collection) */}
              <button 
                onClick={handleShopClick}
                className="px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Shop
              </button>

              {/* Live Sports & Scores */}
              <button 
                onClick={handleLiveSportsClick}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 relative flex items-center gap-1.5 ${
                  currentPage === 'live-sports' 
                    ? 'text-lime-400 font-bold' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Live Sports</span>
                {currentPage === 'live-sports' && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-lime-400 rounded-full" />
                )}
              </button>

              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesRef}>
                <button 
                  onClick={() => {
                    setCategoriesDropdownOpen(!categoriesDropdownOpen);
                    setSportsDropdownOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    categoriesDropdownOpen 
                      ? 'text-lime-400 bg-zinc-900' 
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                  aria-expanded={categoriesDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180 text-lime-400' : 'text-zinc-400'}`} />
                </button>

                {/* Categories Mega Dropdown Menu */}
                {categoriesDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-zinc-850">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Product Collections
                      </span>
                    </div>

                    <div className="py-1 space-y-1">
                      {REAL_CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 group transition-all flex items-start gap-3"
                            role="menuitem"
                          >
                            <div className="p-1.5 bg-zinc-900 group-hover:bg-zinc-800 border border-zinc-800 group-hover:border-lime-400/40 rounded-lg text-lime-400 transition-colors mt-0.5">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                                  {cat.name}
                                </span>
                                <span className="text-[9px] font-medium text-zinc-500 group-hover:text-lime-400">
                                  {cat.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate">
                                {cat.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 mt-1 border-t border-zinc-850 px-1">
                      <button
                        onClick={handleShopClick}
                        className="w-full py-1.5 px-3 text-center text-xs font-bold text-lime-400 hover:text-lime-300 hover:bg-lime-400/10 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Browse All Collections</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* New Arrivals */}
              <button 
                onClick={handleNewArrivalsClick}
                className="px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5 text-lime-400" />
                <span>New Arrivals</span>
              </button>

              {/* Best Sellers */}
              <button 
                onClick={handleBestSellersClick}
                className="px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Best Sellers
              </button>

              {/* Sports Hub Dropdown (Extended features) */}
              <div className="relative" ref={sportsRef}>
                <button 
                  onClick={() => {
                    setSportsDropdownOpen(!sportsDropdownOpen);
                    setCategoriesDropdownOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    sportsDropdownOpen 
                      ? 'text-lime-400 bg-zinc-900' 
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                  aria-expanded={sportsDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Sports Hub</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${sportsDropdownOpen ? 'rotate-180 text-lime-400' : 'text-zinc-400'}`} />
                </button>

                {/* Sports Hub Dropdown Menu */}
                {sportsDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-zinc-850">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Features & Utilities
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setSportsDropdownOpen(false);
                          onOpenJerseyStudio?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-200 hover:text-lime-400 text-xs font-medium flex items-center gap-2.5 transition-colors"
                        role="menuitem"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                        <span>Jersey Custom Studio</span>
                      </button>

                      <button
                        onClick={() => {
                          setSportsDropdownOpen(false);
                          onOpenMatchCenter?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-200 hover:text-lime-400 text-xs font-medium flex items-center gap-2.5 transition-colors"
                        role="menuitem"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Match Center & Scores</span>
                      </button>

                      <button
                        onClick={() => {
                          setSportsDropdownOpen(false);
                          onOpenFanZone?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-200 hover:text-lime-400 text-xs font-medium flex items-center gap-2.5 transition-colors"
                        role="menuitem"
                      >
                        <Award className="w-3.5 h-3.5 text-lime-400" />
                        <span>Fan Zone & Polls</span>
                      </button>

                      <button
                        onClick={() => {
                          setSportsDropdownOpen(false);
                          onOpenAiAssistant?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-200 hover:text-lime-400 text-xs font-medium flex items-center gap-2.5 transition-colors"
                        role="menuitem"
                      >
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Apex Kit AI Assistant</span>
                      </button>

                      <button
                        onClick={() => {
                          setSportsDropdownOpen(false);
                          onOpenTournaments?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-200 hover:text-lime-400 text-xs font-medium flex items-center gap-2.5 transition-colors"
                        role="menuitem"
                      >
                        <Trophy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Tournament Schedules</span>
                      </button>

                      <button
                        onClick={() => {
                          setSportsDropdownOpen(false);
                          onOpenGearFinder?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-200 hover:text-lime-400 text-xs font-medium flex items-center gap-2.5 transition-colors"
                        role="menuitem"
                      >
                        <Compass className="w-3.5 h-3.5 text-lime-400" />
                        <span>Smart Gear Finder</span>
                      </button>

                      <button
                        onClick={() => {
                          setSportsDropdownOpen(false);
                          onOpenLoyalty?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-200 hover:text-lime-400 text-xs font-medium flex items-center gap-2.5 transition-colors"
                        role="menuitem"
                      >
                        <Gift className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Loyalty Points & Rewards</span>
                      </button>

                      <button
                        onClick={() => {
                          setSportsDropdownOpen(false);
                          onOpenGoogleDrive?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-200 hover:text-blue-400 text-xs font-medium flex items-center gap-2.5 transition-colors"
                        role="menuitem"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                        <span>Google Drive Storage</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* About Us */}
              <button 
                onClick={onOpenAbout}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 relative ${
                  currentPage === 'about' 
                    ? 'text-lime-400 font-bold' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <span>About Us</span>
                {currentPage === 'about' && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-lime-400 rounded-full" />
                )}
              </button>

              {/* Contact Us */}
              <button 
                onClick={handleContactClick}
                className="px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Contact Us
              </button>
            </nav>

            {/* ========================================================= */}
            {/* ZONE 3: ACTIONS & UTILITIES CLUSTER (Right)                */}
            {/* ========================================================= */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              
              {/* Customer Hotline Click-to-Call (Desktop: 1280px+) */}
              <div className="hidden 2xl:flex items-center gap-2 pl-2 pr-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs">
                <Phone className="w-3.5 h-3.5 text-lime-400" />
                <a 
                  href="tel:01763943446"
                  className="font-mono text-zinc-200 hover:text-lime-400 transition-colors font-medium text-[11px]"
                  title="Call Apex Kit official support: 01763-943446"
                >
                  01763-943446
                </a>
                <span className="text-zinc-600">·</span>
                <a 
                  href="https://wa.me/8801763943446" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WA</span>
                </a>
              </div>

              {/* Official Facebook Follow Pill (Large screens) */}
              <a
                href={officialFacebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-lg transition-colors shadow-sm whitespace-nowrap"
                title="Follow Apex Kit on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Follow</span>
              </a>

              {/* Search Trigger Button */}
              <button
                onClick={() => setSearchBarOpen(!searchBarOpen)}
                className={`p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 ${
                  searchBarOpen 
                    ? 'bg-zinc-800 text-lime-400' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
                title="Search products (Click to open search)"
                aria-label="Toggle search panel"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Track Order Button (Visible on sm+ screens) */}
              <button
                onClick={onOpenTrackOrder}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                title="Track guest or registered order"
              >
                <PackageCheck className="w-3.5 h-3.5 text-lime-400" />
                <span>Track</span>
              </button>

              {/* Saved Wishlist with Live Counter */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 text-zinc-300 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                title={`Saved Wishlist (${wishlistCount} items)`}
                aria-label={`Wishlist with ${wishlistCount} saved items`}
              >
                <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform active:scale-125 ${wishlistCount > 0 ? 'text-red-500 fill-red-500/20' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums leading-none">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Admin Shield / Login Portal Button */}
              <button
                onClick={onOpenAdmin}
                className="p-2 text-zinc-400 hover:text-lime-400 transition-colors rounded-lg hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                title="Apex Kit Admin & Account Portal"
                aria-label="Admin and Account Portal"
              >
                <Shield className="w-4 h-4" />
              </button>

              {/* Primary Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-zinc-950 active:scale-95"
                aria-label={`Shopping cart with ${itemCount} items`}
                title={`Shopping Cart (${itemCount} items)`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="hidden sm:inline-block ml-1.5 text-xs font-black uppercase">
                  Cart
                </span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-1.5 bg-zinc-950 text-lime-400 font-mono text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-auto sm:h-auto sm:px-1.5 sm:py-0.2 rounded-full flex items-center justify-center border border-lime-400 sm:border-0 tabular-nums">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile / Tablet Menu Button (Visible on < 1024px screens) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-zinc-200 hover:text-white rounded-lg hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>

            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EXPANDABLE INTEGRATED SEARCH BAR (Desktop & Mobile)        */}
        {/* ========================================================= */}
        {searchBarOpen && (
          <div className="border-t border-zinc-800 bg-zinc-950/98 px-4 py-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search clubs, national kits, player jerseys, sizes (e.g. Real Madrid, Retro 90s)..."
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 focus:border-lime-400 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                  {navSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setNavSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white rounded"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs rounded-xl transition-colors shrink-0"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchBarOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {/* Popular Search Suggestions */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs text-zinc-400">
                <span className="text-[11px] font-medium text-zinc-500 mr-1">Popular:</span>
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-lime-400 border border-zinc-800 rounded-lg text-[11px] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* MOBILE & TABLET SLIDE-IN NAVIGATION DRAWER (< 1024px)      */}
      {/* Portaled directly to document.body to prevent parent       */}
      {/* backdrop-filter/height clipping!                         */}
      {/* ========================================================= */}
      {mounted && mobileMenuOpen && createPortal(
        <div 
          className="lg:hidden fixed inset-0 z-[9999] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Apex Kit Store Navigation Menu"
        >
          {/* Backdrop Click Outside */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col h-full z-10">
            
            {/* Drawer Header with Apex Kit Brand and Close (X) Button */}
            <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-950">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 focus:outline-none text-left"
              >
                <div className="w-8 h-8 bg-zinc-900 border border-zinc-750 rounded-xl flex items-center justify-center">
                  <div className="w-4 h-4 text-lime-400">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-xl font-black tracking-tight text-white font-display uppercase leading-none flex items-center gap-1">
                    <span>APEX</span>
                    <span className="text-lime-400">KIT</span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                    Store Menu
                  </span>
                </div>
              </button>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 border border-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-lime-400"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5 text-zinc-300" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              
              {/* Quick Search Launcher inside Drawer */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search jerseys, clubs, squads..."
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-lime-400 rounded-xl pl-10 pr-12 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
                {navSearchQuery ? (
                  <button
                    onClick={handleSearchSubmit}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-lime-400 text-zinc-950 font-bold rounded-lg text-[10px]"
                  >
                    Go
                  </button>
                ) : null}
              </div>

              {/* ======================================================= */}
              {/* SECTION 1: PRIMARY NAVIGATION LINKS                      */}
              {/* ======================================================= */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400 block mb-2 px-1">
                  Main Navigation
                </span>
                
                <nav className="space-y-1.5" aria-label="Mobile Navigation Links">
                  {/* Home */}
                  <button
                    onClick={handleLogoClick}
                    className={`w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm flex items-center justify-between min-h-[48px] transition-colors ${
                      currentPage === 'store'
                        ? 'bg-zinc-900 text-lime-400 border border-lime-400/20'
                        : 'text-zinc-100 hover:bg-zinc-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-lime-400" />
                      <span>Home</span>
                    </span>
                    {currentPage === 'store' && (
                      <span className="w-2 h-2 rounded-full bg-lime-400" />
                    )}
                  </button>

                  {/* Shop / All Products */}
                  <button
                    onClick={handleShopClick}
                    className="w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm text-zinc-100 hover:bg-zinc-900 hover:text-white border border-transparent min-h-[48px] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4 text-lime-400" />
                      <span>Shop / All Products</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">Catalog</span>
                  </button>

                  {/* Live Sports & Scores */}
                  <button
                    onClick={handleLiveSportsClick}
                    className={`w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm flex items-center justify-between min-h-[48px] transition-colors ${
                      currentPage === 'live-sports'
                        ? 'bg-zinc-900 text-lime-400 border border-lime-400/20'
                        : 'text-zinc-100 hover:bg-zinc-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Trophy className="w-4 h-4 text-lime-400" />
                      <span>Live Sports & Scores</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>LIVE</span>
                    </span>
                  </button>

                  {/* Categories Accordion */}
                  <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/60">
                    <button
                      onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                      className="w-full text-left px-3.5 py-3 font-semibold text-sm text-zinc-100 flex items-center justify-between min-h-[48px] hover:bg-zinc-850 transition-colors"
                      aria-expanded={mobileCategoriesOpen}
                    >
                      <span className="flex items-center gap-3">
                        <Layers className="w-4 h-4 text-lime-400" />
                        <span>Categories</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-mono">
                          {REAL_CATEGORIES.length} Collections
                        </span>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${mobileCategoriesOpen ? 'rotate-180 text-lime-400' : ''}`} />
                      </div>
                    </button>

                    {mobileCategoriesOpen && (
                      <div className="px-2 pb-2 space-y-1 border-t border-zinc-850 pt-2 bg-zinc-950/80">
                        {REAL_CATEGORIES.map((cat) => {
                          const IconComp = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => handleCategorySelect(cat.id)}
                              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center justify-between min-h-[42px] transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <IconComp className="w-4 h-4 text-lime-400 shrink-0" />
                                <div className="truncate">
                                  <div className="text-zinc-200 font-semibold">{cat.name}</div>
                                  <div className="text-[10px] text-zinc-500 truncate">{cat.description}</div>
                                </div>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono ml-2 shrink-0">
                                {cat.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* New Arrivals */}
                  <button
                    onClick={handleNewArrivalsClick}
                    className="w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm text-zinc-100 hover:bg-zinc-900 hover:text-white border border-transparent min-h-[48px] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>New Arrivals</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">Latest Drops</span>
                  </button>

                  {/* Best Sellers */}
                  <button
                    onClick={handleBestSellersClick}
                    className="w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm text-zinc-100 hover:bg-zinc-900 hover:text-white border border-transparent min-h-[48px] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Trophy className="w-4 h-4 text-lime-400" />
                      <span>Best Sellers</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">Most Loved</span>
                  </button>

                  {/* About Us */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAbout?.();
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm min-h-[48px] flex items-center justify-between transition-colors ${
                      currentPage === 'about'
                        ? 'bg-zinc-900 text-lime-400 border border-lime-400/20'
                        : 'text-zinc-100 hover:bg-zinc-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <User className="w-4 h-4 text-lime-400" />
                      <span>About Us</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </button>

                  {/* Contact Us */}
                  <button
                    onClick={handleContactClick}
                    className="w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm text-zinc-100 hover:bg-zinc-900 hover:text-white border border-transparent min-h-[48px] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-lime-400" />
                      <span>Contact Us</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">01763-943446</span>
                  </button>
                </nav>
              </div>

              {/* ======================================================= */}
              {/* SECTION 2: ACCOUNT, ORDERS & SHOPPING                    */}
              {/* ======================================================= */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400 block mb-2 px-1">
                  Account & Orders
                </span>
                
                <div className="space-y-1.5">
                  {/* Saved Wishlist */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsWishlistOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm text-zinc-100 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 min-h-[48px] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-red-500 fill-red-500/20' : 'text-zinc-400'}`} />
                      <span>Saved Wishlist</span>
                    </span>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono font-bold rounded-full">
                      {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
                    </span>
                  </button>

                  {/* Track Order */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenTrackOrder();
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm text-zinc-100 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 min-h-[48px] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <PackageCheck className="w-4 h-4 text-lime-400" />
                      <span>Track Order</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">Live Status</span>
                  </button>

                  {/* My Account / Admin Login */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left px-3.5 py-3 rounded-xl font-semibold text-sm text-zinc-100 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 min-h-[48px] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-lime-400" />
                      <span>My Account / Admin Login</span>
                    </span>
                    <LogIn className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* ======================================================= */}
              {/* SECTION 3: INTERACTIVE SPORTS HUB & UTILITIES           */}
              {/* ======================================================= */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400 block mb-2 px-1">
                  Sports Hub & AI Tools
                </span>
                
                <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/60">
                  <button
                    onClick={() => setMobileSportsOpen(!mobileSportsOpen)}
                    className="w-full text-left px-3.5 py-3 font-semibold text-sm text-zinc-100 flex items-center justify-between min-h-[48px] hover:bg-zinc-850 transition-colors"
                    aria-expanded={mobileSportsOpen}
                  >
                    <span className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-lime-400" />
                      <span>Interactive Sports Hub</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${mobileSportsOpen ? 'rotate-180 text-lime-400' : ''}`} />
                  </button>

                  {mobileSportsOpen && (
                    <div className="px-2 pb-2 space-y-1 border-t border-zinc-850 pt-2 bg-zinc-950/80">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenJerseyStudio?.();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-lime-400 hover:bg-zinc-900 flex items-center gap-2.5 min-h-[42px]"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Jersey Custom Studio</span>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenMatchCenter?.();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 min-h-[42px]"
                      >
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Sports Match Center & Scores</span>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenFanZone?.();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 min-h-[42px]"
                      >
                        <Award className="w-4 h-4 text-lime-400" />
                        <span>Fan Zone Quizzes & Polls</span>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenAiAssistant?.();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 min-h-[42px]"
                      >
                        <Bot className="w-4 h-4 text-cyan-400" />
                        <span>Apex Kit AI Assistant</span>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenTournaments?.();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 min-h-[42px]"
                      >
                        <Trophy className="w-4 h-4 text-zinc-400" />
                        <span>Tournaments Hub</span>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenGearFinder?.();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 min-h-[42px]"
                      >
                        <Compass className="w-4 h-4 text-lime-400" />
                        <span>Smart Gear Finder</span>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenLoyalty?.();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 min-h-[42px]"
                      >
                        <Gift className="w-4 h-4 text-emerald-400" />
                        <span>Loyalty Points & Rewards</span>
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenGoogleDrive?.();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 min-h-[42px]"
                      >
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        <span>Google Drive Storage Hub</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ======================================================= */}
              {/* SECTION 4: OFFICIAL SUPPORT & HOTLINE                   */}
              {/* ======================================================= */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-850">
                <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400 block px-1">
                  Customer Support
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:01763943446"
                    className="flex items-center justify-center gap-2 py-3 px-2 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 rounded-xl font-mono text-xs font-bold min-h-[48px] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-lime-400 shrink-0" />
                    <span>01763-943446</span>
                  </a>
                  <a
                    href="https://wa.me/8801763943446"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold min-h-[48px] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <a
                  href={officialFacebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl flex items-center justify-between min-h-[48px] transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Follow Official Facebook Page</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>

            {/* Drawer Footer with Cart Button */}
            <div className="shrink-0 p-4 border-t border-zinc-850 bg-zinc-950/98">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-between py-3.5 px-4 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold rounded-xl transition-all shadow-md min-h-[48px]"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-zinc-950" />
                  <span className="text-sm font-black uppercase tracking-wide">View Shopping Cart</span>
                </span>
                <span className="bg-zinc-950 text-lime-400 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold tabular-nums">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};
