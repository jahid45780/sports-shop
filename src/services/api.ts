import type { 
  Product, 
  Order, 
  Coupon, 
  StoreSettings, 
  DashboardStats,
  ProductReview,
  RatingSummary,
  OrderStatus,
  PaymentStatus,
  SportMatch,
  Tournament,
  FanQuiz,
  FanPredictionPoll,
  PlayerVoteCandidate,
  FanLeaderboardEntry,
  LoyaltyAccount,
  LoyaltyRewardVoucher,
  MatchStanding,
  FounderProfile,
  ChatbotSettings,
  ChatProductCard,
  ChatOrderSummary,
  ChatSupportDetails,
  ChatSystemStatus,
  MarketingIntegrationConfig,
  MarketingIntegrationLog,
  SavedUtmCampaign,
  ConversionEventSetting
} from '../types/index.ts';

const ADMIN_TOKEN_KEY = 'apex_admin_auth_token';
export const DEV_ADMIN_FALLBACK_TOKEN = 'apex-sec-admin-token-2026';

export const getStoredAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setStoredAdminToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

export const clearStoredAdminToken = (message?: string) => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('apex:admin_unauthorized', {
        detail: { message: message || 'Invalid or expired administrator token' }
      })
    );
  }
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getStoredAdminToken() || DEV_ADMIN_FALLBACK_TOKEN;
  return { Authorization: `Bearer ${token}` };
};

export const api = {
  // Public Products
  async getProducts(params?: {
    search?: string;
    category?: string;
    team?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.team) query.set('team', params.team);
    if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.isFeatured) query.set('isFeatured', 'true');
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/products?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load products');
    return data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const res = await fetch(`/api/products/${slug}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Product not found');
    return data.product;
  },

  async getCategories(): Promise<{ categories: { id: string; name: string; count: number }[]; teams: string[] }> {
    const res = await fetch('/api/categories');
    const data = await res.json();
    return data;
  },

  // Orders
  async createOrder(orderPayload: {
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
  }): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place order');
    return data;
  },

  async trackOrder(orderNumber: string, phone: string): Promise<Order> {
    const query = new URLSearchParams({ orderNumber, phone });
    const res = await fetch(`/api/orders/track?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Order not found');
    return data.order;
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discountAmount: number; coupon?: Coupon; message?: string }> {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    return await res.json();
  },

  // Settings
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/settings');
    const data = await res.json();
    return data.settings;
  },

  // Newsletter
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Subscription failed');
    return data;
  },

  // Product Ratings & Reviews
  async getProductRatings(productId: string): Promise<RatingSummary> {
    const res = await fetch(`/api/products/${productId}/ratings`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch ratings');
    return {
      rating: data.rating,
      reviewCount: data.reviewCount,
      distribution: data.distribution,
      reviews: data.reviews || []
    };
  },

  async submitReview(review: { productId: string; customerName: string; rating: number; comment: string }): Promise<{ review: ProductReview; summary: RatingSummary }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit review');
    return { review: data.review, summary: data.summary };
  },

  // Admin APIs
  async adminLogin(email: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async getAdminStats(): Promise<DashboardStats> {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unauthorized');
    return data.stats;
  },

  async getAdminProducts(): Promise<Product[]> {
    const res = await fetch('/api/admin/products', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unauthorized');
    return data.products;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create product');
    return data.product;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update product');
    return data.product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete product');
    return true;
  },

  async uploadImage(file: File): Promise<{ success: boolean; url: string; filename: string; sizeBytes: number; message?: string }> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed reading image file.'));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        image: dataUrl,
        filename: file.name
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Image upload failed.');
    return data;
  },

  async getAdminOrders(filters?: { status?: string; paymentStatus?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.set('status', filters.status);
    if (filters?.paymentStatus) query.set('paymentStatus', filters.paymentStatus);
    if (filters?.search) query.set('search', filters.search);

    const res = await fetch(`/api/orders?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unauthorized');
    return data.orders;
  },

  async updateOrderStatus(id: string, status: OrderStatus, adminNotes?: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status, adminNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data.order;
  },

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ paymentStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update payment status');
    return data.order;
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update settings');
    return data.settings;
  },

  // Facebook & Community
  async getFacebookConfig(): Promise<{
    pageUrl: string;
    pageId: string;
    messengerUrl: string;
    pageName: string;
    handle: string;
    shareOffers: { id: string; title: string; description: string; discountCode: string; minOrder?: number }[];
  }> {
    const res = await fetch('/api/facebook/config');
    const data = await res.json();
    return data;
  },

  // AI Sports Shopping Assistant
  async getAiRecommendations(payload: {
    query?: string;
    sport?: string;
    budget?: number;
    size?: string;
    team?: string;
    skillLevel?: string;
  }): Promise<{ success: boolean; advice: string; products: Product[] }> {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get recommendations');
    return data;
  },

  // Sports Match Center
  async getSportsMatches(params?: { sport?: string; status?: string }): Promise<{
    matches: SportMatch[];
    isLiveFeedActive: boolean;
    statusMessage: string;
  }> {
    const query = new URLSearchParams();
    if (params?.sport) query.set('sport', params.sport);
    if (params?.status) query.set('status', params.status);
    const res = await fetch(`/api/sports/matches?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch match scores');
    return data;
  },

  // Real Live Sports Stream & Scores Feed
  async getLiveSportsFeed(params?: {
    sport?: string;
    status?: string;
    league?: string;
    search?: string;
  }): Promise<{
    matches: SportMatch[];
    liveCount: number;
    upcomingCount: number;
    completedCount: number;
    lastUpdated: string;
    sportsAvailable: string[];
    providerInfo: {
      providerName: string;
      isLiveFeedActive: boolean;
      updateFrequency: string;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.sport && params.sport !== 'all') query.set('sport', params.sport);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.league && params.league !== 'all') query.set('league', params.league);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/sports/live-feed?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch live sports feed');
    return data;
  },

  async getMatchDetails(matchId: string): Promise<{
    match: SportMatch | null;
    events?: any[];
    stats?: any;
    venueInfo?: { name: string; city?: string; capacity?: number };
  }> {
    const res = await fetch(`/api/sports/match/${encodeURIComponent(matchId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch match details');
    return data;
  },


  async getSportsStandings(sport: string = 'football'): Promise<MatchStanding[]> {
    const res = await fetch(`/api/sports/standings?sport=${sport}`);
    const data = await res.json();
    return data.standings || [];
  },

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    const res = await fetch('/api/tournaments');
    const data = await res.json();
    return data.tournaments || [];
  },

  async getTournamentById(id: string): Promise<Tournament> {
    const res = await fetch(`/api/tournaments/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Tournament not found');
    return data.tournament;
  },

  // Fan Zone
  async getFanQuizzes(): Promise<FanQuiz[]> {
    const res = await fetch('/api/fanzone/quizzes');
    const data = await res.json();
    return data.quizzes || [];
  },

  async submitQuiz(quizId: string, answers: { questionId: string; selectedIndex: number }[], userIdentifier?: string): Promise<{
    score: number;
    total: number;
    pointsEarned: number;
    feedback: { questionId: string; isCorrect: boolean; correctIndex: number; explanation: string }[];
  }> {
    const res = await fetch('/api/fanzone/quizzes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, answers, userIdentifier })
    });
    const data = await res.json();
    return data;
  },

  async getPredictions(): Promise<FanPredictionPoll[]> {
    const res = await fetch('/api/fanzone/predictions');
    const data = await res.json();
    return data.predictions || [];
  },

  async votePrediction(pollId: string, option: 'A' | 'B' | 'draw'): Promise<{ success: boolean; poll?: FanPredictionPoll; message?: string }> {
    const res = await fetch('/api/fanzone/predictions/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, option })
    });
    return await res.json();
  },

  async getPlayerVoteCandidates(): Promise<PlayerVoteCandidate[]> {
    const res = await fetch('/api/fanzone/players');
    const data = await res.json();
    return data.candidates || [];
  },

  async votePlayer(candidateId: string): Promise<{ success: boolean; candidates: PlayerVoteCandidate[] }> {
    const res = await fetch('/api/fanzone/players/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId })
    });
    return await res.json();
  },

  async getLeaderboard(): Promise<FanLeaderboardEntry[]> {
    const res = await fetch('/api/fanzone/leaderboard');
    const data = await res.json();
    return data.leaderboard || [];
  },

  // Match Reminders
  async subscribeTeamReminder(data: {
    teamName: string;
    sport: string;
    customerPhone?: string;
    customerEmail?: string;
    notifyBrowser: boolean;
    notifyEmail: boolean;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/reminders/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // Loyalty Program
  async getLoyaltyBalance(query: string): Promise<LoyaltyAccount> {
    const res = await fetch(`/api/loyalty/balance?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Loyalty account not found');
    return data.account;
  },

  async redeemLoyaltyReward(phone: string, pointsCost: number): Promise<{ success: boolean; voucher?: LoyaltyRewardVoucher; message?: string }> {
    const res = await fetch('/api/loyalty/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pointsCost })
    });
    return await res.json();
  },

  // Founder Profile
  async getFounderProfile(): Promise<FounderProfile> {
    const res = await fetch('/api/founder-profile');
    const data = await res.json();
    return data.founderProfile;
  },

  async updateFounderProfile(profile: Partial<FounderProfile>): Promise<{ success: boolean; founderProfile: FounderProfile; message?: string }> {
    const res = await fetch('/api/admin/founder-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update founder profile');
    }
    return data;
  },

  // --- AI SHOPPING CHAT METHODS ---
  async getChatbotSettings(): Promise<ChatbotSettings> {
    const res = await fetch('/api/chat/settings');
    const data = await res.json();
    return data.settings;
  },

  async updateChatbotSettings(settings: Partial<ChatbotSettings>): Promise<{ success: boolean; settings: ChatbotSettings; message: string }> {
    const res = await fetch('/api/admin/chat/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update chatbot settings');
    }
    return data;
  },

  async searchProductsForChat(filters: {
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
  }): Promise<Product[]> {
    const res = await fetch('/api/chat/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    const data = await res.json();
    return data.products || [];
  },

  async getChatStatus(): Promise<ChatSystemStatus> {
    const res = await fetch('/api/chat/status');
    const data = await res.json();
    return data;
  },

  async sendChatMessage(payload: {
    message: string;
    history?: { sender: 'user' | 'assistant'; text: string }[];
    isNewConversation?: boolean;
    phone?: string;
  }): Promise<{
    success: boolean;
    reply: string;
    products: ChatProductCard[];
    orderInfo?: ChatOrderSummary;
    suggestedReplies: string[];
    showSupportOptions?: boolean;
    supportDetails?: ChatSupportDetails;
    aiConnected?: boolean;
    rateLimited?: boolean;
  }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error processing your chat message');
    }
    return data;
  },

  // ================= ADS & TRACKING MANAGEMENT =================

  async getPublicTrackingConfig(): Promise<MarketingIntegrationConfig> {
    const res = await fetch('/api/tracking/config');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load tracking config');
    return data.config;
  },

  async sendClientTrackingLog(payload: {
    source: string;
    eventName: string;
    status?: 'success' | 'warning' | 'error' | 'info';
    message?: string;
    payload?: any;
  }): Promise<void> {
    try {
      await fetch('/api/tracking/client-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Non-blocking telemetry
    }
  },

  async getAdminMarketingConfig(): Promise<MarketingIntegrationConfig> {
    const res = await fetch('/api/admin/tracking/config', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.status === 401) {
      clearStoredAdminToken(data.message);
      throw new Error(data.message || 'Unauthorized');
    }
    if (!res.ok) throw new Error(data.message || 'Unauthorized');
    return data.config;
  },

  async updateAdminMarketingConfig(patch: Partial<MarketingIntegrationConfig>): Promise<MarketingIntegrationConfig> {
    const res = await fetch('/api/admin/tracking/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(patch)
    });
    const data = await res.json();
    if (res.status === 401) {
      clearStoredAdminToken(data.message);
      throw new Error(data.message || 'Unauthorized');
    }
    if (!res.ok) throw new Error(data.message || 'Failed to update tracking settings');
    return data.config;
  },

  async testMarketingIntegration(
    provider: 'meta' | 'google_ads' | 'ga4' | 'gtm',
    eventId?: string,
    testPayload?: any
  ): Promise<{ success: boolean; message: string; log: MarketingIntegrationLog }> {
    const res = await fetch('/api/admin/tracking/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ provider, eventId, testPayload })
    });
    const data = await res.json();
    if (res.status === 401) {
      clearStoredAdminToken(data.message);
      throw new Error(data.message || 'Unauthorized');
    }
    if (!res.ok) throw new Error(data.message || 'Test request failed');
    return data;
  },

  async getMarketingLogs(limit: number = 60): Promise<MarketingIntegrationLog[]> {
    const res = await fetch(`/api/admin/tracking/logs?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.status === 401) {
      clearStoredAdminToken(data.message);
      throw new Error(data.message || 'Unauthorized');
    }
    if (!res.ok) throw new Error(data.message || 'Failed to fetch logs');
    return data.logs || [];
  },

  async clearMarketingLogs(): Promise<boolean> {
    const res = await fetch('/api/admin/tracking/logs', {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.status === 401) {
      clearStoredAdminToken(data.message);
      throw new Error(data.message || 'Unauthorized');
    }
    if (!res.ok) throw new Error(data.message || 'Failed to clear logs');
    return true;
  },

  async getSavedCampaigns(): Promise<SavedUtmCampaign[]> {
    const res = await fetch('/api/admin/tracking/campaigns', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.status === 401) {
      clearStoredAdminToken(data.message);
      throw new Error(data.message || 'Unauthorized');
    }
    if (!res.ok) throw new Error(data.message || 'Failed to fetch campaigns');
    return data.campaigns || [];
  },

  async saveCampaign(campaign: Omit<SavedUtmCampaign, 'id' | 'createdAt'>): Promise<SavedUtmCampaign> {
    const res = await fetch('/api/admin/tracking/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(campaign)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save campaign');
    return data.campaign;
  },

  async updateCampaign(id: string, patch: Partial<SavedUtmCampaign>): Promise<SavedUtmCampaign> {
    const res = await fetch(`/api/admin/tracking/campaigns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(patch)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update campaign');
    return data.campaign;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/tracking/campaigns/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete campaign');
    return true;
  }
};

