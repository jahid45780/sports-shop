export type ProductCategory = 
  | 'football-jerseys'
  | 'club-jerseys'
  | 'national-team'
  | 'custom-jerseys'
  | 'sports-tshirts'
  | 'retro-classics';

export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ProductReview {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  verifiedPurchase?: boolean;
}

export interface RatingSummary {
  rating: number;
  reviewCount: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: ProductReview[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  team: string; // e.g. "Real Madrid", "Argentina", "Apex Athletic"
  regularPrice: number; // in BDT (৳)
  salePrice: number; // in BDT (৳)
  images: string[];
  sizes: ProductSize[];
  colors: string[];
  stock: number;
  sku: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isPublished: boolean;
  fabric: string; // e.g. "100% Breathable Dri-FIT Micro-Mesh"
  fitType: string; // e.g. "Athletic Slim Fit"
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  allowCustomPrint?: boolean; // name and number printing
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: ProductSize;
  color: string;
  price: number;
  quantity: number;
  maxStock: number;
  customPrint?: {
    playerName?: string;
    playerNumber?: string;
    extraCost: number;
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  sku: string;
  image: string;
  size: ProductSize;
  color: string;
  price: number;
  quantity: number;
  customPrint?: {
    playerName?: string;
    playerNumber?: string;
    extraCost: number;
  };
  itemTotal: number;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email?: string;
  district: string;
  thana: string;
  fullAddress: string;
  instructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "APK-2026-9812"
  customer: OrderCustomer;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  deliveryZone: DeliveryZone;
  total: number;
  paymentMethod: 'cash_on_delivery';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g. 10 for 10%) or fixed amount (e.g. 150)
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcementText: string;
  announcementActive: boolean;
  phone: string;
  email: string;
  deliveryFeeInsideDhaka: number;
  deliveryFeeOutsideDhaka: number;
  freeDeliveryThreshold: number;
  enableGuestCheckout: boolean;
}

export interface DashboardStats {
  totalRevenue: number; // From collected/delivered orders
  pendingOrdersCount: number;
  confirmedOrdersCount: number;
  deliveredOrdersCount: number;
  cancelledOrdersCount: number;
  totalOrdersCount: number;
  totalProductsCount: number;
  lowStockCount: number;
  recentOrders: Order[];
  salesByDay: { date: string; sales: number; orders: number }[];
}

// --- SPORTS MATCH CENTER ---
export type SportType = 'football' | 'cricket' | 'basketball' | 'all';
export type MatchStatus = 'live' | 'upcoming' | 'completed' | 'postponed';

export interface MatchCompetitor {
  name: string;
  shortName: string;
  logo?: string;
  logoColor?: string;
  score?: string | number;
  subScore?: string; // e.g. overs/wickets for cricket (178/4 in 20.0 ov)
  linescores?: string[];
  isWinner?: boolean;
}

export interface MatchEvent {
  id: string;
  minute?: string;
  type: string;
  team?: string;
  player?: string;
  text?: string;
}

export interface SportMatch {
  id: string;
  sport: SportType;
  competition: string;
  competitionSlug?: string;
  leagueLogo?: string;
  round?: string;
  homeTeam: MatchCompetitor;
  awayTeam: MatchCompetitor;
  status: MatchStatus;
  statusText: string; // e.g. "LIVE 68'", "Today 19:30 GMT", "FT (Full Time)"
  matchTime: string; // ISO string or human string
  venue?: string;
  minute?: string;
  isVerified: boolean;
  dataSource: 'live_feed' | 'official_schedule' | 'verified_archive';
  highlights?: string[];
  events?: MatchEvent[];
  stats?: {
    possession?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    corners?: { home: number; away: number };
    runRate?: { home: string; away: string };
  };
}

export interface MatchStanding {
  rank: number;
  team: string;
  shortName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalDiffOrNrr: string | number;
}

// --- FAN ZONE ---
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FanQuiz {
  id: string;
  title: string;
  sport: SportType;
  rewardPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
}

export interface FanPredictionPoll {
  id: string;
  matchTitle: string;
  sport: SportType;
  date: string;
  optionA: string;
  optionB: string;
  optionDraw?: string;
  votesA: number;
  votesB: number;
  votesDraw?: number;
  totalVotes: number;
  status: 'open' | 'closed';
  userVotedOption?: string;
}

export interface PlayerVoteCandidate {
  id: string;
  name: string;
  team: string;
  category: string;
  votes: number;
  recentHighlight: string;
}

export interface FanLeaderboardEntry {
  rank: number;
  userName: string;
  points: number;
  badge: string;
  city: string;
}

// --- TOURNAMENTS ---
export interface Tournament {
  id: string;
  name: string;
  sport: SportType;
  season: string;
  edition: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  dates: string;
  isVerified: boolean;
  dataSourceLabel: string; // "Verified Bangladesh Sports Federation" or "Official Schedule"
  overview: string;
  teams: {
    id: string;
    name: string;
    shortName: string;
    group?: string;
    captain: string;
  }[];
  fixtures: {
    id: string;
    date: string;
    time: string;
    stage: string;
    homeTeam: string;
    awayTeam: string;
    venue: string;
    result?: string;
    status: MatchStatus;
  }[];
  standings: MatchStanding[];
}

// --- MATCH REMINDERS ---
export interface TeamReminderSubscription {
  id: string;
  teamName: string;
  sport: SportType;
  customerPhone?: string;
  customerEmail?: string;
  notifyBrowser: boolean;
  notifyEmail: boolean;
  createdAt: string;
}

// --- LOYALTY PROGRAM ---
export interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'refund_adjustment';
  points: number;
  description: string;
  orderNumber?: string;
  createdAt: string;
}

export interface LoyaltyAccount {
  phone: string;
  email?: string;
  customerName: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: 'Rookie' | 'Pro' | 'Elite' | 'Legend';
  transactions: LoyaltyTransaction[];
}

export interface LoyaltyRewardVoucher {
  code: string;
  discountValue: number;
  pointsCost: number;
  expiresAt: string;
}

// --- FOUNDER & ABOUT PROFILE ---
export interface FounderProfile {
  name: string;
  position: string;
  address: string;
  photoUrl: string;
  bio?: string;
  updatedAt?: string;
}

// --- AI SHOPPING CHAT SYSTEM ---
export interface ChatbotSettings {
  isEnabled: boolean;
  welcomeMessageEn: string;
  welcomeMessageBn: string;
  suggestedQuestions: string[];
  enableBengali: boolean;
  enableEnglish: boolean;
  supportPhone: string;
  supportMessengerUrl: string;
  totalConversationsCount: number;
  totalQueriesCount: number;
  lastUpdated?: string;
}

export interface ChatProductCard {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice: number;
  image: string;
  sizes: ProductSize[];
  colors: string[];
  stock: number;
  category: ProductCategory;
  team: string;
  allowCustomPrint?: boolean;
}

export interface ChatOrderSummary {
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  itemsCount: number;
  deliveryZone: DeliveryZone;
  createdAt: string;
}

export interface ChatSupportDetails {
  phone: string;
  formattedPhone: string;
  telLink: string;
  whatsAppLink: string;
}

export interface ChatSystemStatus {
  success: boolean;
  aiConfigured: boolean;
  provider: string;
  model: string;
  freeTierEligible: boolean;
  supportPhone: string;
  supportWhatsApp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  products?: ChatProductCard[];
  orderInfo?: ChatOrderSummary;
  suggestedReplies?: string[];
  isError?: boolean;
  showSupportOptions?: boolean;
  supportDetails?: ChatSupportDetails;
  aiConnected?: boolean;
  rateLimited?: boolean;
}

// ================= MARKETING & ADVERTISING TRACKING TYPES =================

export interface MetaPixelConfig {
  enabled: boolean;
  pixelId: string; // 15-16 digit Facebook Pixel ID
  testEventCode?: string; // e.g. TEST12345 for Meta Test Events tool
  enableAdvancedMatching: boolean;
  trackPageView: boolean;
  trackViewContent: boolean;
  trackSearch: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackAddPaymentInfo: boolean;
  trackPurchase: boolean;
  trackCompleteRegistration: boolean;
  trackLead: boolean;
}

export interface MetaAdsConfig {
  adAccountId?: string; // act_XXXXXXXXX
  businessName?: string;
  defaultCampaignName?: string;
  defaultUtmSource: string; // e.g. 'facebook' | 'instagram' | 'meta'
  defaultUtmMedium: string; // e.g. 'paid_social'
  campaignDestinationUrl?: string;
  campaignStartDate?: string;
  campaignEndDate?: string;
  campaignStatus?: 'draft' | 'active' | 'paused' | 'completed';
  campaignNotes?: string;
}

export interface GoogleAdsConfig {
  enabled: boolean;
  conversionId: string; // AW-XXXXXXXXX or numeric ID
  purchaseConversionLabel?: string; // e.g. abcDEF123_xyz
  addToCartConversionLabel?: string;
  beginCheckoutConversionLabel?: string;
  leadConversionLabel?: string;
  productViewConversionLabel?: string;
  searchConversionLabel?: string;
  enhancedConversions: boolean;
}

export interface GA4Config {
  enabled: boolean;
  measurementId: string; // G-XXXXXXXXXX
  debugMode: boolean;
  sendEcommerceEvents: boolean;
}

export interface GTMConfig {
  enabled: boolean;
  containerId: string; // GTM-XXXXXXX
}

export interface ConsentPrivacyConfig {
  requireConsentBanner: boolean;
  defaultConsentAnalytics: boolean;
  defaultConsentMarketing: boolean;
  privacyPolicyUrl: string;
  bannerTitle: string;
  bannerDescription: string;
}

export interface ConversionEventSetting {
  id: 'view_item' | 'search' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'lead';
  name: string;
  description: string;
  metaEventName: string;
  ga4EventName: string;
  googleAdsEventName: string;
  metaEnabled: boolean;
  googleAdsEnabled: boolean;
  ga4Enabled: boolean;
  lastTestStatus: 'not_tested' | 'verified' | 'failed';
  lastTestedAt?: string;
  lastTestMessage?: string;
}

export interface SavedUtmCampaign {
  id: string;
  name: string;
  destinationUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  finalUrl: string;
  platform?: 'facebook' | 'instagram' | 'google' | 'tiktok' | 'custom';
  status?: 'draft' | 'active' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketingIntegrationConfig {
  metaPixel: MetaPixelConfig;
  metaAds: MetaAdsConfig;
  googleAds: GoogleAdsConfig;
  ga4: GA4Config;
  gtm: GTMConfig;
  conversionEvents: ConversionEventSetting[];
  utmCampaigns: SavedUtmCampaign[];
  consent: ConsentPrivacyConfig;
  currency: string; // e.g. 'BDT'
  lastUpdated?: string;
}

export interface MarketingIntegrationLog {
  id: string;
  timestamp: string;
  type: 'config_change' | 'test_event' | 'event_dispatch' | 'system_notice' | 'error';
  source: 'meta' | 'google_ads' | 'ga4' | 'gtm' | 'consent' | 'system';
  eventName?: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  payload?: Record<string, any>;
}

export interface UserTrackingConsent {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
  updatedAt: string;
}


