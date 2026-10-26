import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { AnnouncementBar } from './components/AnnouncementBar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { CategoryShowcase } from './components/CategoryShowcase.tsx';
import { ProductGrid } from './components/ProductGrid.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { WishlistDrawer } from './components/WishlistDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.tsx';
import { WhyChooseUs } from './components/WhyChooseUs.tsx';
import { NewsletterSection } from './components/NewsletterSection.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { FacebookCommunitySection } from './components/FacebookCommunitySection.tsx';
import { FacebookShareModal } from './components/FacebookShareModal.tsx';
import { JerseyStudioModal } from './components/JerseyStudioModal.tsx';
import { SportsMatchCenterModal } from './components/SportsMatchCenterModal.tsx';
import { FanZoneModal } from './components/FanZoneModal.tsx';
import { AIAssistantModal } from './components/AIAssistantModal.tsx';
import { TournamentCenterModal } from './components/TournamentCenterModal.tsx';
import { GearFinderModal } from './components/GearFinderModal.tsx';
import { LoyaltyModal } from './components/LoyaltyModal.tsx';
import { MatchRemindersModal } from './components/MatchRemindersModal.tsx';
import { TeamMerchandiseModal } from './components/TeamMerchandiseModal.tsx';
import { AboutPage } from './components/AboutPage.tsx';
import { LiveSportsPage } from './components/LiveSportsPage.tsx';
import { AIChatWidget } from './components/AIChatWidget.tsx';
import { GoogleDriveModal } from './components/GoogleDriveModal.tsx';
import { ConsentBanner } from './components/ConsentBanner.tsx';
import { api } from './services/api.ts';
import { tracking } from './services/tracking.ts';
import type { Product, Order, StoreSettings, ProductCategory, SportType } from './types/index.ts';

function StorefrontContent() {
  const { setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Core Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackInitialData, setTrackInitialData] = useState<{ orderNumber?: string; phone?: string }>({});
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);

  // Sports & Facebook Features state
  const [isJerseyStudioOpen, setIsJerseyStudioOpen] = useState(false);
  const [isMatchCenterOpen, setIsMatchCenterOpen] = useState(false);
  const [isFanZoneOpen, setIsFanZoneOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isTournamentsOpen, setIsTournamentsOpen] = useState(false);
  const [isGearFinderOpen, setIsGearFinderOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [reminderData, setReminderData] = useState<{ team?: string; sport?: SportType }>({});
  const [isTeamMerchOpen, setIsTeamMerchOpen] = useState(false);
  const [facebookShareProduct, setFacebookShareProduct] = useState<Product | null>(null);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  // Page Routing State ('store' | 'about' | 'live-sports')
  const [currentPage, setCurrentPage] = useState<'store' | 'about' | 'live-sports'>('store');

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await api.getProducts({ limit: 50 });
      setProducts(data.products);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const settings = await api.getSettings();
      setStoreSettings(settings);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    tracking.init();

    // Check URL route on load & on popstate / hashchange
    const checkRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#live-sports' || path === '/live-sports') {
        setCurrentPage('live-sports');
      } else if (hash === '#about' || path === '/about') {
        setCurrentPage('about');
      } else {
        setCurrentPage('store');
      }
      try {
        tracking.trackPageView(path + (hash || ''), document.title);
      } catch {
        // Non-blocking
      }
    };
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  const handleSelectCategory = (category: string) => {
    setCurrentPage('store');
    if (window.location.hash === '#about' || window.location.hash === '#live-sports') {
      window.location.hash = '';
    }
    setSelectedCategory(category);
    setTimeout(() => {
      const element = document.getElementById('shop-catalog');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleGoHome = () => {
    setCurrentPage('store');
    if (window.location.hash === '#about' || window.location.hash === '#live-sports') {
      window.location.hash = '';
    }
    setSelectedCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAbout = () => {
    setCurrentPage('about');
    window.location.hash = 'about';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLiveSports = () => {
    setCurrentPage('live-sports');
    window.location.hash = 'live-sports';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSearch = () => {
    setCurrentPage('store');
    setTimeout(() => {
      const element = document.getElementById('shop-catalog');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        const searchInput = element.querySelector('input');
        if (searchInput) searchInput.focus();
      }
    }, 50);
  };

  const handleOrderPlaced = (order: Order) => {
    setPlacedOrder(order);
    setIsOrderSuccessOpen(true);
    try {
      tracking.trackPurchase(order);
    } catch {
      // Non-blocking tracking
    }
    fetchProducts(); // Refresh products to reflect updated inventory stock
  };

  const handleOpenTrackWithDetails = (orderNumber: string, phone: string) => {
    setTrackInitialData({ orderNumber, phone });
    setIsTrackOrderOpen(true);
  };

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      try {
        tracking.trackViewItem(product);
      } catch {
        // Non-blocking tracking
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      
      {/* 1. Announcement Bar */}
      {storeSettings?.announcementActive !== false && (
        <AnnouncementBar message={storeSettings?.announcementText} />
      )}

      {/* 2. Top Bar Navigation with Sports Hub Links */}
      <Navbar
        onOpenSearch={handleOpenSearch}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onGoHome={handleGoHome}
        onOpenJerseyStudio={() => setIsJerseyStudioOpen(true)}
        onOpenMatchCenter={() => setIsMatchCenterOpen(true)}
        onOpenFanZone={() => setIsFanZoneOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenTournaments={() => setIsTournamentsOpen(true)}
        onOpenGearFinder={() => setIsGearFinderOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        onOpenAbout={handleOpenAbout}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        onOpenLiveSports={handleOpenLiveSports}
        currentPage={currentPage}
      />

      {/* 3. Main Storefront, About Us, or Live Sports Content */}
      <main className="flex-1">
        {currentPage === 'about' ? (
          <AboutPage
            onShopNow={() => {
              handleGoHome();
              setTimeout(() => {
                const element = document.getElementById('shop-catalog');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onOpenJerseyStudio={() => setIsJerseyStudioOpen(true)}
          />
        ) : currentPage === 'live-sports' ? (
          <LiveSportsPage
            onShopCategory={handleSelectCategory}
            onOpenJerseyStudio={() => setIsJerseyStudioOpen(true)}
          />
        ) : (
          <>
            {/* Hero Section */}
            <HeroSection
              onShopNow={() => handleSelectCategory('all')}
              onCustomJerseys={() => setIsJerseyStudioOpen(true)}
              onOpenJerseyStudio={() => setIsJerseyStudioOpen(true)}
            />

            {/* Featured Collections Showcase */}
            <CategoryShowcase
              onSelectCategory={(cat: ProductCategory) => handleSelectCategory(cat)}
            />

            {/* Interactive Filterable Catalog */}
            <ProductGrid
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectProduct={(p) => handleSelectProduct(p)}
              onShareFacebook={(p) => setFacebookShareProduct(p)}
              isLoading={isLoadingProducts}
            />

            {/* Feature 1: Official Facebook Page Hub Section */}
            <FacebookCommunitySection />

            {/* Value Propositions / Why Choose Us */}
            <WhyChooseUs />

            {/* Newsletter Discount Reward */}
            <NewsletterSection />
          </>
        )}
      </main>

      {/* 4. Professional Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenJerseyStudio={() => setIsJerseyStudioOpen(true)}
        onOpenMatchCenter={() => setIsMatchCenterOpen(true)}
        onOpenFanZone={() => setIsFanZoneOpen(true)}
        onOpenTournaments={() => setIsTournamentsOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        onOpenGearFinder={() => setIsGearFinderOpen(true)}
        onOpenAbout={handleOpenAbout}
        onOpenLiveSports={handleOpenLiveSports}
      />

      {/* 5. Core E-commerce Modals & Drawers */}
      
      {/* Product Details Modal (PDP) */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onOpenCheckoutDirect={() => setIsCheckoutOpen(true)}
        onSelectRelatedProduct={(p) => handleSelectProduct(p)}
        allProducts={products}
        onOpenShareFacebook={(p) => setFacebookShareProduct(p)}
        onOpenCustomStudio={() => setIsJerseyStudioOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreProducts={() => handleSelectCategory('all')}
      />

      {/* Dedicated Wishlist Drawer */}
      <WishlistDrawer
        onSelectProduct={(p) => handleSelectProduct(p)}
        onExploreProducts={() => handleSelectCategory('all')}
      />

      {/* Checkout Modal (Cash on Delivery) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Order Confirmed Success Screen */}
      <OrderSuccessModal
        order={placedOrder}
        isOpen={isOrderSuccessOpen}
        onClose={() => setIsOrderSuccessOpen(false)}
        onTrackOrder={handleOpenTrackWithDetails}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
      />

      {/* Guest Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackOrderOpen}
        onClose={() => {
          setIsTrackOrderOpen(false);
          setTrackInitialData({});
        }}
        initialOrderNumber={trackInitialData.orderNumber}
        initialPhone={trackInitialData.phone}
      />

      {/* Protected Admin Dashboard Portal */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => setIsAdminOpen(false)}
          onRefreshPublicProducts={fetchProducts}
        />
      )}

      {/* 6. Advanced Sports Features & Integrations */}

      {/* Feature 3: Jersey Customization Studio */}
      <JerseyStudioModal
        isOpen={isJerseyStudioOpen}
        onClose={() => setIsJerseyStudioOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Feature 2: Sports Match Center */}
      <SportsMatchCenterModal
        isOpen={isMatchCenterOpen}
        onClose={() => setIsMatchCenterOpen(false)}
        onOpenReminderModal={(teamName, sport) => {
          setReminderData({ team: teamName, sport });
          setIsRemindersOpen(true);
        }}
      />

      {/* Feature 5: Fan Zone Quizzes & Prediction Polls */}
      <FanZoneModal
        isOpen={isFanZoneOpen}
        onClose={() => setIsFanZoneOpen(false)}
        onOpenLoyaltyModal={() => setIsLoyaltyOpen(true)}
      />

      {/* Feature 4: AI Sports Shopping Assistant */}
      <AIAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onSelectProduct={(p) => {
          setIsAiAssistantOpen(false);
          handleSelectProduct(p);
        }}
      />

      {/* Feature 6: Sports Tournament Center */}
      <TournamentCenterModal
        isOpen={isTournamentsOpen}
        onClose={() => setIsTournamentsOpen(false)}
      />

      {/* Feature 7: Smart Sports Gear Finder */}
      <GearFinderModal
        isOpen={isGearFinderOpen}
        onClose={() => setIsGearFinderOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setIsGearFinderOpen(false);
          handleSelectProduct(p);
        }}
      />

      {/* Feature 10: Loyalty & Fan Points Program */}
      <LoyaltyModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Feature 8: Match Reminders Notifications */}
      <MatchRemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        initialTeam={reminderData.team}
        initialSport={reminderData.sport}
      />

      {/* Feature 9: Team Merchandise Hub */}
      <TeamMerchandiseModal
        isOpen={isTeamMerchOpen}
        onClose={() => setIsTeamMerchOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setIsTeamMerchOpen(false);
          handleSelectProduct(p);
        }}
      />

      {/* Feature 1: Facebook Share Modal */}
      <FacebookShareModal
        isOpen={Boolean(facebookShareProduct)}
        onClose={() => setFacebookShareProduct(null)}
        product={facebookShareProduct}
      />

      {/* Feature: Modern Floating AI Shopping Chat System */}
      <AIChatWidget
        onSelectProduct={(p) => handleSelectProduct(p)}
        onOpenTrackOrder={(orderNumber, phone) => {
          setTrackInitialData({ orderNumber, phone });
          setIsTrackOrderOpen(true);
        }}
        onOpenJerseyStudio={() => setIsJerseyStudioOpen(true)}
      />

      {/* Google Drive Storage Hub Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        recentOrders={placedOrder ? [placedOrder] : []}
      />

      {/* Privacy & Cookie Consent Banner */}
      <ConsentBanner />

    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <StorefrontContent />
      </WishlistProvider>
    </CartProvider>
  );
}
