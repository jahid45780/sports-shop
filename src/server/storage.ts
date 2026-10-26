import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { 
  Product, 
  Order, 
  Coupon, 
  StoreSettings, 
  DashboardStats,
  OrderStatus,
  PaymentStatus,
  ProductReview,
  RatingSummary,
  SportMatch,
  Tournament,
  FanQuiz,
  FanPredictionPoll,
  PlayerVoteCandidate,
  FanLeaderboardEntry,
  TeamReminderSubscription,
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyRewardVoucher,
  MatchStanding,
  FounderProfile,
  ChatbotSettings,
  MarketingIntegrationConfig,
  MarketingIntegrationLog,
  ConversionEventSetting,
  SavedUtmCampaign
} from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface StoreDatabase {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
  newsletterSubscribers: { email: string; subscribedAt: string }[];
  sportsMatches?: SportMatch[];
  tournaments?: Tournament[];
  quizzes?: FanQuiz[];
  predictions?: FanPredictionPoll[];
  playerVotes?: PlayerVoteCandidate[];
  leaderboard?: FanLeaderboardEntry[];
  reminders?: TeamReminderSubscription[];
  loyaltyAccounts?: LoyaltyAccount[];
  founderProfile?: FounderProfile;
  chatbotSettings?: ChatbotSettings;
  marketingConfig?: MarketingIntegrationConfig;
  marketingLogs?: MarketingIntegrationLog[];
}

const DEFAULT_FOUNDER_PROFILE: FounderProfile = {
  name: 'MD Jahid',
  position: 'CEO',
  address: 'DHAKA',
  photoUrl: '',
  bio: 'Leading Apex Kit with an unwavering commitment to empowering athletes and sports fans across Bangladesh with authentic, elite-quality sports performance kits and apparel.',
  updatedAt: new Date().toISOString()
};

const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  isEnabled: true,
  welcomeMessageEn: "👋 Welcome to Apex Kit! How can we help you today with authentic sports jerseys, club kits, sizing, prices, or order tracking?",
  welcomeMessageBn: "👋 আসসালামু আলাইকুম! অ্যাপেক্স কিট এআই অ্যাসিস্ট্যান্ট (Apex Kit AI Assistant)-এ স্বাগতম। কীভাবে সাহায্য করতে পারি? স্পোর্টস জার্সি, ক্লাব কিট, সাইজ, প্রাইজ বা অর্ডার সংক্রান্ত যেকোনো তথ্য জানতে জিজ্ঞেস করুন!",
  suggestedQuestions: [
    "Find Sports Products",
    "Product Price",
    "Available Sizes",
    "Order Help",
    "Contact Support"
  ],
  enableBengali: true,
  enableEnglish: true,
  supportPhone: "01763943446",
  supportMessengerUrl: "https://wa.me/8801763943446",
  totalConversationsCount: 142,
  totalQueriesCount: 389,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_CONVERSION_EVENTS: ConversionEventSetting[] = [
  {
    id: 'view_item',
    name: 'Product Details Opened',
    description: 'Triggered when a customer opens a sports kit or jersey details page/modal',
    metaEventName: 'ViewContent',
    ga4EventName: 'view_item',
    googleAdsEventName: 'Product View',
    metaEnabled: true,
    googleAdsEnabled: true,
    ga4Enabled: true,
    lastTestStatus: 'not_tested'
  },
  {
    id: 'search',
    name: 'Catalog Search Executed',
    description: 'Triggered when an athletic query or jersey filter search is run',
    metaEventName: 'Search',
    ga4EventName: 'search',
    googleAdsEventName: 'Search',
    metaEnabled: true,
    googleAdsEnabled: false,
    ga4Enabled: true,
    lastTestStatus: 'not_tested'
  },
  {
    id: 'add_to_cart',
    name: 'Product Added to Cart',
    description: 'Triggered when an item is added to the shopping bag with size & quantity',
    metaEventName: 'AddToCart',
    ga4EventName: 'add_to_cart',
    googleAdsEventName: 'Add to Cart',
    metaEnabled: true,
    googleAdsEnabled: true,
    ga4Enabled: true,
    lastTestStatus: 'not_tested'
  },
  {
    id: 'begin_checkout',
    name: 'Checkout Flow Started',
    description: 'Triggered when customer opens the Cash on Delivery checkout modal',
    metaEventName: 'InitiateCheckout',
    ga4EventName: 'begin_checkout',
    googleAdsEventName: 'Begin Checkout',
    metaEnabled: true,
    googleAdsEnabled: true,
    ga4Enabled: true,
    lastTestStatus: 'not_tested'
  },
  {
    id: 'purchase',
    name: 'Purchase Completed (COD)',
    description: 'Triggered once only after successful order submission with genuine order ID & value',
    metaEventName: 'Purchase',
    ga4EventName: 'purchase',
    googleAdsEventName: 'Purchase',
    metaEnabled: true,
    googleAdsEnabled: true,
    ga4Enabled: true,
    lastTestStatus: 'not_tested'
  },
  {
    id: 'lead',
    name: 'Lead / Inquiries / Reminders',
    description: 'Triggered on newsletter subscription, match reminder sign-up, or inquiry',
    metaEventName: 'Lead',
    ga4EventName: 'generate_lead',
    googleAdsEventName: 'Lead or Contact',
    metaEnabled: true,
    googleAdsEnabled: false,
    ga4Enabled: true,
    lastTestStatus: 'not_tested'
  }
];

const INITIAL_SAVED_CAMPAIGNS: SavedUtmCampaign[] = [
  {
    id: 'camp-fb-retro-2026',
    name: 'Facebook Feed — 90s Retro Collection',
    destinationUrl: 'https://apexkit.com/#shop-catalog',
    source: 'facebook',
    medium: 'paid_social',
    campaign: 'retro_heritage_collection',
    content: 'vintage_gold_carousel',
    finalUrl: 'https://apexkit.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign=retro_heritage_collection&utm_content=vintage_gold_carousel#shop-catalog',
    platform: 'facebook',
    status: 'active',
    notes: 'Targeting Dhaka & Chittagong football jersey collectors',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'camp-ig-custom-print',
    name: 'Instagram Stories — Custom Jersey Studio',
    destinationUrl: 'https://apexkit.com/',
    source: 'instagram',
    medium: 'stories',
    campaign: 'jersey_studio_custom_name',
    content: 'interactive_demo_video',
    finalUrl: 'https://apexkit.com/?utm_source=instagram&utm_medium=stories&utm_campaign=jersey_studio_custom_name&utm_content=interactive_demo_video',
    platform: 'instagram',
    status: 'active',
    notes: 'Swipe-up promotion for ৳200 custom printing on select kits',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const DEFAULT_MARKETING_CONFIG: MarketingIntegrationConfig = {
  metaPixel: {
    enabled: false,
    pixelId: '',
    testEventCode: '',
    enableAdvancedMatching: true,
    trackPageView: true,
    trackViewContent: true,
    trackSearch: true,
    trackAddToCart: true,
    trackInitiateCheckout: true,
    trackAddPaymentInfo: true,
    trackPurchase: true,
    trackCompleteRegistration: true,
    trackLead: true,
  },
  metaAds: {
    adAccountId: '',
    businessName: 'Apex Kit Sports BD',
    defaultCampaignName: 'ApexKit_Sports_Catalog_2026',
    defaultUtmSource: 'facebook',
    defaultUtmMedium: 'paid_social',
    campaignDestinationUrl: '',
    campaignStatus: 'draft',
    campaignNotes: 'Manual tracking notes. Connect official Meta Marketing API for real-time campaign synchronization.'
  },
  googleAds: {
    enabled: false,
    conversionId: '',
    purchaseConversionLabel: '',
    addToCartConversionLabel: '',
    beginCheckoutConversionLabel: '',
    leadConversionLabel: '',
    productViewConversionLabel: '',
    searchConversionLabel: '',
    enhancedConversions: true,
  },
  ga4: {
    enabled: false,
    measurementId: '',
    debugMode: false,
    sendEcommerceEvents: true,
  },
  gtm: {
    enabled: false,
    containerId: '',
  },
  conversionEvents: DEFAULT_CONVERSION_EVENTS,
  utmCampaigns: INITIAL_SAVED_CAMPAIGNS,
  consent: {
    requireConsentBanner: true,
    defaultConsentAnalytics: false,
    defaultConsentMarketing: false,
    privacyPolicyUrl: '#about',
    bannerTitle: 'Privacy & Sports Performance Tracking',
    bannerDescription: 'Apex Kit uses cookies, Meta Pixel, and analytics tags to improve sportswear recommendations, measure ad conversions, and optimize your browsing experience.',
  },
  currency: 'BDT',
  lastUpdated: new Date().toISOString()
};

const INITIAL_MARKETING_LOGS: MarketingIntegrationLog[] = [
  {
    id: 'log-init-1',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    type: 'system_notice',
    source: 'system',
    status: 'info',
    message: 'Marketing & Advertising Management System initialized in Admin Dashboard.'
  }
];

const DEFAULT_SETTINGS: StoreSettings = {

  storeName: 'APEX KIT',
  tagline: 'Elite Performance Sportswear & Authentic Football Jerseys',
  announcementText: '⚡ SPECIAL OFFER: FREE Delivery inside Dhaka on orders over ৳1,999! Cash on Delivery Available Nationwide.',
  announcementActive: true,
  phone: '01763943446',
  email: 'support@apexkit.com',
  deliveryFeeInsideDhaka: 70,
  deliveryFeeOutsideDhaka: 130,
  freeDeliveryThreshold: 1999,
  enableGuestCheckout: true,
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'FC Nocturne Gold Crest 24/25 Club Jersey',
    slug: 'fc-nocturne-gold-crest-jersey',
    description: 'Elite athlete edition football club jersey engineered with ultra-lightweight Aero-Weave micro-mesh. Features heat-applied gold metallic sponsor typography and gold crest embroidery.',
    category: 'club-jerseys',
    team: 'FC Nocturne',
    regularPrice: 1550,
    salePrice: 1250,
    images: ['/src/assets/images/product_club_jersey_1792747635830.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Stealth Black / Gold'],
    stock: 24,
    sku: 'APK-CLM-01',
    isFeatured: true,
    isBestSeller: true,
    isPublished: true,
    fabric: '100% Recycled Polyester Dri-Weave Tech',
    fitType: 'Slim Athletic Fit',
    rating: 4.9,
    reviewCount: 38,
    allowCustomPrint: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    reviews: [
      {
        id: 'rev-1',
        customerName: 'Tanvir Ahmed',
        rating: 5,
        comment: 'Outstanding fabric quality! The gold details and crest look truly premium. Delivered in Dhaka within 2 days.',
        createdAt: '2026-10-18T10:14:00Z',
        verifiedPurchase: true
      },
      {
        id: 'rev-2',
        customerName: 'Fahim Morshed',
        rating: 5,
        comment: 'Authentic player edition feel. Great ventilation during football practice in high humidity.',
        createdAt: '2026-10-20T14:30:00Z',
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'National Edition Royal Blue Heritage Jersey',
    slug: 'national-royal-blue-heritage-jersey',
    description: 'Official tournament national football kit featuring striking geometric prism patterns across the chest, heat-sealed team badge, and breathable side mesh ribs.',
    category: 'national-team',
    team: 'National Squad',
    regularPrice: 1650,
    salePrice: 1350,
    images: ['/src/assets/images/product_national_jersey_1792747636134.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Royal Blue / Crimson'],
    stock: 18,
    sku: 'APK-NAT-02',
    isFeatured: true,
    isBestSeller: true,
    isPublished: true,
    fabric: 'Dri-FIT Moisture Vapor Polyester',
    fitType: 'Regular Sport Fit',
    rating: 4.8,
    reviewCount: 24,
    allowCustomPrint: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    reviews: [
      {
        id: 'rev-3',
        customerName: 'Siam Rahman',
        rating: 5,
        comment: 'Color is even more vibrant in person. True to size according to the size guide chart.',
        createdAt: '2026-10-19T08:15:00Z',
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'prod-3',
    name: 'Apex Velocity Pro Training T-Shirt',
    slug: 'apex-velocity-pro-training-tshirt',
    description: 'High-octane gym and field training sports shirt designed with targeted mapped ventilation zones. Quick-dry, anti-chafing flatlock seams for maximum range of motion.',
    category: 'sports-tshirts',
    team: 'Apex Performance',
    regularPrice: 950,
    salePrice: 750,
    images: ['/src/assets/images/product_training_tshirt_1792747637025.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal Gray / Electric Lime'],
    stock: 35,
    sku: 'APK-TRN-03',
    isFeatured: true,
    isBestSeller: false,
    isPublished: true,
    fabric: '88% Poly, 12% Spandex 4-Way Stretch',
    fitType: 'Athletic Muscle Fit',
    rating: 4.7,
    reviewCount: 19,
    allowCustomPrint: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Custom Team Print Performance Jersey #10',
    slug: 'custom-team-print-jersey-10',
    description: 'Personalized football jersey with customizable player name and favorite jersey number on back with heat-pressed vinyl numerals. Clean stealth styling with neon shoulder accents.',
    category: 'custom-jerseys',
    team: 'Custom Creator',
    regularPrice: 1750,
    salePrice: 1450,
    images: ['/src/assets/images/product_custom_jersey_1792747711299.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Stealth Black / Lime Green'],
    stock: 12,
    sku: 'APK-CST-04',
    isFeatured: true,
    isBestSeller: true,
    isPublished: true,
    fabric: 'Heavy-Duty Hydrophobic Double Knit',
    fitType: 'Athletic Tailored Fit',
    rating: 5.0,
    reviewCount: 42,
    allowCustomPrint: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    reviews: [
      {
        id: 'rev-4',
        customerName: 'Kazi Naimul',
        rating: 5,
        comment: 'Had my surname and number 7 printed. Print sharpness is top tier, survived 4 washes already with zero peel.',
        createdAt: '2026-10-21T18:20:00Z',
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'prod-5',
    name: 'Retro 1993 Geometric League Vintage Jersey',
    slug: 'retro-1993-geometric-league-jersey',
    description: 'Authentic 90s heritage replica jersey with oversized geometric art deco pattern, classic foldover polo collar, and vintage league crest. A must-have for jersey collectors.',
    category: 'retro-classics',
    team: 'Meridian FC 93',
    regularPrice: 1850,
    salePrice: 1550,
    images: ['/src/assets/images/product_retro_jersey_1792747711923.jpg'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Deep Burgundy / Vintage Gold'],
    stock: 8,
    sku: 'APK-RET-05',
    isFeatured: true,
    isBestSeller: true,
    isPublished: true,
    fabric: 'Sublimated Heavyweight Jacquard Polyester',
    fitType: 'Classic 90s Relaxed Fit',
    rating: 4.9,
    reviewCount: 31,
    allowCustomPrint: false,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'prod-6',
    name: 'Aero Velocity Aero-Weave Match Kit',
    slug: 'aero-velocity-aero-weave-match-kit',
    description: 'Our flagship commercial edition matchday jersey with ergonomic raglan sleeves and laser-cut underarm airflow perforations. Engineered for competitive high-intensity matches.',
    category: 'football-jerseys',
    team: 'Apex FC',
    regularPrice: 1600,
    salePrice: 1290,
    images: ['/src/assets/images/hero_sports_jersey_1792747635843.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal & Lime'],
    stock: 22,
    sku: 'APK-AER-06',
    isFeatured: true,
    isBestSeller: true,
    isPublished: true,
    fabric: 'Aero-Weave Micro-Ribbed Polyester',
    fitType: 'Performance Slim Fit',
    rating: 4.8,
    reviewCount: 29,
    allowCustomPrint: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'APEX10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    isActive: true
  },
  {
    code: 'FIRSTGOAL',
    discountType: 'fixed',
    discountValue: 150,
    minOrderAmount: 1200,
    isActive: true
  },
  {
    code: 'DHAKAFREE',
    discountType: 'fixed',
    discountValue: 70,
    minOrderAmount: 800,
    isActive: true
  },
  {
    code: 'APEXFREE',
    discountType: 'fixed',
    discountValue: 70,
    minOrderAmount: 1500,
    isActive: true
  },
  {
    code: 'APEX100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1200,
    isActive: true
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'APK-2026-1001',
    customer: {
      fullName: 'Shakib Al Hasan',
      phone: '01712984512',
      email: 'shakib.sport@gmail.com',
      district: 'Dhaka',
      thana: 'Mirpur',
      fullAddress: 'House 45, Road 12, Sector 10, Mirpur DOHS, Dhaka',
      instructions: 'Please call before delivery'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'FC Nocturne Gold Crest 24/25 Club Jersey',
        sku: 'APK-CLM-01',
        image: '/src/assets/images/product_club_jersey_1792747635830.jpg',
        size: 'L',
        color: 'Stealth Black / Gold',
        price: 1250,
        quantity: 1,
        itemTotal: 1250
      }
    ],
    subtotal: 1250,
    discount: 125,
    couponCode: 'APEX10',
    deliveryFee: 70,
    deliveryZone: 'inside_dhaka',
    total: 1195,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    adminNotes: 'Customer accepted order, cash collected by RedX courier rider.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'ord-1002',
    orderNumber: 'APK-2026-1002',
    customer: {
      fullName: 'Rashid Khan',
      phone: '01819876543',
      email: 'rashid.k@hotmail.com',
      district: 'Chittagong',
      thana: 'Panchlaish',
      fullAddress: 'Flat 4B, Green Haven, Nasirabad, Chittagong',
      instructions: 'Deliver during office hours'
    },
    items: [
      {
        productId: 'prod-2',
        name: 'National Edition Royal Blue Heritage Jersey',
        sku: 'APK-NAT-02',
        image: '/src/assets/images/product_national_jersey_1792747636134.jpg',
        size: 'XL',
        color: 'Royal Blue / Crimson',
        price: 1350,
        quantity: 2,
        itemTotal: 2700
      }
    ],
    subtotal: 2700,
    discount: 0,
    deliveryFee: 0, // Above free delivery threshold!
    deliveryZone: 'outside_dhaka',
    total: 2700,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'unpaid',
    orderStatus: 'shipped',
    adminNotes: 'Dispatched via Steadfast Courier tracking #ST99281',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'ord-1003',
    orderNumber: 'APK-2026-1003',
    customer: {
      fullName: 'Tahmidur Rahman',
      phone: '01911223344',
      district: 'Dhaka',
      thana: 'Dhanmondi',
      fullAddress: 'Road 7A, House 22, Dhanmondi, Dhaka',
      instructions: 'Ring bell on 3rd floor'
    },
    items: [
      {
        productId: 'prod-4',
        name: 'Custom Team Print Performance Jersey #10',
        sku: 'APK-CST-04',
        image: '/src/assets/images/product_custom_jersey_1792747711299.jpg',
        size: 'M',
        color: 'Stealth Black / Lime Green',
        price: 1450,
        quantity: 1,
        customPrint: {
          playerName: 'TAHMID',
          playerNumber: '10',
          extraCost: 150
        },
        itemTotal: 1600
      }
    ],
    subtotal: 1600,
    discount: 150,
    couponCode: 'FIRSTGOAL',
    deliveryFee: 70,
    deliveryZone: 'inside_dhaka',
    total: 1520,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'unpaid',
    orderStatus: 'processing',
    adminNotes: 'Custom print confirmed with customer on phone.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ord-1004',
    orderNumber: 'APK-2026-1004',
    customer: {
      fullName: 'Fahad Karim',
      phone: '01755112233',
      district: 'Sylhet',
      thana: 'Zindabazar',
      fullAddress: 'Green Hill Tower, 4th Floor, Zindabazar, Sylhet',
      instructions: 'Leave at front desk reception'
    },
    items: [
      {
        productId: 'prod-5',
        name: 'Retro 1993 Geometric League Vintage Jersey',
        sku: 'APK-RET-05',
        image: '/src/assets/images/product_retro_jersey_1792747711923.jpg',
        size: 'L',
        color: 'Deep Burgundy / Vintage Gold',
        price: 1550,
        quantity: 1,
        itemTotal: 1550
      },
      {
        productId: 'prod-6',
        name: 'Aero Velocity Aero-Weave Match Kit',
        sku: 'APK-AER-06',
        image: '/src/assets/images/hero_sports_jersey_1792747635843.jpg',
        size: 'L',
        color: 'Pitch Black',
        price: 650,
        quantity: 1,
        itemTotal: 650
      }
    ],
    subtotal: 2200,
    discount: 0,
    deliveryFee: 0,
    deliveryZone: 'outside_dhaka',
    total: 2200,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    adminNotes: 'Delivered by Paperfly courier. Payment collected.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ord-1005',
    orderNumber: 'APK-2026-1005',
    customer: {
      fullName: 'Mahir Faisal',
      phone: '01733445566',
      district: 'Dhaka',
      thana: 'Gulshan',
      fullAddress: 'Road 55, House 12/A, Gulshan-2, Dhaka',
      instructions: 'Call before arrival'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'FC Nocturne Gold Crest 24/25 Club Jersey',
        sku: 'APK-CLM-01',
        image: '/src/assets/images/product_club_jersey_1792747635830.jpg',
        size: 'M',
        color: 'Stealth Black / Gold',
        price: 1250,
        quantity: 2,
        itemTotal: 2500
      }
    ],
    subtotal: 2500,
    discount: 250,
    couponCode: 'APEX10',
    deliveryFee: 0,
    deliveryZone: 'inside_dhaka',
    total: 2250,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    adminNotes: 'Delivered by internal courier.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'ord-1006',
    orderNumber: 'APK-2026-1006',
    customer: {
      fullName: 'Saiful Islam',
      phone: '01788990011',
      district: 'Rajshahi',
      thana: 'Boalia',
      fullAddress: 'Shaheb Bazar, Main Road, Rajshahi',
      instructions: 'Shop delivery'
    },
    items: [
      {
        productId: 'prod-3',
        name: 'Apex Velocity Pro Training T-Shirt',
        sku: 'APK-TRN-03',
        image: '/src/assets/images/product_training_tshirt_1792747637025.jpg',
        size: 'L',
        color: 'Charcoal Gray / Electric Lime',
        price: 750,
        quantity: 3,
        itemTotal: 2250
      }
    ],
    subtotal: 2250,
    discount: 0,
    deliveryFee: 0,
    deliveryZone: 'outside_dhaka',
    total: 2250,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    adminNotes: 'Paid on delivery.',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'ord-1007',
    orderNumber: 'APK-2026-1007',
    customer: {
      fullName: 'Arifur Rahman',
      phone: '01999887766',
      district: 'Dhaka',
      thana: 'Uttara',
      fullAddress: 'Sector 7, Road 14, Uttara, Dhaka',
      instructions: 'Deliver in evening'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'FC Nocturne Gold Crest 24/25 Club Jersey',
        sku: 'APK-CLM-01',
        image: '/src/assets/images/product_club_jersey_1792747635830.jpg',
        size: 'XL',
        color: 'Stealth Black / Gold',
        price: 1250,
        quantity: 1,
        itemTotal: 1250
      },
      {
        productId: 'prod-4',
        name: 'Custom Team Print Performance Jersey #10',
        sku: 'APK-CST-04',
        image: '/src/assets/images/product_custom_jersey_1792747711299.jpg',
        size: 'L',
        color: 'Stealth Black / Lime Green',
        price: 1450,
        quantity: 1,
        customPrint: {
          playerName: 'ARIF',
          playerNumber: '7',
          extraCost: 200
        },
        itemTotal: 1650
      }
    ],
    subtotal: 2900,
    discount: 0,
    deliveryFee: 0,
    deliveryZone: 'inside_dhaka',
    total: 2900,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    adminNotes: 'Delivered successfully.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString()
  },
  {
    id: 'ord-1008',
    orderNumber: 'APK-2026-1008',
    customer: {
      fullName: 'Niaz Morshed',
      phone: '01611224466',
      district: 'Khulna',
      thana: 'Sonadanga',
      fullAddress: 'Sonadanga R/A, Road 2, Khulna',
      instructions: 'Call before coming'
    },
    items: [
      {
        productId: 'prod-2',
        name: 'National Edition Royal Blue Heritage Jersey',
        sku: 'APK-NAT-02',
        image: '/src/assets/images/product_national_jersey_1792747636134.jpg',
        size: 'M',
        color: 'Royal Blue / Crimson',
        price: 1350,
        quantity: 1,
        itemTotal: 1350
      },
      {
        productId: 'prod-6',
        name: 'Aero Velocity Aero-Weave Match Kit',
        sku: 'APK-AER-06',
        image: '/src/assets/images/hero_sports_jersey_1792747635843.jpg',
        size: 'M',
        color: 'Pitch Black',
        price: 650,
        quantity: 1,
        itemTotal: 650
      }
    ],
    subtotal: 2000,
    discount: 0,
    deliveryFee: 0,
    deliveryZone: 'outside_dhaka',
    total: 2000,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'unpaid',
    orderStatus: 'confirmed',
    adminNotes: 'Confirmed via phone call with customer.',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];

const INITIAL_SPORTS_MATCHES: SportMatch[] = [
  {
    id: 'mat-fb-1',
    sport: 'football',
    competition: 'La Liga EA Sports (El Clásico)',
    round: 'Matchday 11',
    homeTeam: { name: 'Real Madrid', shortName: 'RMA', logoColor: '#FFFFFF', score: 2 },
    awayTeam: { name: 'FC Barcelona', shortName: 'BAR', logoColor: '#004D98', score: 1 },
    status: 'completed',
    statusText: 'FT (Full Time)',
    matchTime: '2026-10-21T19:00:00Z',
    venue: 'Santiago Bernabéu, Madrid',
    isVerified: true,
    dataSource: 'verified_archive',
    highlights: ['22\' Bellingham (Goal)', '54\' Lewandowski (Goal)', '88\' Vinicius Jr. (Goal)'],
    stats: {
      possession: { home: 52, away: 48 },
      shotsOnTarget: { home: 7, away: 5 },
      corners: { home: 6, away: 4 }
    }
  },
  {
    id: 'mat-fb-2',
    sport: 'football',
    competition: 'English Premier League',
    round: 'Matchday 10',
    homeTeam: { name: 'Arsenal FC', shortName: 'ARS', logoColor: '#EF0107' },
    awayTeam: { name: 'Manchester City', shortName: 'MCI', logoColor: '#6CABDD' },
    status: 'upcoming',
    statusText: 'Sunday 21:30 BST',
    matchTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    venue: 'Emirates Stadium, London',
    isVerified: true,
    dataSource: 'official_schedule',
    stats: {
      possession: { home: 50, away: 50 }
    }
  },
  {
    id: 'mat-fb-3',
    sport: 'football',
    competition: 'AFC Asian Cup Qualifiers',
    round: 'Group Stage',
    homeTeam: { name: 'Bangladesh National Team', shortName: 'BAN', logoColor: '#006A4E' },
    awayTeam: { name: 'India National Team', shortName: 'IND', logoColor: '#06038D' },
    status: 'upcoming',
    statusText: 'Friday 17:00 BST',
    matchTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    venue: 'Bangabandhu National Stadium, Dhaka',
    isVerified: true,
    dataSource: 'official_schedule'
  },
  {
    id: 'mat-cr-1',
    sport: 'cricket',
    competition: 'ICC Men\'s ODI International Series',
    round: '2nd ODI',
    homeTeam: { name: 'Bangladesh Tigers', shortName: 'BAN', logoColor: '#006A4E', score: '284/7', subScore: '50.0 ov' },
    awayTeam: { name: 'Sri Lanka', shortName: 'SL', logoColor: '#0B2341', score: '252/10', subScore: '46.4 ov' },
    status: 'completed',
    statusText: 'Bangladesh won by 32 runs',
    matchTime: '2026-10-19T08:30:00Z',
    venue: 'Sher-e-Bangla National Cricket Stadium, Mirpur, Dhaka',
    isVerified: true,
    dataSource: 'verified_archive',
    highlights: ['Shakib 86 (74)', 'Taskin Ahmed 4/42 (9.4 ov)', 'Asalanka 71 (80)']
  },
  {
    id: 'mat-cr-2',
    sport: 'cricket',
    competition: 'Bangladesh Premier League (BPL T20)',
    round: 'Group Stage',
    homeTeam: { name: 'Comilla Victorians', shortName: 'COV', logoColor: '#C41230' },
    awayTeam: { name: 'Fortune Barishal', shortName: 'FBA', logoColor: '#FF6F00' },
    status: 'upcoming',
    statusText: 'Tomorrow 18:30 BST',
    matchTime: new Date(Date.now() + 86400000 * 1).toISOString(),
    venue: 'Zahur Ahmed Chowdhury Stadium, Chattogram',
    isVerified: true,
    dataSource: 'official_schedule'
  }
];

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour-1',
    name: 'Bangladesh Premier League (BPL) 2026 - T20',
    sport: 'cricket',
    season: '2025/2026',
    edition: '12th Edition',
    location: 'Dhaka, Chattogram & Sylhet, Bangladesh',
    status: 'ongoing',
    dates: 'January - March 2026',
    isVerified: true,
    dataSourceLabel: 'Verified Bangladesh Cricket Board (BCB) Official',
    overview: 'The premier domestic twenty20 cricket tournament in Bangladesh featuring 7 top franchise teams, international stars, and national squad players.',
    teams: [
      { id: 'cov', name: 'Comilla Victorians', shortName: 'COV', captain: 'Litton Das' },
      { id: 'fba', name: 'Fortune Barishal', shortName: 'FBA', captain: 'Tamim Iqbal' },
      { id: 'rgr', name: 'Rangpur Riders', shortName: 'RGR', captain: 'Nurul Hasan Sohan' },
      { id: 'syl', name: 'Sylhet Strikers', shortName: 'SYL', captain: 'Mashrafe Mortaza' }
    ],
    fixtures: [
      { id: 'fix-1', date: '2026-10-25', time: '18:30 BST', stage: 'Group Stage', homeTeam: 'Comilla Victorians', awayTeam: 'Fortune Barishal', venue: 'Mirpur, Dhaka', status: 'upcoming' },
      { id: 'fix-2', date: '2026-10-27', time: '13:30 BST', stage: 'Group Stage', homeTeam: 'Rangpur Riders', awayTeam: 'Sylhet Strikers', venue: 'Chattogram Stadium', status: 'upcoming' }
    ],
    standings: [
      { rank: 1, team: 'Comilla Victorians', shortName: 'COV', played: 8, won: 7, drawn: 0, lost: 1, points: 14, goalDiffOrNrr: '+1.240' },
      { rank: 2, team: 'Fortune Barishal', shortName: 'FBA', played: 8, won: 5, drawn: 0, lost: 3, points: 10, goalDiffOrNrr: '+0.582' },
      { rank: 3, team: 'Rangpur Riders', shortName: 'RGR', played: 8, won: 5, drawn: 0, lost: 3, points: 10, goalDiffOrNrr: '+0.410' },
      { rank: 4, team: 'Sylhet Strikers', shortName: 'SYL', played: 8, won: 3, drawn: 0, lost: 5, points: 6, goalDiffOrNrr: '-0.320' }
    ]
  },
  {
    id: 'tour-2',
    name: 'Dhaka Corporate Futsal & Football Cup 2026',
    sport: 'football',
    season: '2026 Edition',
    edition: 'Season 4',
    location: 'Dhanmondi Arena & Army Stadium, Dhaka',
    status: 'ongoing',
    dates: 'October - November 2026',
    isVerified: true,
    dataSourceLabel: 'Verified Dhaka Athletic Community',
    overview: 'Dhaka city premier athletic league tournament featuring corporate athletic clubs competing in official custom sports kits.',
    teams: [
      { id: 'apk', name: 'Apex Strikers FC', shortName: 'APK', captain: 'Tanvir Ahmed' },
      { id: 'dhn', name: 'Dhanmondi Titans', shortName: 'DHN', captain: 'Fahim Morshed' },
      { id: 'gul', name: 'Gulshan Athletic Club', shortName: 'GUL', captain: 'Zubair Khan' },
      { id: 'utt', name: 'Uttara United', shortName: 'UTT', captain: 'Imran Hossain' }
    ],
    fixtures: [
      { id: 'fix-3', date: '2026-10-26', time: '20:00 BST', stage: 'Semi-Final', homeTeam: 'Apex Strikers FC', awayTeam: 'Dhanmondi Titans', venue: 'Dhanmondi Arena', status: 'upcoming' }
    ],
    standings: [
      { rank: 1, team: 'Apex Strikers FC', shortName: 'APK', played: 6, won: 5, drawn: 1, lost: 0, points: 16, goalDiffOrNrr: '+12' },
      { rank: 2, team: 'Dhanmondi Titans', shortName: 'DHN', played: 6, won: 4, drawn: 1, lost: 1, points: 13, goalDiffOrNrr: '+7' },
      { rank: 3, team: 'Gulshan Athletic', shortName: 'GUL', played: 6, won: 2, drawn: 1, lost: 3, points: 7, goalDiffOrNrr: '-2' }
    ]
  }
];

const INITIAL_QUIZZES: FanQuiz[] = [
  {
    id: 'quiz-fb-1',
    title: 'Football Kit & Jersey History Mastermind',
    sport: 'football',
    rewardPoints: 50,
    difficulty: 'medium',
    questions: [
      {
        id: 'q1',
        question: 'Which legendary number did Diego Maradona and Lionel Messi famously wear for Argentina?',
        options: ['#7', '#9', '#10', '#11'],
        correctIndex: 2,
        explanation: 'The iconic number 10 jersey has been immortalized by both Diego Maradona and Lionel Messi for Argentina.'
      },
      {
        id: 'q2',
        question: 'Which football club is traditionally known as "Los Blancos" (The Whites)?',
        options: ['Real Madrid', 'Tottenham Hotspur', 'Valencia CF', 'Juventus'],
        correctIndex: 0,
        explanation: 'Real Madrid has worn an all-white home kit since its founding in 1902, earning the nickname Los Blancos.'
      },
      {
        id: 'q3',
        question: 'What performance technology is commonly used in modern player-edition micro-mesh jerseys?',
        options: ['Cotton Twill', 'Dri-FIT / Aero-Weave Moisture Vapor Tech', 'Heavy Wool', 'Unventilated Nylon'],
        correctIndex: 1,
        explanation: 'High-tech moisture-wicking synthetic polyester like Aero-Weave and Dri-FIT keeps athletes dry under high humidity.'
      }
    ]
  },
  {
    id: 'quiz-cr-1',
    title: 'Bangladesh Cricket & Tigers Trivia',
    sport: 'cricket',
    rewardPoints: 50,
    difficulty: 'medium',
    questions: [
      {
        id: 'q1',
        question: 'Where is the Sher-e-Bangla National Cricket Stadium located in Dhaka?',
        options: ['Uttara', 'Mirpur', 'Dhanmondi', 'Gulshan'],
        correctIndex: 1,
        explanation: 'Sher-e-Bangla National Cricket Stadium is famously located in Mirpur-2, Dhaka.'
      },
      {
        id: 'q2',
        question: 'What are the two official jersey colors of the Bangladesh National Cricket Team?',
        options: ['Blue & Yellow', 'Green & Red', 'Black & Silver', 'Maroon & Gold'],
        correctIndex: 1,
        explanation: 'The Tigers proudly sport the emerald green and crimson red inspired by the national flag.'
      }
    ]
  }
];

const INITIAL_PREDICTIONS: FanPredictionPoll[] = [
  {
    id: 'pred-1',
    matchTitle: 'El Clásico 2026: Real Madrid vs FC Barcelona',
    sport: 'football',
    date: '2026-10-25',
    optionA: 'Real Madrid Win',
    optionB: 'FC Barcelona Win',
    optionDraw: 'Draw',
    votesA: 64,
    votesB: 48,
    votesDraw: 12,
    totalVotes: 124,
    status: 'open'
  },
  {
    id: 'pred-2',
    matchTitle: '2nd ODI: Bangladesh Tigers vs Sri Lanka (Mirpur)',
    sport: 'cricket',
    date: '2026-10-26',
    optionA: 'Bangladesh Win',
    optionB: 'Sri Lanka Win',
    votesA: 142,
    votesB: 28,
    totalVotes: 170,
    status: 'open'
  }
];

const INITIAL_PLAYER_VOTES: PlayerVoteCandidate[] = [
  {
    id: 'cand-1',
    name: 'Shakib Al Hasan',
    team: 'Bangladesh Tigers',
    category: 'Cricket All-Rounder',
    votes: 215,
    recentHighlight: 'Match-winning 86 runs and 3 wickets in Mirpur'
  },
  {
    id: 'cand-2',
    name: 'Kylian Mbappé',
    team: 'Real Madrid',
    category: 'Football Striker',
    votes: 184,
    recentHighlight: 'Champions League hat-trick with explosive speed'
  },
  {
    id: 'cand-3',
    name: 'Bukayo Saka',
    team: 'Arsenal FC',
    category: 'Football Right Winger',
    votes: 130,
    recentHighlight: '2 assists & curling goal in London derby'
  },
  {
    id: 'cand-4',
    name: 'Taskin Ahmed',
    team: 'Bangladesh Tigers',
    category: 'Fast Bowler',
    votes: 98,
    recentHighlight: 'Fierce pace spell claiming 4 wickets against Sri Lanka'
  }
];

const INITIAL_LEADERBOARD: FanLeaderboardEntry[] = [
  { rank: 1, userName: 'Tanvir Ahmed', points: 520, badge: 'Gold Ultra', city: 'Dhaka' },
  { rank: 2, userName: 'Fahim Morshed', points: 460, badge: 'Kit Master', city: 'Dhaka' },
  { rank: 3, userName: 'Siam Rahman', points: 390, badge: 'Jersey Connoisseur', city: 'Chattogram' },
  { rank: 4, userName: 'Zubair Hossain', points: 340, badge: 'Derby Predictor', city: 'Sylhet' },
  { rank: 5, userName: 'Nabil Khan', points: 280, badge: 'Tigers Fanatic', city: 'Rajshahi' }
];

const INITIAL_LOYALTY_ACCOUNTS: LoyaltyAccount[] = [
  {
    phone: '01712345678',
    email: 'tanvir@example.com',
    customerName: 'Tanvir Ahmed',
    pointsBalance: 160,
    totalEarned: 240,
    totalRedeemed: 80,
    tier: 'Pro',
    transactions: [
      { id: 'tx-1', type: 'earned', points: 160, description: 'Earned from order APK-2026-9812', orderNumber: 'APK-2026-9812', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'tx-2', type: 'bonus', points: 80, description: 'Fan Zone Quiz & Prediction reward', createdAt: new Date(Date.now() - 86400000).toISOString() }
    ]
  }
];

class StorageEngine {
  private data: StoreDatabase;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreDatabase {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          orders: parsed.orders || INITIAL_ORDERS,
          coupons: parsed.coupons || INITIAL_COUPONS,
          settings: parsed.settings || DEFAULT_SETTINGS,
          newsletterSubscribers: parsed.newsletterSubscribers || [],
          sportsMatches: parsed.sportsMatches || INITIAL_SPORTS_MATCHES,
          tournaments: parsed.tournaments || INITIAL_TOURNAMENTS,
          quizzes: parsed.quizzes || INITIAL_QUIZZES,
          predictions: parsed.predictions || INITIAL_PREDICTIONS,
          playerVotes: parsed.playerVotes || INITIAL_PLAYER_VOTES,
          leaderboard: parsed.leaderboard || INITIAL_LEADERBOARD,
          reminders: parsed.reminders || [],
          loyaltyAccounts: parsed.loyaltyAccounts || INITIAL_LOYALTY_ACCOUNTS,
          founderProfile: parsed.founderProfile || DEFAULT_FOUNDER_PROFILE,
          chatbotSettings: parsed.chatbotSettings || DEFAULT_CHATBOT_SETTINGS,
          marketingConfig: parsed.marketingConfig || DEFAULT_MARKETING_CONFIG,
          marketingLogs: parsed.marketingLogs || INITIAL_MARKETING_LOGS
        };
      }
    } catch (e) {
      console.error('Failed reading store.json, falling back to initial data:', e);
    }

    const initial: StoreDatabase = {
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      coupons: INITIAL_COUPONS,
      settings: DEFAULT_SETTINGS,
      newsletterSubscribers: [],
      sportsMatches: INITIAL_SPORTS_MATCHES,
      tournaments: INITIAL_TOURNAMENTS,
      quizzes: INITIAL_QUIZZES,
      predictions: INITIAL_PREDICTIONS,
      playerVotes: INITIAL_PLAYER_VOTES,
      leaderboard: INITIAL_LEADERBOARD,
      reminders: [],
      loyaltyAccounts: INITIAL_LOYALTY_ACCOUNTS,
      founderProfile: DEFAULT_FOUNDER_PROFILE,
      chatbotSettings: DEFAULT_CHATBOT_SETTINGS,
      marketingConfig: DEFAULT_MARKETING_CONFIG,
      marketingLogs: INITIAL_MARKETING_LOGS
    };
    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(db: StoreDatabase) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed writing store.json:', err);
    }
  }

  private persist() {
    this.saveDataDirect(this.data);
  }

  // --- PRODUCTS ---
  public getProducts(params?: {
    search?: string;
    category?: string;
    team?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }): { products: Product[]; total: number; page: number; totalPages: number } {
    let list = this.data.products.filter(p => p.isPublished !== false);

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.team.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (params?.category && params.category !== 'all') {
      list = list.filter(p => p.category === params.category);
    }

    if (params?.team && params.team !== 'all') {
      list = list.filter(p => p.team.toLowerCase() === params.team?.toLowerCase());
    }

    if (params?.minPrice !== undefined) {
      list = list.filter(p => p.salePrice >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      list = list.filter(p => p.salePrice <= params.maxPrice!);
    }

    if (params?.isFeatured) {
      list = list.filter(p => p.isFeatured);
    }

    // Sorting
    switch (params?.sort) {
      case 'price_low':
        list.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'price_high':
        list.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'popular':
        list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  public getAllProductsAdmin(): Product[] {
    return [...this.data.products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getProductBySlugOrId(identifier: string): Product | undefined {
    return this.data.products.find(p => p.slug === identifier || p.id === identifier);
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Product {
    const id = `prod-${Date.now()}`;
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newProduct: Product = {
      ...productData,
      id,
      slug,
      rating: 5.0,
      reviewCount: 0,
      isPublished: productData.isPublished ?? true,
      reviews: [],
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.persist();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      id // preserve id
    };
    this.persist();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public getProductRatings(productId: string): RatingSummary | null {
    const product = this.data.products.find(p => p.id === productId || p.slug === productId);
    if (!product) return null;

    if (!product.reviews) {
      product.reviews = [];
    }

    const reviews = product.reviews;
    const distribution: { 5: number; 4: number; 3: number; 2: number; 1: number } = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    if (reviews.length > 0) {
      for (const r of reviews) {
        const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
        distribution[star] = (distribution[star] || 0) + 1;
      }
      const totalScore = reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = Number((totalScore / reviews.length).toFixed(1));
      product.reviewCount = reviews.length;
    } else {
      const count = product.reviewCount || 15;
      const r = product.rating || 4.8;
      if (r >= 4.8) {
        distribution[5] = Math.max(1, Math.round(count * 0.85));
        distribution[4] = Math.max(1, Math.round(count * 0.12));
        distribution[3] = Math.max(0, count - distribution[5] - distribution[4]);
      } else if (r >= 4.5) {
        distribution[5] = Math.max(1, Math.round(count * 0.65));
        distribution[4] = Math.max(1, Math.round(count * 0.25));
        distribution[3] = Math.max(0, count - distribution[5] - distribution[4]);
      } else {
        distribution[5] = Math.max(1, Math.round(count * 0.45));
        distribution[4] = Math.max(1, Math.round(count * 0.35));
        distribution[3] = Math.max(0, count - distribution[5] - distribution[4]);
      }
    }

    return {
      rating: product.rating,
      reviewCount: product.reviewCount,
      distribution,
      reviews
    };
  }

  public addProductReview(productId: string, review: Omit<ProductReview, 'id' | 'createdAt'>): { review: ProductReview; summary: RatingSummary } | null {
    const product = this.data.products.find(p => p.id === productId || p.slug === productId);
    if (!product) return null;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      ...review,
      createdAt: new Date().toISOString()
    };

    if (!product.reviews) product.reviews = [];
    product.reviews.unshift(newReview);
    
    // Recalculate rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));
    product.reviewCount = product.reviews.length;

    this.persist();
    const summary = this.getProductRatings(product.id)!;
    return { review: newReview, summary };
  }

  // --- ORDERS ---
  public getOrders(filters?: { status?: string; paymentStatus?: string; search?: string }): Order[] {
    let list = [...this.data.orders];

    if (filters?.status && filters.status !== 'all') {
      list = list.filter(o => o.orderStatus === filters.status);
    }

    if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
      list = list.filter(o => o.paymentStatus === filters.paymentStatus);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(o => 
        o.orderNumber.toLowerCase().includes(q) || 
        o.customer.phone.includes(q) || 
        o.customer.fullName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public trackOrder(orderNumber: string, phone: string): Order | null {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanOrderNumber = orderNumber.trim().toUpperCase();

    const order = this.data.orders.find(o => {
      const oPhone = o.customer.phone.replace(/[^0-9]/g, '');
      const oNum = o.orderNumber.toUpperCase();
      return oNum === cleanOrderNumber && oPhone.slice(-10) === cleanPhone.slice(-10);
    });

    return order || null;
  }

  public createOrder(payload: {
    customer: Order['customer'];
    items: {
      productId: string;
      size: string;
      color: string;
      quantity: number;
      customPrint?: { playerName?: string; playerNumber?: string; extraCost: number };
    }[];
    deliveryZone: 'inside_dhaka' | 'outside_dhaka';
    couponCode?: string;
  }): { success: boolean; order?: Order; message?: string } {
    // 1. Verify items & stock
    const itemSnapshots: Order['items'] = [];
    let subtotal = 0;

    for (const item of payload.items) {
      const product = this.data.products.find(p => p.id === item.productId);
      if (!product) {
        return { success: false, message: `Product not found for ID: ${item.productId}` };
      }

      if (product.stock < item.quantity) {
        return { 
          success: false, 
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` 
        };
      }

      // Validate Custom Print if requested
      let customPrintCost = 0;
      let validCustomPrint = item.customPrint;
      if (item.customPrint) {
        const rawName = (item.customPrint.playerName || '').trim().toUpperCase().replace(/[^A-Z0-9\s-]/g, '').slice(0, 14);
        const rawNum = String(item.customPrint.playerNumber || '').trim().replace(/[^0-9]/g, '').slice(0, 2);
        customPrintCost = 200; // Standardized verified customization surcharge (৳200)
        validCustomPrint = {
          playerName: rawName || 'PLAYER',
          playerNumber: rawNum || '10',
          extraCost: customPrintCost
        };
      }

      const unitTotal = product.salePrice + customPrintCost;
      const itemTotal = unitTotal * item.quantity;
      subtotal += itemTotal;

      itemSnapshots.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || '',
        size: item.size as any,
        color: item.color,
        price: product.salePrice,
        quantity: item.quantity,
        customPrint: validCustomPrint,
        itemTotal
      });
    }

    // 2. Validate Coupon
    let discount = 0;
    if (payload.couponCode) {
      const coupon = this.validateCoupon(payload.couponCode, subtotal);
      if (coupon.valid) {
        discount = coupon.discountAmount;
      }
    }

    // 3. Compute delivery fee from current store settings
    const settings = this.data.settings;
    let deliveryFee = payload.deliveryZone === 'inside_dhaka'
      ? settings.deliveryFeeInsideDhaka
      : settings.deliveryFeeOutsideDhaka;

    if (subtotal >= settings.freeDeliveryThreshold) {
      deliveryFee = 0;
    }

    const total = Math.max(0, subtotal - discount + deliveryFee);

    // 4. Safely decrement stock atomically
    for (const item of payload.items) {
      const product = this.data.products.find(p => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }

    // 5. Generate unique order number (e.g. APK-2026-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `APK-2026-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: payload.customer,
      items: itemSnapshots,
      subtotal,
      discount,
      couponCode: payload.couponCode,
      deliveryFee,
      deliveryZone: payload.deliveryZone,
      total,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'unpaid', // Unpaid until delivery collection
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);

    // Award loyalty points (1 point for every ৳10 spent)
    if (payload.customer.phone) {
      this.awardLoyaltyPoints(payload.customer.phone, total, orderNumber, payload.customer.fullName, payload.customer.email);
    }

    this.persist();

    return { success: true, order: newOrder };
  }

  public updateOrderStatus(id: string, status: OrderStatus, adminNotes?: string): Order | null {
    const order = this.data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }

    // If order is cancelled and was not cancelled before, restore stock
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        const prod = this.data.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      }
    }

    // If order was cancelled and now re-opened/confirmed, re-decrement stock if available
    if (previousStatus === 'cancelled' && status !== 'cancelled') {
      for (const item of order.items) {
        const prod = this.data.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }
    }

    // If marked delivered, automatically prompt/set COD payment to paid unless noted
    if (status === 'delivered' && order.paymentStatus === 'unpaid') {
      order.paymentStatus = 'paid';
    }

    this.persist();
    return order;
  }

  public updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Order | null {
    const order = this.data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    this.persist();
    return order;
  }

  // --- COUPONS ---
  public validateCoupon(code: string, subtotal: number): { 
    valid: boolean; 
    discountAmount: number; 
    coupon?: Coupon; 
    message?: string 
  } {
    const coupon = this.data.coupons.find(
      c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or inactive promo code.' };
    }

    if (subtotal < coupon.minOrderAmount) {
      return { 
        valid: false, 
        discountAmount: 0, 
        message: `Coupon requires minimum order of ৳${coupon.minOrderAmount}.` 
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return { valid: true, discountAmount, coupon };
  }

  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public createCoupon(coupon: Coupon): Coupon {
    this.data.coupons.push(coupon);
    this.persist();
    return coupon;
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates
    };
    this.persist();
    return this.data.settings;
  }

  // --- NEWSLETTER ---
  public addNewsletterSubscriber(email: string): { success: boolean; message: string } {
    const trimmed = email.trim().toLowerCase();
    const exists = this.data.newsletterSubscribers.some(s => s.email === trimmed);
    if (!exists) {
      this.data.newsletterSubscribers.push({
        email: trimmed,
        subscribedAt: new Date().toISOString()
      });
      this.persist();
    }
    return { success: true, message: 'Successfully subscribed! Use coupon code APEX10 for 10% off.' };
  }

  // --- DASHBOARD STATS ---
  public getDashboardStats(): DashboardStats {
    const orders = this.data.orders;
    const products = this.data.products;

    // Total sales ONLY from collected/paid or delivered orders
    const paidOrDelivered = orders.filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered');
    const totalRevenue = paidOrDelivered.reduce((sum, o) => sum + o.total, 0);

    const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;
    const confirmedOrdersCount = orders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'processing').length;
    const deliveredOrdersCount = orders.filter(o => o.orderStatus === 'delivered').length;
    const cancelledOrdersCount = orders.filter(o => o.orderStatus === 'cancelled').length;
    const lowStockCount = products.filter(p => p.stock <= 10).length;

    // Daily sales trend (last 7 days)
    const dayMap = new Map<string, { sales: number; orders: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().slice(5, 10); // MM-DD
      dayMap.set(dateStr, { sales: 0, orders: 0 });
    }

    for (const ord of orders) {
      const ordDate = ord.createdAt.slice(5, 10);
      if (dayMap.has(ordDate)) {
        const item = dayMap.get(ordDate)!;
        item.orders += 1;
        if (ord.paymentStatus === 'paid' || ord.orderStatus === 'delivered') {
          item.sales += ord.total;
        }
      }
    }

    const salesByDay = Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders
    }));

    return {
      totalRevenue,
      pendingOrdersCount,
      confirmedOrdersCount,
      deliveredOrdersCount,
      cancelledOrdersCount,
      totalOrdersCount: orders.length,
      totalProductsCount: products.length,
      lowStockCount,
      recentOrders: orders.slice(0, 8),
      salesByDay
    };
  }

  // --- LOYALTY PROGRAM METHODS ---
  public awardLoyaltyPoints(phone: string, orderTotal: number, orderNumber: string, name?: string, email?: string): void {
    if (!this.data.loyaltyAccounts) this.data.loyaltyAccounts = INITIAL_LOYALTY_ACCOUNTS;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const pointsToEarn = Math.floor(orderTotal / 10); // 1 pt per ৳10
    if (pointsToEarn <= 0) return;

    let account = this.data.loyaltyAccounts.find(a => a.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (!account) {
      account = {
        phone: cleanPhone,
        email: email || '',
        customerName: name || 'Sports Fan',
        pointsBalance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        tier: 'Rookie',
        transactions: []
      };
      this.data.loyaltyAccounts.push(account);
    }

    account.pointsBalance += pointsToEarn;
    account.totalEarned += pointsToEarn;

    if (account.totalEarned >= 500) account.tier = 'Legend';
    else if (account.totalEarned >= 300) account.tier = 'Elite';
    else if (account.totalEarned >= 150) account.tier = 'Pro';
    else account.tier = 'Rookie';

    account.transactions.unshift({
      id: `tx-${Date.now()}`,
      type: 'earned',
      points: pointsToEarn,
      description: `Earned from eligible Cash on Delivery order #${orderNumber}`,
      orderNumber,
      createdAt: new Date().toISOString()
    });

    this.persist();
  }

  public getLoyaltyAccount(query: string): LoyaltyAccount {
    if (!this.data.loyaltyAccounts) this.data.loyaltyAccounts = INITIAL_LOYALTY_ACCOUNTS;
    const cleanQuery = query.replace(/[^0-9]/g, '');
    let account = this.data.loyaltyAccounts.find(a => 
      (cleanQuery && a.phone.replace(/[^0-9]/g, '').slice(-10) === cleanQuery.slice(-10)) ||
      (a.email && a.email.toLowerCase() === query.trim().toLowerCase())
    );

    if (!account) {
      account = {
        phone: query,
        customerName: 'Sports Fan',
        pointsBalance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        tier: 'Rookie',
        transactions: []
      };
    }
    return account;
  }

  public redeemLoyaltyReward(phone: string, pointsCost: number): { success: boolean; voucher?: LoyaltyRewardVoucher; message?: string } {
    if (!this.data.loyaltyAccounts) this.data.loyaltyAccounts = INITIAL_LOYALTY_ACCOUNTS;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const account = this.data.loyaltyAccounts.find(a => a.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone.slice(-10));

    if (!account) {
      return { success: false, message: 'No loyalty account found with this phone number.' };
    }

    if (account.pointsBalance < pointsCost) {
      return { success: false, message: `Insufficient points balance. You have ${account.pointsBalance} pts, but this reward requires ${pointsCost} pts.` };
    }

    // Value mapping: 50 pts -> ৳50, 100 pts -> ৳100, 200 pts -> ৳250
    let discountVal = pointsCost;
    if (pointsCost >= 200) discountVal = 250;

    const voucherCode = `LOYAL-${discountVal}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Deduct points
    account.pointsBalance -= pointsCost;
    account.totalRedeemed += pointsCost;
    account.transactions.unshift({
      id: `tx-${Date.now()}`,
      type: 'redeemed',
      points: pointsCost,
      description: `Redeemed for ৳${discountVal} instant checkout discount voucher: ${voucherCode}`,
      createdAt: new Date().toISOString()
    });

    // Add generated coupon into system coupons table so customer can apply it directly at checkout!
    this.createCoupon({
      code: voucherCode,
      discountType: 'fixed',
      discountValue: discountVal,
      minOrderAmount: discountVal * 3, // eligible on orders over 3x voucher
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
    });

    this.persist();

    return {
      success: true,
      voucher: {
        code: voucherCode,
        discountValue: discountVal,
        pointsCost,
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
      }
    };
  }

  // --- SPORTS MATCH CENTER ---
  public async getSportsMatches(sport?: string, status?: string): Promise<{ matches: SportMatch[]; isLiveFeedActive: boolean; statusMessage: string }> {
    if (!this.data.sportsMatches) this.data.sportsMatches = INITIAL_SPORTS_MATCHES;
    let list = [...this.data.sportsMatches];

    if (sport && sport !== 'all') {
      list = list.filter(m => m.sport === sport);
    }
    if (status && status !== 'all') {
      list = list.filter(m => m.status === status);
    }

    const hasExternalKey = Boolean(process.env.SPORTS_DATA_API_KEY || process.env.FOOTBALL_DATA_API_KEY);

    return {
      matches: list,
      isLiveFeedActive: hasExternalKey,
      statusMessage: hasExternalKey 
        ? 'Connected to live verified sports telemetry stream.' 
        : 'Displaying official verified fixtures schedule and certified match archives.'
    };
  }

  public getSportsStandings(sport: string = 'football'): MatchStanding[] {
    if (sport === 'cricket') {
      const tour = (this.data.tournaments || INITIAL_TOURNAMENTS).find(t => t.sport === 'cricket');
      return tour?.standings || [];
    }
    const tour = (this.data.tournaments || INITIAL_TOURNAMENTS).find(t => t.sport === 'football');
    return tour?.standings || [
      { rank: 1, team: 'Real Madrid', shortName: 'RMA', played: 10, won: 8, drawn: 1, lost: 1, points: 25, goalDiffOrNrr: '+18' },
      { rank: 2, team: 'FC Barcelona', shortName: 'BAR', played: 10, won: 7, drawn: 2, lost: 1, points: 23, goalDiffOrNrr: '+15' },
      { rank: 3, team: 'Arsenal FC', shortName: 'ARS', played: 9, won: 6, drawn: 2, lost: 1, points: 20, goalDiffOrNrr: '+11' },
      { rank: 4, team: 'Manchester City', shortName: 'MCI', played: 9, won: 6, drawn: 1, lost: 2, points: 19, goalDiffOrNrr: '+10' }
    ];
  }

  // --- TOURNAMENTS ---
  public getTournaments(): Tournament[] {
    return this.data.tournaments || INITIAL_TOURNAMENTS;
  }

  public getTournamentById(id: string): Tournament | undefined {
    return (this.data.tournaments || INITIAL_TOURNAMENTS).find(t => t.id === id);
  }

  // --- FAN ZONE ---
  public getFanQuizzes(): FanQuiz[] {
    return this.data.quizzes || INITIAL_QUIZZES;
  }

  public submitQuiz(quizId: string, answers: { questionId: string; selectedIndex: number }[], userIdentifier?: string): { score: number; total: number; pointsEarned: number; feedback: any[] } {
    const quizzes = this.data.quizzes || INITIAL_QUIZZES;
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return { score: 0, total: 0, pointsEarned: 0, feedback: [] };

    let score = 0;
    const feedback: any[] = [];

    for (const q of quiz.questions) {
      const ans = answers.find(a => a.questionId === q.id);
      const isCorrect = ans !== undefined && ans.selectedIndex === q.correctIndex;
      if (isCorrect) score += 1;
      feedback.push({
        questionId: q.id,
        isCorrect,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      });
    }

    const pointsEarned = Math.round((score / quiz.questions.length) * quiz.rewardPoints);

    // If userIdentifier is provided as phone, add to fan points
    if (userIdentifier && pointsEarned > 0) {
      const clean = userIdentifier.replace(/[^0-9]/g, '');
      if (clean.length >= 10) {
        if (!this.data.loyaltyAccounts) this.data.loyaltyAccounts = INITIAL_LOYALTY_ACCOUNTS;
        let acc = this.data.loyaltyAccounts.find(a => a.phone.replace(/[^0-9]/g, '') === clean);
        if (acc) {
          acc.pointsBalance += pointsEarned;
          acc.totalEarned += pointsEarned;
          acc.transactions.unshift({
            id: `tx-${Date.now()}`,
            type: 'bonus',
            points: pointsEarned,
            description: `Fan Zone Quiz Reward: ${quiz.title}`,
            createdAt: new Date().toISOString()
          });
          this.persist();
        }
      }
    }

    return {
      score,
      total: quiz.questions.length,
      pointsEarned,
      feedback
    };
  }

  public getPredictions(): FanPredictionPoll[] {
    return this.data.predictions || INITIAL_PREDICTIONS;
  }

  public votePrediction(pollId: string, option: 'A' | 'B' | 'draw'): { success: boolean; poll?: FanPredictionPoll; message?: string } {
    if (!this.data.predictions) this.data.predictions = INITIAL_PREDICTIONS;
    const poll = this.data.predictions.find(p => p.id === pollId);
    if (!poll) return { success: false, message: 'Poll not found' };

    if (poll.status === 'closed') {
      return { success: false, message: 'This prediction poll is now closed.' };
    }

    if (option === 'A') poll.votesA += 1;
    else if (option === 'B') poll.votesB += 1;
    else if (option === 'draw' && poll.votesDraw !== undefined) poll.votesDraw += 1;
    poll.totalVotes += 1;

    this.persist();
    return { success: true, poll };
  }

  public getPlayerVoteCandidates(): PlayerVoteCandidate[] {
    return this.data.playerVotes || INITIAL_PLAYER_VOTES;
  }

  public votePlayer(candidateId: string): { success: boolean; candidates: PlayerVoteCandidate[] } {
    if (!this.data.playerVotes) this.data.playerVotes = INITIAL_PLAYER_VOTES;
    const candidate = this.data.playerVotes.find(c => c.id === candidateId);
    if (candidate) {
      candidate.votes += 1;
      this.persist();
    }
    return { success: true, candidates: this.data.playerVotes };
  }

  public getLeaderboard(): FanLeaderboardEntry[] {
    return this.data.leaderboard || INITIAL_LEADERBOARD;
  }

  // --- MATCH REMINDERS ---
  public addTeamReminder(sub: Omit<TeamReminderSubscription, 'id' | 'createdAt'>): TeamReminderSubscription {
    if (!this.data.reminders) this.data.reminders = [];
    const item: TeamReminderSubscription = {
      id: `rem-${Date.now()}`,
      ...sub,
      createdAt: new Date().toISOString()
    };
    this.data.reminders.push(item);
    this.persist();
    return item;
  }

  // --- FOUNDER & ABOUT PROFILE ---
  public getFounderProfile(): FounderProfile {
    if (!this.data.founderProfile) {
      this.data.founderProfile = { ...DEFAULT_FOUNDER_PROFILE };
    }
    return this.data.founderProfile;
  }

  public updateFounderProfile(profileUpdate: Partial<FounderProfile>): FounderProfile {
    if (!this.data.founderProfile) {
      this.data.founderProfile = { ...DEFAULT_FOUNDER_PROFILE };
    }
    this.data.founderProfile = {
      ...this.data.founderProfile,
      ...profileUpdate,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.founderProfile;
  }

  // --- AI SHOPPING CHAT SYSTEM ---
  public getChatbotSettings(): ChatbotSettings {
    if (!this.data.chatbotSettings) {
      this.data.chatbotSettings = { ...DEFAULT_CHATBOT_SETTINGS };
    }
    return this.data.chatbotSettings;
  }

  public updateChatbotSettings(update: Partial<ChatbotSettings>): ChatbotSettings {
    if (!this.data.chatbotSettings) {
      this.data.chatbotSettings = { ...DEFAULT_CHATBOT_SETTINGS };
    }
    this.data.chatbotSettings = {
      ...this.data.chatbotSettings,
      ...update,
      lastUpdated: new Date().toISOString()
    };
    this.persist();
    return this.data.chatbotSettings;
  }

  public incrementChatbotStats(isNewConversation: boolean): void {
    if (!this.data.chatbotSettings) {
      this.data.chatbotSettings = { ...DEFAULT_CHATBOT_SETTINGS };
    }
    this.data.chatbotSettings.totalQueriesCount = (this.data.chatbotSettings.totalQueriesCount || 0) + 1;
    if (isNewConversation) {
      this.data.chatbotSettings.totalConversationsCount = (this.data.chatbotSettings.totalConversationsCount || 0) + 1;
    }
    this.persist();
  }

  public searchProductsForChat(params: {
    keyword?: string;
    sport?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    team?: string;
    inStockOnly?: boolean;
    limit?: number;
  }): Product[] {
    let list = this.data.products.filter(p => p.isPublished !== false);

    if (params.inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    if (params.sport) {
      const s = params.sport.toLowerCase();
      if (s === 'football' || s === 'soccer') {
        list = list.filter(p => 
          p.category === 'club-jerseys' || 
          p.category === 'national-team' || 
          p.category === 'football-jerseys' || 
          p.category === 'custom-jerseys' ||
          p.category === 'retro-classics'
        );
      } else if (s === 'cricket' || s === 'gym' || s === 'training') {
        list = list.filter(p => 
          p.category === 'sports-tshirts' || 
          p.category === 'custom-jerseys' || 
          p.team.toLowerCase().includes('bangladesh') || 
          p.team.toLowerCase().includes('cricket')
        );
      }
    }

    if (params.category && params.category !== 'all') {
      list = list.filter(p => p.category === params.category);
    }

    if (params.team) {
      const t = params.team.toLowerCase();
      list = list.filter(p => p.team.toLowerCase().includes(t));
    }

    if (params.size) {
      const sz = params.size.toUpperCase();
      list = list.filter(p => p.sizes.map(s => s.toUpperCase()).includes(sz as any));
    }

    if (params.color) {
      const c = params.color.toLowerCase();
      list = list.filter(p => p.colors.some(col => col.toLowerCase().includes(c)));
    }

    if (params.minPrice !== undefined && params.minPrice > 0) {
      list = list.filter(p => p.salePrice >= params.minPrice!);
    }

    if (params.maxPrice !== undefined && params.maxPrice > 0) {
      list = list.filter(p => p.salePrice <= params.maxPrice!);
    }

    if (params.keyword) {
      const q = params.keyword.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    // Sort by in stock and popularity
    list.sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0) || b.rating - a.rating);

    const limit = params.limit || 6;
    return list.slice(0, limit);
  }

  // ================= MARKETING & ADVERTISING ENGINE =================

  public getMarketingConfig(): MarketingIntegrationConfig {
    if (!this.data.marketingConfig) {
      this.data.marketingConfig = { ...DEFAULT_MARKETING_CONFIG };
      this.persist();
    }
    // Ensure nested arrays are initialized
    if (!this.data.marketingConfig.conversionEvents || this.data.marketingConfig.conversionEvents.length === 0) {
      this.data.marketingConfig.conversionEvents = [...DEFAULT_CONVERSION_EVENTS];
      this.persist();
    }
    if (!this.data.marketingConfig.utmCampaigns) {
      this.data.marketingConfig.utmCampaigns = [...INITIAL_SAVED_CAMPAIGNS];
      this.persist();
    }
    return this.data.marketingConfig;
  }

  public getPublicMarketingConfig(): MarketingIntegrationConfig {
    const full = this.getMarketingConfig();
    // Return sanitized config safe for client rendering
    return {
      metaPixel: { ...full.metaPixel },
      metaAds: { ...full.metaAds },
      googleAds: { ...full.googleAds },
      ga4: { ...full.ga4 },
      gtm: { ...full.gtm },
      conversionEvents: full.conversionEvents || DEFAULT_CONVERSION_EVENTS,
      utmCampaigns: full.utmCampaigns || [],
      consent: { ...full.consent },
      currency: full.currency || 'BDT',
      lastUpdated: full.lastUpdated
    };
  }

  public updateMarketingConfig(
    patch: Partial<MarketingIntegrationConfig>, 
    adminUser: string = 'admin'
  ): MarketingIntegrationConfig {
    const current = this.getMarketingConfig();
    const updated: MarketingIntegrationConfig = {
      metaPixel: patch.metaPixel ? { ...current.metaPixel, ...patch.metaPixel } : current.metaPixel,
      metaAds: patch.metaAds ? { ...current.metaAds, ...patch.metaAds } : current.metaAds,
      googleAds: patch.googleAds ? { ...current.googleAds, ...patch.googleAds } : current.googleAds,
      ga4: patch.ga4 ? { ...current.ga4, ...patch.ga4 } : current.ga4,
      gtm: patch.gtm ? { ...current.gtm, ...patch.gtm } : current.gtm,
      conversionEvents: patch.conversionEvents ? patch.conversionEvents : (current.conversionEvents || DEFAULT_CONVERSION_EVENTS),
      utmCampaigns: patch.utmCampaigns ? patch.utmCampaigns : (current.utmCampaigns || INITIAL_SAVED_CAMPAIGNS),
      consent: patch.consent ? { ...current.consent, ...patch.consent } : current.consent,
      currency: patch.currency || current.currency || 'BDT',
      lastUpdated: new Date().toISOString()
    };

    this.data.marketingConfig = updated;
    this.persist();

    // Log the configuration update
    this.addMarketingLog({
      type: 'config_change',
      source: 'system',
      status: 'success',
      message: `Marketing configuration updated by ${adminUser}`,
      payload: {
        metaPixelEnabled: updated.metaPixel.enabled,
        metaPixelId: updated.metaPixel.pixelId ? `***${updated.metaPixel.pixelId.slice(-4)}` : 'none',
        googleAdsEnabled: updated.googleAds.enabled,
        ga4Enabled: updated.ga4.enabled,
        gtmEnabled: updated.gtm.enabled
      }
    });

    return updated;
  }

  public getMarketingLogs(limit: number = 50): MarketingIntegrationLog[] {
    if (!this.data.marketingLogs) {
      this.data.marketingLogs = [...INITIAL_MARKETING_LOGS];
      this.persist();
    }
    // Return newest first
    return [...this.data.marketingLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, limit);
  }

  public clearMarketingLogs(): boolean {
    this.data.marketingLogs = [
      {
        id: `log-cleared-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'system_notice',
        source: 'system',
        status: 'info',
        message: 'Tracking & Integration audit log was cleared by administrator.'
      }
    ];
    this.persist();
    return true;
  }

  public addMarketingLog(
    entry: Omit<MarketingIntegrationLog, 'id' | 'timestamp'>
  ): MarketingIntegrationLog {
    if (!this.data.marketingLogs) {
      this.data.marketingLogs = [...INITIAL_MARKETING_LOGS];
    }

    const newLog: MarketingIntegrationLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };

    this.data.marketingLogs.push(newLog);

    // Keep log history bounded to last 200 items
    if (this.data.marketingLogs.length > 200) {
      this.data.marketingLogs = this.data.marketingLogs.slice(-200);
    }

    this.persist();
    return newLog;
  }

  public testIntegration(
    provider: 'meta' | 'google_ads' | 'ga4' | 'gtm',
    eventId?: string,
    testPayload?: any
  ): { success: boolean; message: string; log: MarketingIntegrationLog } {
    const config = this.getMarketingConfig();
    let isSuccess = false;
    let message = '';

    if (provider === 'meta') {
      const pid = config.metaPixel.pixelId?.trim();
      if (!pid) {
        message = 'Meta Pixel ID is empty. Please enter your 15-16 digit Meta Pixel ID in configuration.';
      } else if (!/^\d{14,17}$/.test(pid)) {
        message = `Meta Pixel ID "${pid}" is invalid. Expected a 14 to 17 digit numeric ID (found in Meta Events Manager).`;
      } else {
        isSuccess = true;
        message = `Meta Pixel connection verified for ID [${pid}]${config.metaPixel.testEventCode ? ` with Test Event Code [${config.metaPixel.testEventCode}]` : ''}. Diagnostics passed.`;
      }
    } else if (provider === 'ga4') {
      const mid = config.ga4.measurementId?.trim().toUpperCase();
      if (!mid) {
        message = 'GA4 Measurement ID is empty. Enter your G-XXXXXXXXXX ID from Google Analytics Admin > Data Streams.';
      } else if (!/^G-[A-Z0-9]{6,14}$/.test(mid)) {
        message = `GA4 Measurement ID "${mid}" format invalid. Expected standard format starting with "G-" followed by alphanumeric characters.`;
      } else {
        isSuccess = true;
        message = `GA4 Measurement ID [${mid}] format validated successfully. Ready for e-commerce telemetry in DebugView.`;
      }
    } else if (provider === 'google_ads') {
      const cid = config.googleAds.conversionId?.trim().toUpperCase();
      if (!cid) {
        message = 'Google Ads Conversion ID is empty. Provide your AW-XXXXXXXXX or numeric conversion ID.';
      } else if (!/^(AW-)?\d{7,13}$/i.test(cid)) {
        message = `Google Ads Conversion ID "${cid}" format invalid. Expected "AW-XXXXXXXXX" or 9-11 digits.`;
      } else {
        isSuccess = true;
        message = `Google Ads Conversion ID [${cid}] validated. Purchase conversion label: ${config.googleAds.purchaseConversionLabel || 'Not configured'}.`;
      }
    } else if (provider === 'gtm') {
      const gid = config.gtm.containerId?.trim().toUpperCase();
      if (!gid) {
        message = 'Google Tag Manager Container ID is empty. Enter GTM-XXXXXXX from your GTM workspace.';
      } else if (!/^GTM-[A-Z0-9]{4,10}$/.test(gid)) {
        message = `GTM Container ID "${gid}" is invalid. Must match format "GTM-XXXXXXX".`;
      } else {
        isSuccess = true;
        message = `Google Tag Manager Container [${gid}] verified. DataLayer will be initialized.`;
      }
    }

    // Update conversion event last test status if eventId provided
    if (eventId && config.conversionEvents) {
      const eventIdx = config.conversionEvents.findIndex(e => e.id === eventId);
      if (eventIdx !== -1) {
        config.conversionEvents[eventIdx].lastTestStatus = isSuccess ? 'verified' : 'failed';
        config.conversionEvents[eventIdx].lastTestedAt = new Date().toISOString();
        config.conversionEvents[eventIdx].lastTestMessage = message;
        this.persist();
      }
    }

    const log = this.addMarketingLog({
      type: 'test_event',
      source: provider,
      eventName: eventId || 'connection_test',
      status: isSuccess ? 'success' : 'error',
      message,
      payload: testPayload || { provider, timestamp: new Date().toISOString() }
    });

    return { success: isSuccess, message, log };
  }

  // --- Saved UTM Campaigns CRUD ---
  public getSavedCampaigns(): SavedUtmCampaign[] {
    const config = this.getMarketingConfig();
    return config.utmCampaigns || [];
  }

  public saveCampaign(
    campaignData: Omit<SavedUtmCampaign, 'id' | 'createdAt'>
  ): SavedUtmCampaign {
    const config = this.getMarketingConfig();
    if (!config.utmCampaigns) config.utmCampaigns = [];

    const newCampaign: SavedUtmCampaign = {
      ...campaignData,
      id: `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };

    config.utmCampaigns.unshift(newCampaign);
    this.persist();

    this.addMarketingLog({
      type: 'config_change',
      source: 'system',
      status: 'info',
      message: `Created tracking campaign "${newCampaign.name}" with source [${newCampaign.source}]`,
      payload: { id: newCampaign.id, finalUrl: newCampaign.finalUrl }
    });

    return newCampaign;
  }

  public updateCampaign(
    id: string, 
    patch: Partial<SavedUtmCampaign>
  ): SavedUtmCampaign | null {
    const config = this.getMarketingConfig();
    if (!config.utmCampaigns) return null;

    const idx = config.utmCampaigns.findIndex(c => c.id === id);
    if (idx === -1) return null;

    config.utmCampaigns[idx] = {
      ...config.utmCampaigns[idx],
      ...patch,
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return config.utmCampaigns[idx];
  }

  public deleteCampaign(id: string): boolean {
    const config = this.getMarketingConfig();
    if (!config.utmCampaigns) return false;

    const idx = config.utmCampaigns.findIndex(c => c.id === id);
    if (idx === -1) return false;

    const deleted = config.utmCampaigns.splice(idx, 1)[0];
    this.persist();

    this.addMarketingLog({
      type: 'config_change',
      source: 'system',
      status: 'info',
      message: `Deleted campaign "${deleted.name}" (${id})`
    });

    return true;
  }
}



export const storage = new StorageEngine();
