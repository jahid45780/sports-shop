import React, { useState } from 'react';
import { X, RotateCw, Check, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import type { ProductSize } from '../types/index.ts';

interface JerseyStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export const JerseyStudioModal: React.FC<JerseyStudioModalProps> = ({
  isOpen,
  onClose,
  onOpenCart
}) => {
  const { addToCart } = useCart();

  const [view, setView] = useState<'front' | 'back'>('back');
  const [playerName, setPlayerName] = useState('SAKIB');
  const [playerNumber, setPlayerNumber] = useState('10');
  const [selectedSize, setSelectedSize] = useState<ProductSize>('L');
  const [selectedFont, setSelectedFont] = useState<'athletic' | 'block' | 'modern'>('athletic');
  const [selectedKitTheme, setSelectedKitTheme] = useState<'stealth' | 'royal' | 'emerald' | 'crimson'>('stealth');

  const BASE_PRICE = 1450;
  const CUSTOM_PRINT_COST = 200;
  const TOTAL_PRICE = BASE_PRICE + CUSTOM_PRINT_COST;

  const kitThemes = {
    stealth: {
      name: 'Stealth Black & Gold',
      bodyColor: '#121214',
      accentColor: '#EAB308',
      numColor: '#EAB308',
      numStroke: '#FFFFFF',
      badge: 'GOLD CREST',
      collarColor: '#27272a'
    },
    royal: {
      name: 'Royal Blue & White',
      bodyColor: '#1E3A8A',
      accentColor: '#FFFFFF',
      numColor: '#FFFFFF',
      numStroke: '#93C5FD',
      badge: 'HERITAGE SHIELD',
      collarColor: '#172554'
    },
    emerald: {
      name: 'Emerald Green & Red (Tigers Edition)',
      bodyColor: '#064E3B',
      accentColor: '#DC2626',
      numColor: '#FACC15',
      numStroke: '#DC2626',
      badge: 'TIGERS CREST',
      collarColor: '#022C22'
    },
    crimson: {
      name: 'Crimson Red & Charcoal',
      bodyColor: '#991B1B',
      accentColor: '#18181B',
      numColor: '#FFFFFF',
      numStroke: '#18181B',
      badge: 'CHAMPIONS STAR',
      collarColor: '#7F1D1D'
    }
  };

  const currentTheme = kitThemes[selectedKitTheme];

  if (!isOpen) return null;

  const handleAddToCart = () => {
    const formattedName = playerName.trim().toUpperCase() || 'PLAYER';
    const formattedNum = playerNumber.trim() || '10';

    addToCart({
      productId: 'prod-4', // Custom print jersey ID in catalog
      name: `Custom Studio Jersey - ${currentTheme.name}`,
      slug: 'custom-team-print-jersey-10',
      image: '/src/assets/images/product_custom_jersey_1792747711299.jpg',
      size: selectedSize,
      color: currentTheme.name,
      price: BASE_PRICE,
      maxStock: 25,
      customPrint: {
        playerName: formattedName,
        playerNumber: formattedNum,
        extraCost: CUSTOM_PRINT_COST
      }
    }, 1);

    onClose();
    onOpenCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jersey-studio-title"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="jersey-studio-title" className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-white">
                  Jersey Customization Studio
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                  Interactive 2D Preview
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Print your own name & lucky number on premium breathable player-issue micro-mesh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close custom studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-8 items-center">
          
          {/* Left Column: Visual Jersey Canvas Preview */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* View Switcher Controls */}
            <div className="flex items-center gap-2 mb-4 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
              <button
                onClick={() => setView('front')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  view === 'front' 
                    ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Front View</span>
              </button>
              <button
                onClick={() => setView('back')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  view === 'back' 
                    ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Back View (Name & No)</span>
              </button>
            </div>

            {/* Visual Jersey SVG Canvas */}
            <div className="relative w-full max-w-[320px] aspect-[4/5] bg-zinc-950/80 border border-zinc-800 rounded-3xl p-4 flex items-center justify-center shadow-inner overflow-hidden">
              
              {/* Subtle athletic field lines in background */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <svg 
                viewBox="0 0 320 380" 
                className="w-full h-full drop-shadow-2xl transition-all duration-300"
              >
                <defs>
                  {/* Subtle fabric mesh pattern */}
                  <pattern id="jerseyMesh" width="4" height="4" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.75" fill="#ffffff" opacity="0.06" />
                  </pattern>
                  <linearGradient id="bodyShade" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                  </linearGradient>
                </defs>

                {/* Jersey Main Body Silhouette */}
                <path
                  d="M 95 35 
                     L 135 48 
                     Q 160 56 185 48 
                     L 225 35 
                     L 290 85 
                     L 255 130 
                     L 225 105 
                     L 230 350 
                     Q 160 365 90 350 
                     L 95 105 
                     L 65 130 
                     L 30 85 
                     Z"
                  fill={currentTheme.bodyColor}
                  stroke="#27272a"
                  strokeWidth="2"
                />

                {/* Micro-mesh fabric overlay */}
                <path
                  d="M 95 35 L 135 48 Q 160 56 185 48 L 225 35 L 290 85 L 255 130 L 225 105 L 230 350 Q 160 365 90 350 L 95 105 L 65 130 L 30 85 Z"
                  fill="url(#jerseyMesh)"
                />
                <path
                  d="M 95 35 L 135 48 Q 160 56 185 48 L 225 35 L 290 85 L 255 130 L 225 105 L 230 350 Q 160 365 90 350 L 95 105 L 65 130 L 30 85 Z"
                  fill="url(#bodyShade)"
                />

                {/* Collar */}
                <path
                  d="M 135 48 Q 160 62 185 48 L 180 38 Q 160 48 140 38 Z"
                  fill={currentTheme.collarColor}
                  stroke={currentTheme.accentColor}
                  strokeWidth="1.5"
                />

                {/* Sleeve Trim Stripes */}
                <path d="M 33 82 L 40 92 L 67 127 L 62 133 Z" fill={currentTheme.accentColor} />
                <path d="M 287 82 L 280 92 L 253 127 L 258 133 Z" fill={currentTheme.accentColor} />

                {/* FRONT VIEW CONTENT */}
                {view === 'front' && (
                  <g className="animate-in fade-in duration-200">
                    {/* Club Chest Crest (Left Chest) */}
                    <circle cx="120" cy="115" r="15" fill={currentTheme.accentColor} opacity="0.15" />
                    <circle cx="120" cy="115" r="12" fill="#000000" stroke={currentTheme.accentColor} strokeWidth="1.5" />
                    <text x="120" y="119" textAnchor="middle" fill={currentTheme.accentColor} fontSize="8" fontWeight="bold">
                      APK
                    </text>
                    <polygon points="120,95 122,101 128,101 123,105 125,111 120,107 115,111 117,105 112,101 118,101" fill={currentTheme.accentColor} transform="scale(0.8) translate(30, 22)" />

                    {/* Manufacturer Logo (Right Chest) */}
                    <path d="M 195 115 L 205 112 L 203 118 Z" fill={currentTheme.accentColor} />

                    {/* Center Sponsor / Brand */}
                    <rect x="105" y="180" width="110" height="30" rx="4" fill="#000000" opacity="0.4" />
                    <text x="160" y="200" textAnchor="middle" fill={currentTheme.accentColor} fontSize="14" fontWeight="900" fontFamily="sans-serif" letterSpacing="3">
                      APEXKIT
                    </text>

                    {/* Authentic Player Issue Tag at Hem */}
                    <rect x="105" y="325" width="28" height="14" rx="2" fill="#27272a" stroke={currentTheme.accentColor} strokeWidth="0.8" />
                    <text x="119" y="334" textAnchor="middle" fill="#ffffff" fontSize="5" fontWeight="bold">
                      AUTHENTIC
                    </text>
                  </g>
                )}

                {/* BACK VIEW CONTENT (Player Name & Number) */}
                {view === 'back' && (
                  <g className="animate-in fade-in duration-200">
                    {/* Upper Back Ventilation Mesh Rib */}
                    <line x1="120" y1="80" x2="200" y2="80" stroke={currentTheme.accentColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

                    {/* Player Nameplate */}
                    <text
                      x="160"
                      y="118"
                      textAnchor="middle"
                      fill={currentTheme.accentColor}
                      fontSize={playerName.length > 8 ? '18' : '22'}
                      fontWeight="900"
                      fontFamily={selectedFont === 'athletic' ? 'Barlow Condensed, sans-serif' : 'Arial Black, sans-serif'}
                      letterSpacing="3"
                      style={{ textTransform: 'uppercase' }}
                    >
                      {playerName.trim().toUpperCase() || 'PLAYER'}
                    </text>

                    {/* Large Player Number */}
                    <text
                      x="160"
                      y="235"
                      textAnchor="middle"
                      fill={currentTheme.numColor}
                      stroke={currentTheme.numStroke}
                      strokeWidth="2.5"
                      fontSize="95"
                      fontWeight="900"
                      fontFamily="Arial Black, Impact, sans-serif"
                      letterSpacing="1"
                      className="drop-shadow-lg"
                    >
                      {playerNumber.trim() || '10'}
                    </text>

                    {/* Bangladesh Flag Accent Badge on Nape */}
                    <rect x="153" y="62" width="14" height="8" rx="1" fill="#006A4E" />
                    <circle cx="159" cy="66" r="2.5" fill="#F42A41" />
                  </g>
                )}
              </svg>
            </div>

            <p className="mt-3 text-[11px] text-zinc-400 text-center">
              Click <span className="text-lime-400 font-bold">Front / Back</span> above to inspect your custom heat-pressed print.
            </p>
          </div>

          {/* Right Column: Customization Form & Options */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Color Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                1. Select Kit Color Edition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(kitThemes) as (keyof typeof kitThemes)[]).map((themeKey) => {
                  const t = kitThemes[themeKey];
                  const isSelected = selectedKitTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setSelectedKitTheme(themeKey)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected 
                          ? 'border-lime-400 bg-lime-400/5 ring-1 ring-lime-400/30' 
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <div 
                        className="w-5 h-5 rounded-full border border-zinc-700 shrink-0" 
                        style={{ backgroundColor: t.bodyColor }} 
                      />
                      <span className="text-xs font-bold text-zinc-200 truncate">{t.name.split(' ')[0]} {t.name.split(' ')[1]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Number Inputs */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                2. Player Name & Jersey Number
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] text-zinc-400">Back Name (Max 12 letters)</span>
                  <input
                    type="text"
                    maxLength={12}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''))}
                    placeholder="e.g. SAKIB"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400">Number (0-99)</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value.slice(0, 2))}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-center text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                3. Select Player Fit Size
              </label>
              <div className="flex gap-2">
                {(['S', 'M', 'L', 'XL', 'XXL'] as ProductSize[]).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === sz
                        ? 'border-lime-400 bg-lime-400 text-zinc-950 shadow-sm'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Player Edition Micro-Mesh Base</span>
                <span className="font-mono text-zinc-200">৳{BASE_PRICE}</span>
              </div>
              <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                <span>Custom Name & Number Heat Print</span>
                <span className="font-mono text-lime-400">+৳{CUSTOM_PRINT_COST}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-white pt-1">
                <span>Total Payable Amount (COD)</span>
                <span className="text-lg font-black font-mono text-lime-400">৳{TOTAL_PRICE}</span>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 px-6 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black uppercase text-sm tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-lime-400/20 active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Customized Kit to Cart (৳{TOTAL_PRICE})</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
              <Check className="w-3.5 h-3.5 text-lime-400" />
              <span>Durable Heat-Pressed Rubberized Vinyl · Inspect before paying COD</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
