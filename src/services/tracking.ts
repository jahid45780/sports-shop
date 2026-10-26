/**
 * Apex Kit — Enterprise Ads & E-Commerce Tracking Engine
 * Supports Meta Pixel (fbq), Google Analytics 4 (gtag), Google Ads Conversion Tracking, and GTM.
 * Enforces strict event deduplication, user privacy consent compliance, and zero fake reports.
 */

import { api } from './api.ts';
import type { 
  MarketingIntegrationConfig, 
  Product, 
  Order, 
  UserTrackingConsent 
} from '../types/index.ts';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const CONSENT_STORAGE_KEY = 'apex_tracking_consent';

export class TrackingEngine {
  private static instance: TrackingEngine;
  private config: MarketingIntegrationConfig | null = null;
  private isInitialized = false;
  private firedEvents = new Set<string>();
  private completedPurchases = new Set<string>();
  private consent: UserTrackingConsent = {
    essential: true,
    analytics: false,
    marketing: false,
    decided: false,
    updatedAt: new Date().toISOString()
  };

  private constructor() {
    this.loadConsentFromStorage();
  }

  public static getInstance(): TrackingEngine {
    if (!TrackingEngine.instance) {
      TrackingEngine.instance = new TrackingEngine();
    }
    return TrackingEngine.instance;
  }

  /**
   * Load stored consent preferences from browser storage
   */
  private loadConsentFromStorage(): void {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.consent = {
          essential: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          decided: Boolean(parsed.decided),
          updatedAt: parsed.updatedAt || new Date().toISOString()
        };
      }
    } catch {
      // Fallback to default
    }
  }

  /**
   * Save and apply updated user consent preferences
   */
  public updateConsent(newConsent: Partial<UserTrackingConsent>): UserTrackingConsent {
    this.consent = {
      ...this.consent,
      ...newConsent,
      essential: true,
      decided: true,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(this.consent));
    } catch (e) {
      console.warn('Failed to persist consent to localStorage:', e);
    }

    // Re-evaluate script injection based on new consent
    this.applyTrackingScripts();

    // Log consent choice to audit log
    api.sendClientTrackingLog({
      source: 'consent',
      eventName: 'consent_updated',
      status: 'info',
      message: `User consent updated: Analytics=${this.consent.analytics}, Marketing=${this.consent.marketing}`,
      payload: { ...this.consent }
    });

    return { ...this.consent };
  }

  public getConsent(): UserTrackingConsent {
    return { ...this.consent };
  }

  /**
   * Initialize Tracking with store configuration from server
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.config = await api.getPublicTrackingConfig();
      this.isInitialized = true;
      this.applyTrackingScripts();
    } catch (err) {
      console.warn('Could not initialize Apex Kit tracking engine:', err);
    }
  }

  /**
   * Dynamically inject authorized tracking scripts based on user consent and store configuration
   */
  public applyTrackingScripts(): void {
    if (!this.config || typeof window === 'undefined') return;

    const { metaPixel, googleAds, ga4, gtm } = this.config;

    // 1. Google Tag Manager (GTM)
    if (gtm.enabled && gtm.containerId && (this.consent.analytics || this.consent.marketing)) {
      this.injectGtm(gtm.containerId);
    }

    // 2. Google Analytics 4 (GA4)
    if (ga4.enabled && ga4.measurementId && this.consent.analytics) {
      this.injectGtag(ga4.measurementId, {
        debug_mode: Boolean(ga4.debugMode),
        send_page_view: false // We control page_view explicitly to avoid duplicates
      });
    }

    // 3. Google Ads Conversion Tracking
    if (googleAds.enabled && googleAds.conversionId && this.consent.marketing) {
      this.injectGtag(googleAds.conversionId, {});
    }

    // 4. Meta Pixel (Facebook)
    if (metaPixel.enabled && metaPixel.pixelId && this.consent.marketing) {
      this.injectMetaPixel(metaPixel.pixelId, metaPixel.testEventCode);
    }
  }

  /**
   * Inject official Meta Pixel script safely
   */
  private injectMetaPixel(pixelId: string, testEventCode?: string): void {
    if (document.getElementById('meta-pixel-script')) return;

    try {
      /* eslint-disable */
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.id = 'meta-pixel-script';
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */

      if (window.fbq) {
        window.fbq('init', pixelId);
        if (testEventCode && testEventCode.trim()) {
          window.fbq('set', 'testEventCode', testEventCode.trim());
        }
      }
    } catch (err) {
      console.warn('Meta Pixel injection notice:', err);
    }
  }

  /**
   * Inject official Google gtag.js loader safely
   */
  private injectGtag(targetId: string, configOptions: Record<string, any> = {}): void {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function() {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
    }

    const scriptId = `gtag-script-${targetId}`;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(targetId)}`;
      document.head.appendChild(script);
    }

    window.gtag('config', targetId, configOptions);
  }

  /**
   * Inject Google Tag Manager snippet safely without innerHTML eval
   */
  private injectGtm(containerId: string): void {
    if (document.getElementById('gtm-script')) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
    document.head.appendChild(script);
  }

  /**
   * Helper to check if a specific conversion event is enabled for a platform
   */
  private isEventEnabled(
    eventId: 'view_item' | 'search' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'lead',
    platform: 'meta' | 'ga4' | 'google_ads'
  ): boolean {
    if (!this.config) return false;
    const eventSetting = this.config.conversionEvents?.find(e => e.id === eventId);
    if (!eventSetting) return true; // Default fallback to true

    if (platform === 'meta') return eventSetting.metaEnabled && this.config.metaPixel.enabled;
    if (platform === 'ga4') return eventSetting.ga4Enabled && this.config.ga4.enabled;
    if (platform === 'google_ads') return eventSetting.googleAdsEnabled && this.config.googleAds.enabled;
    return false;
  }

  // ================= E-COMMERCE CONVERSION EVENT DISPATCHERS =================

  /**
   * Track Page View
   */
  public trackPageView(pagePath: string = window.location.pathname, title: string = document.title): void {
    if (!this.config) return;

    // GA4 Page View
    if (this.config.ga4.enabled && this.consent.analytics && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: title
      });
    }

    // Meta Pixel PageView
    if (this.config.metaPixel.enabled && this.config.metaPixel.trackPageView && this.consent.marketing && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }

  /**
   * Track Product Details View (ViewContent / view_item / Product View)
   */
  public trackViewItem(product: Product): void {
    if (!this.config || !product) return;

    const dedupeKey = `view_item_${product.id}`;
    if (this.firedEvents.has(dedupeKey)) return;
    this.firedEvents.add(dedupeKey);
    setTimeout(() => this.firedEvents.delete(dedupeKey), 2000); // 2s debounce

    const currency = this.config.currency || 'BDT';
    const value = product.salePrice;

    // GA4: view_item
    if (this.isEventEnabled('view_item', 'ga4') && this.consent.analytics && window.gtag) {
      window.gtag('event', 'view_item', {
        currency,
        value,
        items: [
          {
            item_id: product.sku || product.id,
            item_name: product.name,
            item_category: product.category,
            item_brand: product.team,
            price: product.salePrice
          }
        ]
      });
    }

    // Meta Pixel: ViewContent
    if (this.isEventEnabled('view_item', 'meta') && this.config.metaPixel.trackViewContent && this.consent.marketing && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_category: product.category,
        content_ids: [product.sku || product.id],
        content_type: 'product',
        value,
        currency
      });
    }

    // Google Ads: Product View
    if (this.isEventEnabled('view_item', 'google_ads') && this.consent.marketing && window.gtag && this.config.googleAds.productViewConversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${this.config.googleAds.conversionId}/${this.config.googleAds.productViewConversionLabel}`,
        value,
        currency
      });
    }
  }

  /**
   * Track Catalog Search (Search / search)
   */
  public trackSearch(searchQuery: string, resultsCount: number = 0): void {
    if (!this.config || !searchQuery.trim()) return;

    const q = searchQuery.trim();
    const dedupeKey = `search_${q.toLowerCase()}`;
    if (this.firedEvents.has(dedupeKey)) return;
    this.firedEvents.add(dedupeKey);
    setTimeout(() => this.firedEvents.delete(dedupeKey), 4000);

    // GA4: search
    if (this.isEventEnabled('search', 'ga4') && this.consent.analytics && window.gtag) {
      window.gtag('event', 'search', {
        search_term: q,
        results_count: resultsCount
      });
    }

    // Meta Pixel: Search
    if (this.isEventEnabled('search', 'meta') && this.config.metaPixel.trackSearch && this.consent.marketing && window.fbq) {
      window.fbq('track', 'Search', {
        search_string: q,
        content_category: 'Sports Jerseys'
      });
    }
  }

  /**
   * Track Add To Cart (AddToCart / add_to_cart)
   */
  public trackAddToCart(
    product: Product, 
    quantity: number = 1, 
    size?: string, 
    color?: string
  ): void {
    if (!this.config || !product) return;

    const currency = this.config.currency || 'BDT';
    const value = product.salePrice * quantity;

    // GA4: add_to_cart
    if (this.isEventEnabled('add_to_cart', 'ga4') && this.consent.analytics && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency,
        value,
        items: [
          {
            item_id: product.sku || product.id,
            item_name: product.name,
            item_category: product.category,
            item_brand: product.team,
            item_variant: size || color ? `${size || ''} ${color || ''}`.trim() : undefined,
            price: product.salePrice,
            quantity
          }
        ]
      });
    }

    // Meta Pixel: AddToCart
    if (this.isEventEnabled('add_to_cart', 'meta') && this.config.metaPixel.trackAddToCart && this.consent.marketing && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_category: product.category,
        content_ids: [product.sku || product.id],
        content_type: 'product',
        value,
        currency,
        num_items: quantity
      });
    }

    // Google Ads: Add to Cart Conversion
    if (this.isEventEnabled('add_to_cart', 'google_ads') && this.consent.marketing && window.gtag && this.config.googleAds.addToCartConversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${this.config.googleAds.conversionId}/${this.config.googleAds.addToCartConversionLabel}`,
        value,
        currency
      });
    }
  }

  /**
   * Track Checkout Begun (InitiateCheckout / begin_checkout)
   */
  public trackBeginCheckout(items: any[], subtotal: number): void {
    if (!this.config || items.length === 0) return;

    const dedupeKey = `begin_checkout_${items.length}_${subtotal}`;
    if (this.firedEvents.has(dedupeKey)) return;
    this.firedEvents.add(dedupeKey);
    setTimeout(() => this.firedEvents.delete(dedupeKey), 5000);

    const currency = this.config.currency || 'BDT';

    // GA4: begin_checkout
    if (this.isEventEnabled('begin_checkout', 'ga4') && this.consent.analytics && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency,
        value: subtotal,
        items: items.map(i => ({
          item_id: i.productId || i.sku,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity
        }))
      });
    }

    // Meta Pixel: InitiateCheckout
    if (this.isEventEnabled('begin_checkout', 'meta') && this.config.metaPixel.trackInitiateCheckout && this.consent.marketing && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_category: 'Sports Apparel Checkout',
        content_ids: items.map(i => i.productId || i.sku),
        num_items: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        value: subtotal,
        currency
      });
    }

    // Google Ads: Begin Checkout Conversion
    if (this.isEventEnabled('begin_checkout', 'google_ads') && this.consent.marketing && window.gtag && this.config.googleAds.beginCheckoutConversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${this.config.googleAds.conversionId}/${this.config.googleAds.beginCheckoutConversionLabel}`,
        value: subtotal,
        currency
      });
    }
  }

  /**
   * Track Purchase Event (Purchase / purchase)
   * CRITICAL REQUIREMENT:
   * - Fires ONLY after genuine order completion.
   * - Uses unique orderNumber as transaction_id to prevent duplicate conversions on refreshes or re-renders.
   */
  public trackPurchase(order: Order): void {
    if (!this.config || !order || !order.orderNumber) return;

    // Deduplication check: Has this orderNumber already fired a purchase event in this session?
    const dedupeKey = `purchase_${order.orderNumber}`;
    if (this.completedPurchases.has(dedupeKey)) {
      console.warn(`[Apex Kit Tracking] Blocked duplicate purchase event for order ${order.orderNumber}`);
      return;
    }
    this.completedPurchases.add(dedupeKey);

    const currency = this.config.currency || 'BDT';
    const value = order.total;

    // 1. GA4: purchase event
    if (this.isEventEnabled('purchase', 'ga4') && this.consent.analytics && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.orderNumber,
        value,
        currency,
        shipping: order.deliveryFee || 0,
        coupon: order.couponCode || undefined,
        items: order.items.map(item => ({
          item_id: item.sku || item.productId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_variant: `${item.size} ${item.color}`
        }))
      });
    }

    // 2. Meta Pixel: Purchase event
    if (this.isEventEnabled('purchase', 'meta') && this.config.metaPixel.trackPurchase && this.consent.marketing && window.fbq) {
      window.fbq('track', 'Purchase', {
        content_type: 'product',
        content_ids: order.items.map(i => i.sku || i.productId),
        num_items: order.items.reduce((acc, curr) => acc + curr.quantity, 0),
        value,
        currency,
        order_id: order.orderNumber
      });
    }

    // 3. Google Ads: Purchase conversion with unique transaction_id for deduplication
    if (this.isEventEnabled('purchase', 'google_ads') && this.consent.marketing && window.gtag && this.config.googleAds.purchaseConversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${this.config.googleAds.conversionId}/${this.config.googleAds.purchaseConversionLabel}`,
        value,
        currency,
        transaction_id: order.orderNumber
      });
    }

    // Diagnostic client telemetry log
    api.sendClientTrackingLog({
      source: 'system',
      eventName: 'Purchase',
      status: 'success',
      message: `Purchase event tracked for order ${order.orderNumber} (৳${value} COD)`,
      payload: {
        orderNumber: order.orderNumber,
        value,
        currency,
        itemsCount: order.items.length
      }
    });
  }

  /**
   * Track Lead or Contact Event (Lead / generate_lead)
   */
  public trackLead(leadType: 'newsletter' | 'match_reminder' | 'support_inquiry', details?: Record<string, any>): void {
    if (!this.config) return;

    // GA4: generate_lead
    if (this.isEventEnabled('lead', 'ga4') && this.consent.analytics && window.gtag) {
      window.gtag('event', 'generate_lead', {
        lead_type: leadType,
        ...details
      });
    }

    // Meta Pixel: Lead
    if (this.isEventEnabled('lead', 'meta') && this.config.metaPixel.trackLead && this.consent.marketing && window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: leadType,
        content_category: 'Customer Engagement'
      });
    }

    // Google Ads: Lead Conversion
    if (this.isEventEnabled('lead', 'google_ads') && this.consent.marketing && window.gtag && this.config.googleAds.leadConversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${this.config.googleAds.conversionId}/${this.config.googleAds.leadConversionLabel}`
      });
    }
  }
}

export const tracking = TrackingEngine.getInstance();
