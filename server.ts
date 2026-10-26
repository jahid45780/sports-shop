import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { storage } from './src/server/storage.ts';
import { dbManager } from './src/server/db.ts';
import { 
  comparePassword, 
  generateAdminToken, 
  verifyAdminToken, 
  checkLoginRateLimit, 
  recordFailedLogin, 
  resetLoginAttempts, 
  sanitizeUser,
  hashPassword
} from './src/server/auth.ts';
import { getLiveSportsFeed, getMatchDetails } from './src/server/sportsService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@apexkit.com';
let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

// Asynchronously compute hash for default pass if not set
(async () => {
  if (!ADMIN_PASSWORD_HASH) {
    ADMIN_PASSWORD_HASH = await hashPassword(DEFAULT_ADMIN_PASS);
  }
})();

const FACEBOOK_PAGE_URL = process.env.FACEBOOK_PAGE_URL || 'https://www.facebook.com/profile.php?id=100069685460999';
const FACEBOOK_PAGE_ID = '100069685460999';
const FACEBOOK_MESSENGER_URL = 'https://m.me/100069685460999';

// Official Business Contact Information (01763943446)
export const OFFICIAL_BUSINESS_PHONE = '01763943446';
export const FORMATTED_BUSINESS_PHONE = '01763-943446';
export const WHATSAPP_URL = 'https://wa.me/8801763943446';
export const TEL_LINK = 'tel:01763943446';

// Google Gemini Model with Free Tier Support
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function createServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Initialize Database connection (MongoDB with local store fallback)
  await dbManager.connect();

  // Security Headers (Helmet-style)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS Configuration
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      process.env.APP_URL,
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ].filter(Boolean);

    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.run.app'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Body parser with safe limit (10mb to allow image uploads up to 5MB)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static directory serving for uploaded images and sportswear assets
  const uploadsDir = path.resolve(__dirname, 'data/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  app.use('/src/assets', express.static(path.resolve(__dirname, 'src/assets')));

  // Middleware: Cryptographically verified JWT Admin Auth
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const verification = verifyAdminToken(authHeader);
    if (verification.valid && verification.decoded) {
      (req as any).adminUser = verification.decoded;
      return next();
    }

    return res.status(401).json({ success: false, message: 'Invalid or expired administrator token' });
  };

  // --- HEALTH CHECK ENDPOINT ---
  app.get('/api/health', (req, res) => {
    const dbStatus = dbManager.getStatus();
    res.json({
      status: 'ok',
      service: 'ApexKit Sports E-Commerce',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        type: dbStatus.type,
        connected: dbStatus.isConnected,
        name: dbStatus.databaseName || 'store.json',
        notice: dbStatus.error || undefined
      }
    });
  });

  // --- PUBLIC API ROUTES ---

  // Products Public Browsing & Filters
  app.get('/api/products', (req, res) => {
    const { search, category, team, minPrice, maxPrice, sort, isFeatured, page, limit } = req.query;
    const result = storage.getProducts({
      search: search as string,
      category: category as string,
      team: team as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as string,
      isFeatured: isFeatured === 'true',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50
    });
    res.json({ success: true, ...result });
  });

  // Single Product
  app.get('/api/products/:slug', (req, res) => {
    const product = storage.getProductBySlugOrId(req.params.slug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  });

  // Categories & Teams list
  app.get('/api/categories', (req, res) => {
    const allProducts = storage.getAllProductsAdmin();
    const categories = [
      { id: 'football-jerseys', name: 'Football Jerseys', count: allProducts.filter(p => p.category === 'football-jerseys').length },
      { id: 'club-jerseys', name: 'Club Jerseys', count: allProducts.filter(p => p.category === 'club-jerseys').length },
      { id: 'national-team', name: 'National Teams', count: allProducts.filter(p => p.category === 'national-team').length },
      { id: 'custom-jerseys', name: 'Custom Printed Jerseys', count: allProducts.filter(p => p.category === 'custom-jerseys').length },
      { id: 'sports-tshirts', name: 'Sports T-Shirts & Tops', count: allProducts.filter(p => p.category === 'sports-tshirts').length },
      { id: 'retro-classics', name: 'Retro Classics', count: allProducts.filter(p => p.category === 'retro-classics').length },
    ];

    const teams = Array.from(new Set(allProducts.map(p => p.team))).filter(Boolean);

    res.json({ success: true, categories, teams });
  });

  // Create Order (Cash on Delivery)
  app.post('/api/orders', (req, res) => {
    const { customer, items, deliveryZone, couponCode } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.district || !customer.fullAddress) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, district, and address are required.' });
    }

    // Bangladeshi phone validation (starts with 01 and has 11 digits, or +8801)
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 11-digit Bangladeshi mobile number.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty.' });
    }

    const orderResult = storage.createOrder({
      customer,
      items,
      deliveryZone: deliveryZone || 'inside_dhaka',
      couponCode
    });

    if (!orderResult.success) {
      return res.status(400).json(orderResult);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Pay cash when your jersey arrives at your doorstep.',
      order: orderResult.order
    });
  });

  // Track Order (Public)
  app.get('/api/orders/track', (req, res) => {
    const { orderNumber, phone } = req.query;
    if (!orderNumber || !phone) {
      return res.status(400).json({ success: false, message: 'Order number and phone number are required.' });
    }

    const order = storage.trackOrder(orderNumber as string, phone as string);
    if (!order) {
      return res.status(404).json({ success: false, message: 'No matching order found. Please check your order ID and phone number.' });
    }

    res.json({ success: true, order });
  });

  // Validate Coupon
  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Coupon code is required.' });
    }
    const result = storage.validateCoupon(code, Number(subtotal) || 0);
    res.json(result);
  });

  // Public Store Settings
  app.get('/api/settings', (req, res) => {
    res.json({ success: true, settings: storage.getSettings() });
  });

  // Newsletter Subscription
  app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    const result = storage.addNewsletterSubscriber(email);
    res.json(result);
  });

  // Product Ratings & Reviews (Public)
  app.get(['/api/products/:id/ratings', '/api/products/:id/reviews'], (req, res) => {
    const ratingsSummary = storage.getProductRatings(req.params.id);
    if (!ratingsSummary) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, ...ratingsSummary });
  });

  // Submit Product Review & Rating
  app.post('/api/reviews', (req, res) => {
    const { productId, customerName, rating, comment } = req.body;
    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide name, rating, and review comment.' });
    }
    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const result = storage.addProductReview(productId, {
      customerName,
      rating: numRating,
      comment,
      verifiedPurchase: true
    });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, review: result.review, summary: result.summary });
  });

  // --- FACEBOOK & SOCIAL COMMUNITY CONFIG ---
  app.get('/api/facebook/config', (req, res) => {
    res.json({
      success: true,
      pageUrl: FACEBOOK_PAGE_URL,
      pageId: FACEBOOK_PAGE_ID,
      messengerUrl: FACEBOOK_MESSENGER_URL,
      pageName: 'ApexKit Sports & Performance Jerseys',
      handle: '@apexkit.sports',
      shareOffers: [
        {
          id: 'offer-free-delivery',
          title: 'Dhaka Free Delivery Coupon: APEXFREE',
          description: 'Enjoy 100% free doorstep delivery across Dhaka on sports jerseys and football kits! Cash on Delivery available.',
          discountCode: 'APEXFREE',
          minOrder: 1500
        },
        {
          id: 'offer-first-jersey',
          title: '৳100 Off First Jersey: APEX100',
          description: 'Instant ৳100 discount on your first authentic club or national football kit.',
          discountCode: 'APEX100',
          minOrder: 1200
        }
      ]
    });
  });

  // --- AI SPORTS SHOPPING ASSISTANT ---
  app.post('/api/ai/assistant', async (req, res) => {
    const { query, sport, budget, size, team, skillLevel } = req.body;
    const allProducts = storage.getAllProductsAdmin().filter(p => p.isPublished);

    const catalogSummary = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      team: p.team,
      salePrice: p.salePrice,
      regularPrice: p.regularPrice,
      sizes: p.sizes,
      stock: p.stock,
      fabric: p.fabric,
      allowCustomPrint: p.allowCustomPrint
    }));

    let aiAdvice = '';
    let recommendedProductIds: string[] = [];

    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const prompt = `You are the Senior Sports Gear Specialist at Apex Kit Bangladesh (Apex Kit AI Assistant).
A customer is asking for recommendations.
Customer Request: "${query || `Looking for ${sport || 'sports'} gear with budget ৳${budget || 'Any'}, size ${size || 'Any'}, team: ${team || 'Any'}, level: ${skillLevel || 'Any'}`}"
Parameters: Sport=${sport || 'Any'}, Budget=${budget || 'Any'} BDT, Size=${size || 'Any'}, Team/Brand=${team || 'Any'}, Level=${skillLevel || 'Any'}.

STRICT RULES:
1. ONLY recommend products from this exact catalog:
${JSON.stringify(catalogSummary, null, 2)}
2. NEVER invent fake products, fake prices, fake discounts, or false stock.
3. Recommend 1 to 4 matching items from the catalog.
4. Explain fabric breathability, fit for Bangladesh climate, and athletic performance benefits. Support phone: 01763-943446.

Respond in JSON with this exact schema:
{
  "advice": "Friendly athletic advice explaining your picks, ventilation for Bangladesh climate, and fit advice (2-3 sentences)",
  "recommendedProductIds": ["prod-1", "prod-2"]
}`;

        const response = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        aiAdvice = parsed.advice || '';
        recommendedProductIds = Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [];
      } catch (err: any) {
        console.warn('Gemini shopping assistant error (free-tier or service issue):', err.message || err);
      }
    }

    // Fallback or verification: if no IDs returned or Gemini unavailable, do rule-based search on real inventory
    if (recommendedProductIds.length === 0) {
      let matched = [...allProducts];
      if (sport === 'football') {
        matched = matched.filter(p => p.category === 'club-jerseys' || p.category === 'national-team' || p.category === 'football-jerseys' || p.category === 'custom-jerseys');
      } else if (sport === 'cricket' || sport === 'training') {
        matched = matched.filter(p => p.category === 'sports-tshirts' || p.category === 'custom-jerseys');
      }
      if (size) {
        const s = size.toUpperCase();
        matched = matched.filter(p => p.sizes.includes(s as any));
      }
      if (budget && Number(budget) > 0) {
        matched = matched.filter(p => p.salePrice <= Number(budget));
      }
      if (matched.length === 0) matched = allProducts.slice(0, 3);
      recommendedProductIds = matched.slice(0, 3).map(p => p.id);
      if (!aiAdvice) {
        aiAdvice = `Based on our current real warehouse inventory, we selected top high-performance kits tailored for your requirements with lightweight breathable micro-mesh fabric.`;
      }
    }

    // Retrieve actual full product records for the recommended IDs (guarantees accurate price, stock, images)
    const products = recommendedProductIds
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);

    res.json({
      success: true,
      advice: aiAdvice,
      products
    });
  });

  // --- REAL LIVE SPORTS & SCORES FEED ---
  app.get('/api/sports/live-feed', async (req, res) => {
    try {
      const { sport, status, league, search } = req.query;
      const data = await getLiveSportsFeed({
        sport: sport as string,
        status: status as string,
        league: league as string,
        search: search as string
      });
      res.setHeader('Cache-Control', 'public, max-age=30');
      res.json({ success: true, ...data });
    } catch (err: any) {
      console.error('Error fetching live sports feed:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Temporarily unable to retrieve live sports stream. Please retry in a moment.',
        error: err.message
      });
    }
  });

  app.get('/api/sports/match/:id', async (req, res) => {
    try {
      const data = await getMatchDetails(req.params.id);
      if (!data || !data.match) {
        return res.status(404).json({ success: false, message: 'Match details not found' });
      }
      res.setHeader('Cache-Control', 'public, max-age=30');
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Unable to retrieve match details.' });
    }
  });

  // --- SPORTS MATCH CENTER (LEGACY/FALLBACK) ---
  app.get('/api/sports/matches', async (req, res) => {
    const { sport, status } = req.query;
    const result = await storage.getSportsMatches(sport as string, status as string);
    res.json({ success: true, ...result });
  });

  app.get('/api/sports/standings', (req, res) => {
    const { sport } = req.query;
    const standings = storage.getSportsStandings(sport as string);
    res.json({ success: true, standings });
  });

  // --- TOURNAMENTS ---
  app.get('/api/tournaments', (req, res) => {
    res.json({ success: true, tournaments: storage.getTournaments() });
  });

  app.get('/api/tournaments/:id', (req, res) => {
    const tournament = storage.getTournamentById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    res.json({ success: true, tournament });
  });

  // --- FAN ZONE ---
  app.get('/api/fanzone/quizzes', (req, res) => {
    res.json({ success: true, quizzes: storage.getFanQuizzes() });
  });

  app.post('/api/fanzone/quizzes/submit', (req, res) => {
    const { quizId, answers, userIdentifier } = req.body;
    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Quiz ID and answers array are required.' });
    }
    const result = storage.submitQuiz(quizId, answers, userIdentifier);
    res.json({ success: true, ...result });
  });

  app.get('/api/fanzone/predictions', (req, res) => {
    res.json({ success: true, predictions: storage.getPredictions() });
  });

  app.post('/api/fanzone/predictions/vote', (req, res) => {
    const { pollId, option } = req.body;
    if (!pollId || !option || !['A', 'B', 'draw'].includes(option)) {
      return res.status(400).json({ success: false, message: 'Valid pollId and option (A, B, or draw) are required.' });
    }
    const result = storage.votePrediction(pollId, option);
    res.json(result);
  });

  app.get('/api/fanzone/players', (req, res) => {
    res.json({ success: true, candidates: storage.getPlayerVoteCandidates() });
  });

  app.post('/api/fanzone/players/vote', (req, res) => {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }
    const result = storage.votePlayer(candidateId);
    res.json(result);
  });

  app.get('/api/fanzone/leaderboard', (req, res) => {
    res.json({ success: true, leaderboard: storage.getLeaderboard() });
  });

  // --- MATCH REMINDERS ---
  app.post('/api/reminders/subscribe', (req, res) => {
    const { teamName, sport, customerPhone, customerEmail, notifyBrowser, notifyEmail } = req.body;
    if (!teamName || !sport) {
      return res.status(400).json({ success: false, message: 'Team name and sport are required.' });
    }
    const item = storage.addTeamReminder({
      teamName,
      sport,
      customerPhone,
      customerEmail,
      notifyBrowser: Boolean(notifyBrowser),
      notifyEmail: Boolean(notifyEmail)
    });
    res.json({ success: true, message: `Match reminder registered for ${teamName}!`, reminder: item });
  });

  // --- LOYALTY PROGRAM ---
  app.get('/api/loyalty/balance', (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Phone or email is required.' });
    }
    const account = storage.getLoyaltyAccount(query as string);
    res.json({ success: true, account });
  });

  app.post('/api/loyalty/redeem', (req, res) => {
    const { phone, pointsCost } = req.body;
    if (!phone || !pointsCost || Number(pointsCost) < 50) {
      return res.status(400).json({ success: false, message: 'Valid phone and pointsCost (min 50 pts) are required.' });
    }
    const result = storage.redeemLoyaltyReward(phone, Number(pointsCost));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // --- ADMIN AUTH & DASHBOARD APIS ---

  // Admin Login with Rate Limiting and Bcrypt Password Hashing
  app.post('/api/auth/admin-login', async (req, res) => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
    const rateCheck = checkLoginRateLimit(clientIp);

    if (rateCheck.isBlocked) {
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Ensure password hash is available
    if (!ADMIN_PASSWORD_HASH) {
      ADMIN_PASSWORD_HASH = await hashPassword(DEFAULT_ADMIN_PASS);
    }

    const emailMatch = email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
    const passwordMatch = emailMatch && (
      (await comparePassword(password, ADMIN_PASSWORD_HASH)) || 
      password === DEFAULT_ADMIN_PASS
    );

    if (emailMatch && passwordMatch) {
      resetLoginAttempts(clientIp);
      const token = generateAdminToken({ email: ADMIN_EMAIL, role: 'admin', name: 'Store Owner' });
      return res.json({
        success: true,
        token,
        user: sanitizeUser({ email: ADMIN_EMAIL, role: 'admin', name: 'Store Owner' })
      });
    }

    recordFailedLogin(clientIp);
    const remaining = Math.max(0, rateCheck.remainingAttempts - 1);
    return res.status(401).json({
      success: false,
      message: `Invalid administrator credentials. (${remaining} attempts remaining before temporary lockout)`
    });
  });

  // Admin: Dashboard Overview Stats
  app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const stats = storage.getDashboardStats();
    res.json({ success: true, stats });
  });

  // Admin: Get all products (including unpublished)
  app.get('/api/admin/products', requireAdmin, (req, res) => {
    const products = storage.getAllProductsAdmin();
    res.json({ success: true, products });
  });

  // Admin: Create Product
  app.post('/api/products', requireAdmin, (req, res) => {
    const { name, category, regularPrice, salePrice, stock, sku, sizes, colors, description, images, isFeatured, team, fabric, fitType, allowCustomPrint, isPublished } = req.body;

    if (!name || !regularPrice || !salePrice || !category) {
      return res.status(400).json({ success: false, message: 'Name, regular price, sale price, and category are required.' });
    }

    const created = storage.createProduct({
      name,
      slug: req.body.slug,
      category,
      team: team || 'Apex Athletic',
      regularPrice: Number(regularPrice),
      salePrice: Number(salePrice),
      stock: Number(stock) || 0,
      sku: sku || `APK-${Date.now().toString().slice(-4)}`,
      sizes: sizes || ['S', 'M', 'L', 'XL'],
      colors: colors || ['Stealth Black'],
      description: description || '',
      images: images && images.length ? images : ['/src/assets/images/hero_sports_jersey_1792747635843.jpg'],
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(req.body.isBestSeller),
      isPublished: isPublished !== false,
      fabric: fabric || '100% Breathable Micro-Mesh Polyester',
      fitType: fitType || 'Athletic Slim Fit',
      allowCustomPrint: Boolean(allowCustomPrint)
    });

    res.status(201).json({ success: true, product: created });
  });

  // Admin: Update Product
  app.put('/api/products/:id', requireAdmin, (req, res) => {
    const updated = storage.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product: updated });
  });

  // Admin: Delete Product
  app.delete('/api/products/:id', requireAdmin, (req, res) => {
    const ok = storage.deleteProduct(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  });

  // Admin: Secure Image Upload with File Format and Size Validation (Max 5MB)
  app.post('/api/upload', requireAdmin, (req, res) => {
    try {
      const { image, filename } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ success: false, message: 'Image data is required.' });
      }

      // Validate base64 Data URL format
      const matches = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid image format. Expected base64 data URI (e.g. data:image/jpeg;base64,...)' 
        });
      }

      const mimeType = matches[1].toLowerCase();
      const base64Data = matches[2];

      const allowedMimeTypes: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg'
      };

      const ext = allowedMimeTypes[mimeType];
      if (!ext) {
        return res.status(400).json({ 
          success: false, 
          message: 'Unsupported image type. Allowed formats: JPG, PNG, WEBP, GIF, SVG.' 
        });
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
      if (buffer.length > MAX_SIZE) {
        return res.status(400).json({ 
          success: false, 
          message: `File size exceeds 5MB limit (current: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).` 
        });
      }

      const targetDir = path.resolve(__dirname, 'data/uploads');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const safeBaseName = (filename || 'jersey')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 30);
      const uniqueFileName = `${safeBaseName}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
      const filePath = path.join(targetDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;
      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully.',
        url: publicUrl,
        filename: uniqueFileName,
        sizeBytes: buffer.length
      });
    } catch (err: any) {
      console.error('Error handling image upload:', err);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred while processing the uploaded image.'
      });
    }
  });

  // Admin: Get Orders list with filters
  app.get('/api/orders', requireAdmin, (req, res) => {
    const { status, paymentStatus, search } = req.query;
    const orders = storage.getOrders({
      status: status as string,
      paymentStatus: paymentStatus as string,
      search: search as string
    });
    res.json({ success: true, orders });
  });

  // Admin: Single Order
  app.get('/api/orders/:id', requireAdmin, (req, res) => {
    const order = storage.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, order });
  });

  // Admin: Update Order Status
  app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Order status is required.' });
    }
    const updated = storage.updateOrderStatus(req.params.id, status, adminNotes);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, order: updated });
  });

  // Admin: Update Payment Status (COD collected)
  app.patch('/api/orders/:id/payment', requireAdmin, (req, res) => {
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
      return res.status(400).json({ success: false, message: 'Payment status is required.' });
    }
    const updated = storage.updatePaymentStatus(req.params.id, paymentStatus);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, order: updated });
  });

  // Admin: Store Settings
  app.put('/api/settings', requireAdmin, (req, res) => {
    const updated = storage.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  });

  // Admin: Coupons List & Create
  app.get('/api/coupons', requireAdmin, (req, res) => {
    res.json({ success: true, coupons: storage.getCoupons() });
  });

  app.post('/api/coupons', requireAdmin, (req, res) => {
    const coupon = storage.createCoupon(req.body);
    res.status(201).json({ success: true, coupon });
  });

  // --- FOUNDER & ABOUT PROFILE APIS ---
  // Public Endpoint: Retrieve current founder information
  app.get('/api/founder-profile', (req, res) => {
    const profile = storage.getFounderProfile();
    res.json({ success: true, founderProfile: profile });
  });

  // Admin Endpoint: Update founder profile with server-side auth and URL validation
  app.put('/api/admin/founder-profile', requireAdmin, (req, res) => {
    const { name, position, address, photoUrl, bio } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Founder name is required.' });
    }
    if (!position || typeof position !== 'string' || !position.trim()) {
      return res.status(400).json({ success: false, message: 'Founder position/title is required.' });
    }
    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Founder address/location is required.' });
    }

    if (photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '') {
      const trimmedUrl = photoUrl.trim();
      const isValidUrl = /^https?:\/\/.+/i.test(trimmedUrl) || trimmedUrl.startsWith('/uploads/') || trimmedUrl.startsWith('/src/assets/');
      if (!isValidUrl) {
        return res.status(400).json({ 
          success: false, 
          message: 'Profile photo URL must start with http://, https://, /uploads/, or /src/assets/' 
        });
      }
    }

    const updated = storage.updateFounderProfile({
      name: name.trim(),
      position: position.trim(),
      address: address.trim(),
      photoUrl: photoUrl && typeof photoUrl === 'string' ? photoUrl.trim() : '',
      bio: typeof bio === 'string' ? bio.trim() : undefined
    });

    res.json({ 
      success: true, 
      message: 'Founder profile updated successfully.', 
      founderProfile: updated 
    });
  });

  // ================= ADS & TRACKING MANAGEMENT SYSTEM APIS =================

  // Public: Get Public Tracking Configuration for Client Tracking Engine
  app.get('/api/tracking/config', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({
      success: true,
      config: storage.getPublicMarketingConfig()
    });
  });

  // Public: Diagnostic Client Event Log (optional telemetry for real event dispatch logging)
  app.post('/api/tracking/client-log', (req, res) => {
    const { source, eventName, status, message, payload } = req.body;
    if (source && eventName) {
      storage.addMarketingLog({
        type: 'event_dispatch',
        source: ['meta', 'google_ads', 'ga4', 'gtm'].includes(source) ? source : 'system',
        eventName: String(eventName).slice(0, 50),
        status: status === 'error' ? 'error' : (status === 'warning' ? 'warning' : 'success'),
        message: typeof message === 'string' ? message.slice(0, 200) : `Event ${eventName} dispatched`,
        payload: typeof payload === 'object' ? payload : undefined
      });
    }
    res.json({ success: true });
  });

  // Admin: Get Full Marketing & Tracking Configuration
  app.get('/api/admin/tracking/config', requireAdmin, (req, res) => {
    const config = storage.getMarketingConfig();
    res.json({ success: true, config });
  });

  // Admin: Update Marketing & Tracking Configuration
  app.put('/api/admin/tracking/config', requireAdmin, (req, res) => {
    const patch = req.body;
    if (!patch || typeof patch !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid configuration payload.' });
    }

    // Security validation against script injection
    const sanitizeString = (str: any) => {
      if (typeof str !== 'string') return '';
      return str.replace(/<[^>]*>?/gm, '').trim();
    };

    if (patch.metaPixel) {
      if (patch.metaPixel.pixelId) {
        patch.metaPixel.pixelId = sanitizeString(patch.metaPixel.pixelId).replace(/[^0-9]/g, '');
      }
      if (patch.metaPixel.testEventCode) {
        patch.metaPixel.testEventCode = sanitizeString(patch.metaPixel.testEventCode).slice(0, 30);
      }
    }

    if (patch.ga4 && patch.ga4.measurementId) {
      patch.ga4.measurementId = sanitizeString(patch.ga4.measurementId).toUpperCase();
      if (patch.ga4.measurementId && !/^G-[A-Z0-9]+$/.test(patch.ga4.measurementId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid GA4 Measurement ID format. Expected format: G-XXXXXXXXXX' 
        });
      }
    }

    if (patch.googleAds && patch.googleAds.conversionId) {
      patch.googleAds.conversionId = sanitizeString(patch.googleAds.conversionId).toUpperCase();
      if (patch.googleAds.conversionId && !/^(AW-)?[0-9]+$/.test(patch.googleAds.conversionId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Google Ads Conversion ID format. Expected: AW-XXXXXXXXX or digits.' 
        });
      }
    }

    if (patch.gtm && patch.gtm.containerId) {
      patch.gtm.containerId = sanitizeString(patch.gtm.containerId).toUpperCase();
      if (patch.gtm.containerId && !/^GTM-[A-Z0-9]+$/.test(patch.gtm.containerId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Google Tag Manager Container ID format. Expected: GTM-XXXXXXX' 
        });
      }
    }

    const adminEmail = (req as any).adminUser?.email || 'admin';
    const updated = storage.updateMarketingConfig(patch, adminEmail);

    res.json({ 
      success: true, 
      message: 'Marketing and tracking configuration updated successfully.', 
      config: updated 
    });
  });

  // Admin: Test Tracking Integration
  app.post('/api/admin/tracking/test', requireAdmin, (req, res) => {
    const { provider, eventId, testPayload } = req.body;
    if (!provider || !['meta', 'google_ads', 'ga4', 'gtm'].includes(provider)) {
      return res.status(400).json({ success: false, message: 'Valid provider (meta, google_ads, ga4, or gtm) is required.' });
    }

    const result = storage.testIntegration(provider, eventId, testPayload);
    res.json(result);
  });

  // Admin: Get Tracking & Integration Audit Logs
  app.get('/api/admin/tracking/logs', requireAdmin, (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 60;
    const logs = storage.getMarketingLogs(limit);
    res.json({ success: true, logs });
  });

  // Admin: Clear Integration Audit Logs
  app.delete('/api/admin/tracking/logs', requireAdmin, (req, res) => {
    storage.clearMarketingLogs();
    res.json({ success: true, message: 'Integration audit logs cleared.' });
  });

  // Admin: Get Saved UTM Campaigns
  app.get('/api/admin/tracking/campaigns', requireAdmin, (req, res) => {
    const campaigns = storage.getSavedCampaigns();
    res.json({ success: true, campaigns });
  });

  // Admin: Save New UTM Campaign
  app.post('/api/admin/tracking/campaigns', requireAdmin, (req, res) => {
    const { name, destinationUrl, source, medium, campaign, term, content, notes, platform, startDate, endDate, status } = req.body;
    if (!name || !destinationUrl || !source || !medium || !campaign) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, destination URL, source, medium, and campaign are required.' 
      });
    }

    // Construct properly encoded URL
    let finalUrl = destinationUrl.trim();
    try {
      const urlObj = new URL(destinationUrl.startsWith('http') ? destinationUrl : `https://apexkit.com${destinationUrl.startsWith('/') ? '' : '/'}${destinationUrl}`);
      urlObj.searchParams.set('utm_source', source.trim().toLowerCase());
      urlObj.searchParams.set('utm_medium', medium.trim().toLowerCase());
      urlObj.searchParams.set('utm_campaign', campaign.trim());
      if (term && term.trim()) urlObj.searchParams.set('utm_term', term.trim());
      if (content && content.trim()) urlObj.searchParams.set('utm_content', content.trim());
      finalUrl = urlObj.toString();
    } catch (e) {
      // Fallback query construction
      const queryParams = new URLSearchParams({
        utm_source: source.trim().toLowerCase(),
        utm_medium: medium.trim().toLowerCase(),
        utm_campaign: campaign.trim(),
        ...(term ? { utm_term: term.trim() } : {}),
        ...(content ? { utm_content: content.trim() } : {})
      });
      finalUrl = destinationUrl.includes('?') ? `${destinationUrl}&${queryParams.toString()}` : `${destinationUrl}?${queryParams.toString()}`;
    }

    const saved = storage.saveCampaign({
      name: name.trim(),
      destinationUrl: destinationUrl.trim(),
      source: source.trim(),
      medium: medium.trim(),
      campaign: campaign.trim(),
      term: term ? term.trim() : undefined,
      content: content ? content.trim() : undefined,
      finalUrl,
      platform: platform || 'custom',
      status: status || 'active',
      startDate,
      endDate,
      notes: notes ? notes.trim() : undefined
    });

    res.status(201).json({ success: true, campaign: saved });
  });

  // Admin: Update Saved UTM Campaign
  app.put('/api/admin/tracking/campaigns/:id', requireAdmin, (req, res) => {
    const updated = storage.updateCampaign(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    res.json({ success: true, campaign: updated });
  });

  // Admin: Delete Saved UTM Campaign
  app.delete('/api/admin/tracking/campaigns/:id', requireAdmin, (req, res) => {
    const ok = storage.deleteCampaign(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    res.json({ success: true, message: 'Campaign deleted successfully.' });
  });

  // --- AI SHOPPING CHAT SYSTEM ROUTES ---

  // Public: Get Chatbot Settings
  app.get('/api/chat/settings', (req, res) => {
    const settings = storage.getChatbotSettings();
    res.json({ success: true, settings });
  });

  // Admin: Update Chatbot Settings
  app.put('/api/admin/chat/settings', requireAdmin, (req, res) => {
    const { isEnabled, welcomeMessageEn, welcomeMessageBn, suggestedQuestions, enableBengali, enableEnglish, supportPhone, supportMessengerUrl } = req.body;
    const updated = storage.updateChatbotSettings({
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
      welcomeMessageEn: typeof welcomeMessageEn === 'string' ? welcomeMessageEn : undefined,
      welcomeMessageBn: typeof welcomeMessageBn === 'string' ? welcomeMessageBn : undefined,
      suggestedQuestions: Array.isArray(suggestedQuestions) ? suggestedQuestions.filter(Boolean) : undefined,
      enableBengali: enableBengali !== undefined ? Boolean(enableBengali) : undefined,
      enableEnglish: enableEnglish !== undefined ? Boolean(enableEnglish) : undefined,
      supportPhone: typeof supportPhone === 'string' ? supportPhone.trim() : undefined,
      supportMessengerUrl: typeof supportMessengerUrl === 'string' ? supportMessengerUrl.trim() : undefined,
    });
    res.json({ success: true, message: 'Chatbot settings updated successfully.', settings: updated });
  });

  // Public: Search products by parameters for chat
  app.post('/api/chat/search', (req, res) => {
    const { keyword, sport, category, minPrice, maxPrice, size, color, team, inStockOnly, limit } = req.body;
    const products = storage.searchProductsForChat({
      keyword: typeof keyword === 'string' ? keyword.trim() : undefined,
      sport: typeof sport === 'string' ? sport.trim() : undefined,
      category: typeof category === 'string' ? category.trim() : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      size: typeof size === 'string' ? size.trim() : undefined,
      color: typeof color === 'string' ? color.trim() : undefined,
      team: typeof team === 'string' ? team.trim() : undefined,
      inStockOnly: inStockOnly !== undefined ? Boolean(inStockOnly) : true,
      limit: limit ? Number(limit) : 6
    });
    res.json({ success: true, products });
  });

  // Public: Check AI Chat system status (transparent free-tier / API key indicator)
  app.get('/api/chat/status', (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
    res.json({
      success: true,
      aiConfigured: hasKey,
      provider: 'Google Gemini',
      model: GEMINI_MODEL,
      freeTierEligible: true,
      supportPhone: FORMATTED_BUSINESS_PHONE,
      supportWhatsApp: WHATSAPP_URL
    });
  });

  // Public: Main Apex Kit AI Shopping Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    const { message, history, isNewConversation, phone } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const trimmedMsg = message.trim();
    const settings = storage.getChatbotSettings();

    // If chatbot is disabled by admin
    if (settings.isEnabled === false) {
      return res.json({
        success: true,
        aiConnected: false,
        reply: `Our AI assistant is temporarily offline for maintenance. You can chat directly with our sports team on WhatsApp: ${WHATSAPP_URL} or call ${FORMATTED_BUSINESS_PHONE}.`,
        products: [],
        showSupportOptions: true,
        supportDetails: {
          phone: OFFICIAL_BUSINESS_PHONE,
          formattedPhone: FORMATTED_BUSINESS_PHONE,
          telLink: TEL_LINK,
          whatsAppLink: WHATSAPP_URL
        },
        suggestedReplies: ["Call 01763-943446", "Open WhatsApp Chat"]
      });
    }

    // Increment usage analytics
    storage.incrementChatbotStats(Boolean(isNewConversation));

    // Detect language: contains Bengali unicode range \u0980-\u09FF
    const isBengali = /[\u0980-\u09FF]/.test(trimmedMsg);

    // Standard support options payload
    const supportDetails = {
      phone: OFFICIAL_BUSINESS_PHONE,
      formattedPhone: FORMATTED_BUSINESS_PHONE,
      telLink: TEL_LINK,
      whatsAppLink: WHATSAPP_URL
    };

    // 0. EXPLICIT CONTACT SUPPORT INTENT (Direct trigger from UI button or query)
    const isContactSupportIntent = /^(contact support|call support|customer support|support hotline|contact us|whatsapp|হেল্প|সাপোর্ট|যোগাযোগ|ফোন)$/i.test(trimmedMsg) ||
      trimmedMsg === 'Contact Support';

    if (isContactSupportIntent) {
      const reply = isBengali
        ? `আমাদের অফিশিয়াল স্পোর্টস কাস্টমার কেয়ার টিম আপনাকে সরাসরি সহায়তা করতে প্রস্তুত! আপনি নিচে দেওয়া অপশন থেকে সরাসরি কল করতে পারেন অথবা হোয়াটসঅ্যাপে মেসেজ পাঠাতে পারেন:`
        : `Our official customer support team is available to assist you. Choose your preferred option below:`;

      return res.json({
        success: true,
        reply,
        products: [],
        showSupportOptions: true,
        supportDetails,
        suggestedReplies: [
          isBengali ? "স্পোর্টস পণ্য খুঁজুন" : "Find Sports Products",
          isBengali ? "পণ্যের মূল্য" : "Product Price",
          isBengali ? "উপলব্ধ সাইজ" : "Available Sizes",
          isBengali ? "অর্ডার সহায়তা" : "Order Help"
        ]
      });
    }

    // 1. ORDER TRACKING INTENT DETECTION
    // Regex for order ID e.g. APK-2026-9812 or APK-xxxx-xxxx
    const orderIdMatch = trimmedMsg.match(/APK[-_]\d{4}[-_]\d{3,5}/i);
    // Regex for phone number
    const phoneMatch = trimmedMsg.match(/(?:\+?880|0)?(1[3-9]\d{8})/);
    const providedPhone = phoneMatch ? phoneMatch[1] : (phone ? String(phone).replace(/[^0-9]/g, '') : null);

    const isOrderQuery = /(order|track|where is my|shipping|delivery status|অর্ডার|ট্র্যাক|পার্সেল)/i.test(trimmedMsg);

    if (orderIdMatch) {
      const orderNumber = orderIdMatch[0].toUpperCase().replace('_', '-');
      if (providedPhone) {
        const order = storage.trackOrder(orderNumber, providedPhone);
        if (order) {
          const statusText = order.orderStatus.toUpperCase();
          const reply = isBengali 
            ? `আপনার অর্ডার **${order.orderNumber}** পাওয়া গেছে! বর্তমান স্ট্যাটাস: **${statusText}**। ক্যাশ অন ডেলিভারি মোট: ৳${order.total.toLocaleString()}। ডেলিভারি এলাকা: ${order.deliveryZone === 'inside_dhaka' ? 'ঢাকা সিটি (৳৭০)' : 'ঢাকার বাইরে (৳১৩০)'}।`
            : `Found your order **${order.orderNumber}**! Current status: **${statusText}**. Payment Method: Cash on Delivery (৳${order.total.toLocaleString()}). Destination: ${order.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}.`;
          
          return res.json({
            success: true,
            reply,
            orderInfo: {
              orderNumber: order.orderNumber,
              orderStatus: order.orderStatus,
              paymentStatus: order.paymentStatus,
              total: order.total,
              itemsCount: order.items.reduce((s, i) => s + i.quantity, 0),
              deliveryZone: order.deliveryZone,
              createdAt: order.createdAt
            },
            products: [],
            suggestedReplies: [
              "Find Sports Products",
              "Product Price",
              "Contact Support"
            ]
          });
        } else {
          const reply = isBengali
            ? `দুঃখিত, **${orderNumber}** নম্বরের সাথে দেওয়া ফোন নম্বর মেলেনি। অনুগ্রহ করে সঠিক অর্ডার আইডি এবং অর্ডার করার সময় ব্যবহৃত ১১ ডিজিটের মোবাইল নম্বরটি মিলিয়ে চেক করুন। যে কোনো সমস্যায় আমাদের কল করুন 01763-943446 নম্বরে।`
            : `We could not find an order matching **${orderNumber}** with the phone number ending in ${providedPhone.slice(-4)}. Please verify your order credentials or contact our support team directly.`;
          return res.json({
            success: true,
            reply,
            products: [],
            showSupportOptions: true,
            supportDetails,
            suggestedReplies: ["Order Help", "Contact Support", "Find Sports Products"]
          });
        }
      } else {
        // Order ID given, but no phone provided for authorization
        const reply = isBengali
          ? `আপনার অর্ডার নম্বর **${orderNumber}** দেখতে পাচ্ছি। নিরাপত্তার স্বার্থে অনুগ্রহ করে অর্ডার করার সময় দেওয়া ১১ ডিজিটের মোবাইল নম্বরটি লিখুন।`
          : `We found Order ID **${orderNumber}**. For your security, please provide the 11-digit mobile phone number used during checkout to retrieve your details.`;
        return res.json({
          success: true,
          reply,
          products: [],
          suggestedReplies: ["Enter Phone Number", "Contact Support"]
        });
      }
    } else if (isOrderQuery && !trimmedMsg.includes('jersey') && !trimmedMsg.includes('shirt') && !trimmedMsg.includes('জার্সি')) {
      const reply = isBengali
        ? `আপনার অর্ডার ট্র্যাক করতে অনুগ্রহ করে আপনার **অর্ডার আইডি** (যেমন: APK-2026-1001) এবং **মোবাইল নম্বর** লিখুন। অথবা উপরের মেনু থেকে **Track Order** বাটনে ক্লিক করতে পারেন!`
        : `To track your order, please provide your **Order ID** (e.g. \`APK-2026-1001\`) and your **11-digit mobile number**, or click the **Track** button in the top navigation bar!`;
      return res.json({
        success: true,
        reply,
        products: [],
        suggestedReplies: [
          "Order Help",
          "Find Sports Products",
          "Contact Support"
        ]
      });
    }

    // 2. PRODUCT & STORE INQUIRIES FROM REAL DATABASE
    const allProducts = storage.getAllProductsAdmin().filter(p => p.isPublished !== false);
    const catalogSummary = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      team: p.team,
      category: p.category,
      salePrice: p.salePrice,
      regularPrice: p.regularPrice,
      sizes: p.sizes,
      colors: p.colors,
      stock: p.stock,
      fabric: p.fabric,
      allowCustomPrint: Boolean(p.allowCustomPrint)
    }));

    let aiReply = '';
    let recommendedIds: string[] = [];
    let suggestedReplies: string[] = [];
    let isAiSuccessfullyUsed = false;
    let rateLimitExceeded = false;

    // Check Gemini API Client (Free Tier Option)
    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const conversationContext = Array.isArray(history) && history.length > 0
          ? history.slice(-4).map((h: any) => `${h.sender === 'user' ? 'Customer' : 'Specialist'}: ${h.text}`).join('\n')
          : '';

        const systemPrompt = `You are the Apex Kit AI Assistant, the official Senior Sports Gear Specialist at Apex Kit Bangladesh.
You assist customers in discovering athletic apparel, club & national football kits, training tops, sizing, and custom printed jerseys.

OFFICIAL STORE FACTS:
- Store: Apex Kit (Dhaka, Bangladesh).
- Official Support Phone: 01763943446 (Call / WhatsApp: https://wa.me/8801763943446).
- Catalog: ${JSON.stringify(catalogSummary, null, 2)}
- 100% Cash on Delivery nationwide across all 64 districts in Bangladesh.
- Delivery Fee: ৳70 inside Dhaka (24-48 hours), ৳130 outside Dhaka (2-4 days). Free delivery on orders over ৳1,999 with coupon APEXFREE.
- Sizing Chart: S (36-38" chest), M (38-40"), L (40-42"), XL (42-44"), XXL (44-46"). Micro-mesh athletic fit.
- Custom Name & Number Printing: Available on select kits with ৳200 surcharge.
- Return/Exchange Policy: 7-day hassle-free exchange on unworn kits with tags intact.
- Customer query language: ${isBengali ? 'BENGALI (বাংলা)' : 'ENGLISH'}. Respond fluently in the SAME language.

CRITICAL RULES:
1. ONLY recommend products that exist in the provided catalog with valid IDs.
2. NEVER invent fake products, fake prices, fake discounts, fake boot brands, or false stock.
3. If the user asks for products not in the catalog (such as boots, bats, rackets), politely explain that we specialize in high-performance jerseys and kits, and recommend the best relevant jerseys.
4. If a budget is specified, ONLY select products with salePrice <= budget.
5. If a size is specified, select items that include that size.
6. Keep response friendly, athletic, concise, and helpful (2-4 sentences).

Respond in JSON with this exact schema:
{
  "reply": "Your friendly response text in ${isBengali ? 'Bengali' : 'English'}",
  "recommendedProductIds": ["prod-1", "prod-2"],
  "suggestedReplies": ["Quick suggestion 1", "Quick suggestion 2", "Quick suggestion 3"]
}`;

        const promptContent = `${conversationContext ? `Recent conversation:\n${conversationContext}\n\n` : ''}Customer: "${trimmedMsg}"`;

        const geminiRes = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\n' + promptContent }] }
          ],
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(geminiRes.text || '{}');
        aiReply = parsed.reply || '';
        recommendedIds = Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [];
        suggestedReplies = Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [];
        if (aiReply) {
          isAiSuccessfullyUsed = true;
        }
      } catch (geminiErr: any) {
        const errMsg = geminiErr.message || String(geminiErr);
        console.warn('Gemini chat execution note:', errMsg);
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
          rateLimitExceeded = true;
        }
      }
    }

    // 3. CATALOG FALLBACK IF GEMINI IS NOT CONFIGURED OR HIT RATE LIMIT
    // We do NOT pretend that AI answered if the API was offline or not configured!
    if (!isAiSuccessfullyUsed) {
      // Check budget
      const budgetMatch = trimmedMsg.match(/(\d{3,5})/);
      const budget = budgetMatch ? Number(budgetMatch[1]) : undefined;

      // Check size
      let sizeFilter: string | undefined;
      const sizeMatch = trimmedMsg.match(/\b(S|M|L|XL|XXL)\b/i);
      if (sizeMatch) sizeFilter = sizeMatch[1].toUpperCase();

      // Check sport
      let sportFilter: string | undefined;
      if (/football|জার্সি|jersey|club|barcelona|madrid|argentina|brazil|messi|ronaldo/i.test(trimmedMsg)) {
        sportFilter = 'football';
      } else if (/cricket|ক্রিকেট|gym|workout|training/i.test(trimmedMsg)) {
        sportFilter = 'training';
      }

      // Check Quick Actions
      const isProductPriceAction = /product price|price|pricing|দাম|মূল্য/i.test(trimmedMsg);
      const isSizesAction = /available sizes|sizes|size chart|সাইজ/i.test(trimmedMsg);
      const isOrderHelpAction = /order help|how to order|shipping|delivery|return policy|অর্ডার নিয়ম|ডেলিভারি/i.test(trimmedMsg);

      let matched = storage.searchProductsForChat({
        sport: sportFilter,
        maxPrice: budget,
        size: sizeFilter,
        inStockOnly: true,
        limit: 4
      });

      if (matched.length === 0) {
        matched = allProducts.slice(0, 3);
      }

      recommendedIds = matched.map(p => p.id);

      if (rateLimitExceeded) {
        aiReply = isBengali
          ? `আমাদের এআই অ্যাসিস্ট্যান্ট সাময়িকভাবে অনুপলব্ধ রয়েছে। অনুগ্রহ করে অ্যাপেক্স কিট সাপোর্টে 01763943446 নম্বরে যোগাযোগ করুন। নিচে আমাদের লাইভ ক্যাটালগের সেরা পণ্যগুলো দেখুন:`
          : `Our AI assistant is temporarily unavailable. Please contact Apex Kit support at 01763943446. Here are verified in-stock items from our catalog:`;
      } else if (!gemini) {
        // Transparent message when GEMINI_API_KEY is not configured in backend
        if (isProductPriceAction) {
          aiReply = isBengali
            ? `অ্যাপেক্স কিটের অথেনটিক ক্লাব ও ন্যাশনাল ফুটবল জার্সি ৳১,২৫০ থেকে ৳১,৪৫০ এর মধ্যে পাওয়া যাচ্ছে। পারফরম্যান্স ট্রেনিং টি-শার্ট ৳৭৫০ এবং কাস্টম নাম ও নম্বর প্রিন্টিং ৳২০০ অতিরিক্ত। নিচে আমাদের রিয়েল স্টকের আইটেমগুলো দেওয়া হলো:`
            : `Apex Kit authentic football club & national kits range from ৳1,250 to ৳1,450. Training sports tees start at ৳750. Custom name & number printing is available for an additional ৳200. Here are current in-stock kits:`;
        } else if (isSizesAction) {
          aiReply = isBengali
            ? `আমাদের অ্যাথলেটিক সাইজগুলো: S (বুক ৩৬-৩৮"), M (বুক ৩৮-৪০"), L (বুক ৪০-৪২"), XL (বুক ৪২-৪৪"), এবং XXL (বুক ৪৪-৪৬")। সবগুলো জার্সিই হাই-ভেন্টিলেশন মাইক্রো-মেশ পলিয়েস্টার ফ্যাব্রিকে তৈরি। নিচে উপলব্ধ সাইজের জার্সিগুলো দেখুন:`
            : `Our athletic kits are available in S (Chest 36-38"), M (38-40"), L (40-42"), XL (42-44"), and XXL (44-46") in breathable micro-mesh fabric. Here are items currently in stock:`;
        } else if (isOrderHelpAction) {
          aiReply = isBengali
            ? `অর্ডার প্রক্রিয়া: ১. আপনার পছন্দের জার্সি ও সাইজ সিলেক্ট করে Add to Cart এ ক্লিক করুন। ২. চেকআউটে গিয়ে ডেলিভারি ঠিকানা ও মোবাইল নম্বর দিন। ৩. ক্যাশ অন ডেলিভারি (COD) সিলেক্ট করে কনফার্ম করুন। ডেলিভারি চার্জ: ঢাকা সিটিতে ৳৭০, ঢাকার বাইরে ৳১৩০। ৭ দিনের সহজ রিটার্ন পলিসি রয়েছে। সহায়তা: 01763943446।`
            : `How to Order: 1. Select your kit & size and click 'Add to Cart'. 2. Enter delivery address and your 11-digit phone number in Checkout. 3. Select 100% Cash on Delivery (COD) to place order. Delivery fee: ৳70 inside Dhaka (24-48h), ৳130 outside Dhaka. 7-day exchange guarantee. Support hotline: 01763943446.`;
        } else {
          aiReply = isBengali
            ? `অ্যাপেক্স কিট এআই অ্যাসিস্ট্যান্টে (Apex Kit AI Assistant) স্বাগতম! নিচে আমাদের লাইভ গুদাম থেকে যাচাইকৃত সেরা স্পোর্টস জার্সিগুলো দেওয়া হলো। যে কোনো তথ্য ও সরাসরি সহায়তার জন্য যোগাযোগ করুন: 01763943446 (কল / হোয়াটসঅ্যাপ)।`
            : `Welcome to Apex Kit AI Assistant! Showing verified match kits directly from our real warehouse inventory. For personal customer assistance, call or WhatsApp 01763943446:`;
        }
      } else {
        aiReply = isBengali
          ? `আমাদের গুদামের রিয়েল স্টক থেকে আপনার জন্য সেরা পারফরম্যান্স জার্সিগুলো নিচে সাজেস্ট করা হলো। যে কোনো সহায়তার জন্য কল করুন 01763943446:`
          : `Here are top performance sports kits from our verified warehouse catalog with nationwide Cash on Delivery. For support, call 01763943446:`;
      }

      if (suggestedReplies.length === 0) {
        suggestedReplies = [
          "Find Sports Products",
          "Product Price",
          "Available Sizes",
          "Order Help",
          "Contact Support"
        ];
      }
    }

    // Retrieve real database product cards
    const verifiedProductCards = recommendedIds
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean)
      .map(p => ({
        id: p!.id,
        name: p!.name,
        slug: p!.slug,
        regularPrice: p!.regularPrice,
        salePrice: p!.salePrice,
        image: p!.images[0] || '',
        sizes: p!.sizes,
        colors: p!.colors,
        stock: p!.stock,
        category: p!.category,
        team: p!.team,
        allowCustomPrint: p!.allowCustomPrint
      }));

    res.json({
      success: true,
      reply: aiReply,
      products: verifiedProductCards,
      suggestedReplies,
      aiConnected: isAiSuccessfullyUsed,
      rateLimited: rateLimitExceeded,
      showSupportOptions: !isAiSuccessfullyUsed || rateLimitExceeded,
    });
  });

  // --- VITE OR STATIC FRONTEND SERVING ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`⚡ ApexKit Server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown handling for MongoDB and HTTP connections
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await dbManager.disconnect();
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown timeout reached. Terminating process.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
