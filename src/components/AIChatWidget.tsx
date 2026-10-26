import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  PackageCheck, 
  Trash2, 
  ExternalLink, 
  Phone, 
  MessageCircle,
  HelpCircle,
  Tag,
  Ruler,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import type { 
  ChatMessage, 
  ChatProductCard, 
  ChatSupportDetails, 
  ChatSystemStatus, 
  Product, 
  ProductSize 
} from '../types/index.ts';

interface AIChatWidgetProps {
  onSelectProduct?: (product: Product) => void;
  onOpenTrackOrder?: (orderNumber?: string, phone?: string) => void;
  onOpenJerseyStudio?: () => void;
}

const CHAT_STORAGE_KEY = 'apex_kit_ai_chat_history_v1';

const OFFICIAL_PHONE = '01763943446';
const FORMATTED_PHONE = '01763-943446';
const WHATSAPP_LINK = 'https://wa.me/8801763943446';
const TEL_LINK = 'tel:01763943446';

// 5 Core Quick-Action Buttons as required
const QUICK_ACTIONS = [
  { id: 'action-find-products', label: 'Find Sports Products', icon: Sparkles },
  { id: 'action-product-price', label: 'Product Price', icon: Tag },
  { id: 'action-available-sizes', label: 'Available Sizes', icon: Ruler },
  { id: 'action-order-help', label: 'Order Help', icon: HelpCircle },
  { id: 'action-contact-support', label: 'Contact Support', icon: Phone }
];

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  onSelectProduct,
  onOpenTrackOrder,
  onOpenJerseyStudio
}) => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<ChatSystemStatus | null>(null);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});
  const [selectedSizeMap, setSelectedSizeMap] = useState<Record<string, ProductSize>>({});

  // Initialize messages from localStorage or default welcome
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse chat history:', e);
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: "👋 Welcome to Apex Kit! How can we help you today?\n\nAsk about authentic club football jerseys, available sizes (S to XXL), verified pricing, ordering via Cash on Delivery, or tracking your delivery.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedReplies: [
          "Find Sports Products",
          "Product Price",
          "Available Sizes",
          "Order Help",
          "Contact Support"
        ]
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Fetch AI system status (checks free-tier Google Gemini connectivity without exposing secrets)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await api.getChatStatus();
        if (status) setSystemStatus(status);
      } catch (err) {
        console.warn('Chat status check note:', err);
      }
    };
    fetchStatus();
  }, []);

  // Save messages to localStorage whenever they update
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  }, [messages]);

  // Handle ESC key to close on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('auto');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('smooth');
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Special client-side handling for Contact Support quick button to provide instantaneous response
    if (text === 'Contact Support') {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: 'Contact Support',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const supportReplyMsg: ChatMessage = {
        id: `msg-supp-${Date.now()}`,
        sender: 'assistant',
        text: "Our sports customer support team is available to assist you. Choose your preferred contact option below:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showSupportOptions: true,
        supportDetails: {
          phone: OFFICIAL_PHONE,
          formattedPhone: FORMATTED_PHONE,
          telLink: TEL_LINK,
          whatsAppLink: WHATSAPP_LINK
        },
        suggestedReplies: [
          "Find Sports Products",
          "Product Price",
          "Available Sizes",
          "Order Help"
        ]
      };

      setMessages(prev => [...prev, userMsg, supportReplyMsg]);
      setInputText('');
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = updatedHistory
        .slice(-6)
        .map(m => ({ sender: m.sender, text: m.text }));

      const res = await api.sendChatMessage({
        message: text,
        history: conversationHistory,
        isNewConversation: messages.length <= 1
      });

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: res.reply || 'Here are the details from our sports catalog:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: res.products && res.products.length > 0 ? res.products : undefined,
        orderInfo: res.orderInfo || undefined,
        suggestedReplies: res.suggestedReplies || undefined,
        showSupportOptions: res.showSupportOptions,
        supportDetails: res.supportDetails || {
          phone: OFFICIAL_PHONE,
          formattedPhone: FORMATTED_PHONE,
          telLink: TEL_LINK,
          whatsAppLink: WHATSAPP_LINK
        },
        aiConnected: res.aiConnected,
        rateLimited: res.rateLimited
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `We are currently experiencing a connection issue with the AI shopping service. For immediate assistance with jersey sizes, prices, or orders, please call us directly at ${FORMATTED_PHONE} or reach our team on WhatsApp.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        showSupportOptions: true,
        supportDetails: {
          phone: OFFICIAL_PHONE,
          formattedPhone: FORMATTED_PHONE,
          telLink: TEL_LINK,
          whatsAppLink: WHATSAPP_LINK
        },
        suggestedReplies: ["Find Sports Products", "Product Price", "Contact Support"]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const resetMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'assistant',
      text: "👋 Conversation reset!\n\nWelcome to Apex Kit! How can we help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedReplies: [
        "Find Sports Products",
        "Product Price",
        "Available Sizes",
        "Order Help",
        "Contact Support"
      ]
    };
    setMessages([resetMsg]);
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // Non-blocking
    }
  };

  const handleAddToCartFromCard = (product: ChatProductCard) => {
    const chosenSize = selectedSizeMap[product.id] || product.sizes[0] || 'L';
    const chosenColor = product.colors[0] || 'Official Kit Color';

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      size: chosenSize,
      color: chosenColor,
      price: product.salePrice,
      maxStock: product.stock
    }, 1);

    setAddedItemMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap(prev => ({ ...prev, [product.id]: false }));
    }, 2500);
  };

  const handleViewProduct = (product: ChatProductCard) => {
    if (onSelectProduct) {
      const fullProd: Product = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        team: product.team,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        stock: product.stock,
        sku: `APK-${product.slug.toUpperCase().slice(0, 8)}`,
        sizes: product.sizes,
        colors: product.colors,
        description: `Authentic sports performance jersey crafted with player-issue micro-mesh fabric. Engineered for peak athletic breathability.`,
        fabric: '100% Breathable Dri-FIT Micro-Mesh',
        fitType: 'Athletic Slim Fit',
        rating: 4.9,
        reviewCount: 18,
        images: [product.image],
        isFeatured: true,
        isBestSeller: true,
        isPublished: true,
        allowCustomPrint: product.allowCustomPrint ?? true,
        createdAt: new Date().toISOString()
      };
      onSelectProduct(fullProd);
    }
  };

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-full border border-lime-400/40 shadow-xl shadow-lime-400/10 hover:shadow-lime-400/25 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-400"
            aria-label="Open Apex Kit AI Assistant"
            title="Ask AI or Need Help?"
          >
            {/* Subtle animated glowing icon */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-lime-400/15 border border-lime-400/30 flex items-center justify-center text-lime-400">
                <Bot className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-lime-400 rounded-full border-2 border-zinc-950 animate-pulse" />
            </div>

            {/* Label: Ask AI / Need Help? */}
            <div className="text-left pr-1">
              <div className="text-xs font-black text-white flex items-center gap-1.5 font-display tracking-wider uppercase">
                <span>Ask AI</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-lime-400 text-zinc-950 font-sans font-black">
                  ONLINE
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 leading-none mt-0.5">
                Need Help? · Sports Assistant
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 2. CHAT WINDOW / MODAL */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apex-kit-chat-title"
          className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[430px] max-w-[450px] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 overflow-hidden text-zinc-100 transition-all duration-200 animate-in slide-in-from-bottom-5"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-lime-400/15 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime-400 rounded-full border-2 border-zinc-950 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 id="apex-kit-chat-title" className="text-sm font-bold text-white uppercase font-display tracking-wide">
                    Apex Kit AI Assistant
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-400/10 text-lime-400 font-mono font-bold border border-lime-400/30">
                    {systemStatus?.aiConfigured ? 'Gemini Free' : 'Catalog Mode'}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block" />
                  <span className="font-medium text-zinc-300">How can we help you?</span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Clear Conversation"
                aria-label="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Prominent, highly visible Close (X) button in top-right corner */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white border border-zinc-700 hover:border-lime-400/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-lime-400 shadow-sm cursor-pointer group"
                title="Close chat window (Esc)"
                aria-label="Close AI Chat"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-200 group-hover:text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* User Guidance Banner: Finished chatting caption near header */}
          <div className="px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />
              <span className="truncate font-medium text-zinc-300">Finished chatting? Close this chat anytime.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-lime-400 hover:text-lime-300 hover:underline uppercase tracking-wider shrink-0 flex items-center gap-0.5 ml-2 cursor-pointer"
              title="Close chat window"
            >
              <span>Close</span>
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Support & Delivery Notice Sub-bar */}
          <div className="px-3.5 py-1.5 bg-zinc-900/80 border-b border-zinc-850 text-[10px] text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Support Hotline:</span>
              <a 
                href={TEL_LINK} 
                className="text-lime-400 font-mono font-bold hover:underline"
              >
                {FORMATTED_PHONE}
              </a>
            </span>
            <a 
              href={WHATSAPP_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>WhatsApp</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Quick-Action Buttons (Horizontal Pill Bar) */}
          <div className="px-3.5 py-2 bg-zinc-950 border-b border-zinc-850 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSendMessage(action.label)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-lime-400/40 text-[11px] text-zinc-300 hover:text-lime-400 transition-all whitespace-nowrap shrink-0 flex items-center gap-1 disabled:opacity-50"
                >
                  <Icon className="w-3 h-3 text-lime-400" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 text-xs h-[380px] sm:h-[420px] scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[88%] rounded-2xl p-3 sm:p-3.5 leading-relaxed break-words whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-lime-400 text-zinc-950 font-semibold rounded-tr-sm shadow-md'
                      : msg.isError
                      ? 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-sm'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-zinc-500 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Contact Support Direct Action Card */}
                {msg.showSupportOptions && (
                  <div className="mt-2.5 w-full max-w-[92%] p-3.5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl space-y-3 text-xs shadow-lg">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-lime-400" />
                        <span>Official Customer Support</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                        DIRECT CONTACT
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Option 1: Direct Call */}
                      <a
                        href={msg.supportDetails?.telLink || TEL_LINK}
                        className="w-full p-2.5 bg-zinc-800/80 hover:bg-zinc-800 rounded-xl border border-zinc-700/80 hover:border-lime-400/50 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Call Hotline</div>
                            <div className="text-xs font-bold text-white font-mono group-hover:text-lime-400 transition-colors">
                              {msg.supportDetails?.formattedPhone || FORMATTED_PHONE}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-lime-400 px-2 py-0.5 bg-lime-400/10 rounded">
                          Click to Call
                        </span>
                      </a>

                      {/* Option 2: WhatsApp Chat */}
                      <a
                        href={msg.supportDetails?.whatsAppLink || WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full p-2.5 bg-emerald-950/40 hover:bg-emerald-900/40 rounded-xl border border-emerald-500/30 hover:border-emerald-400/60 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-[10px] text-emerald-300 uppercase font-semibold">WhatsApp Support</div>
                            <div className="text-xs font-bold text-white font-mono group-hover:text-emerald-300 transition-colors">
                              {msg.supportDetails?.formattedPhone || FORMATTED_PHONE}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-emerald-400 px-2 py-0.5 bg-emerald-400/10 rounded flex items-center gap-1">
                          <span>Chat Now</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </a>
                    </div>

                    <p className="text-[10px] text-zinc-400 text-center pt-0.5">
                      Or continue typing your question below to ask the AI assistant.
                    </p>
                  </div>
                )}

                {/* Order Information Card (if applicable) */}
                {msg.orderInfo && (
                  <div className="mt-2.5 w-full max-w-[92%] p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <PackageCheck className="w-4 h-4 text-lime-400" />
                        <span className="font-mono">{msg.orderInfo.orderNumber}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-lime-400/15 text-lime-400 border border-lime-400/30">
                        {msg.orderInfo.orderStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-1">
                      <div>
                        <span className="text-zinc-500 block">Total Amount:</span>
                        <span className="font-bold font-mono text-lime-400">৳{msg.orderInfo.total.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Items Count:</span>
                        <span className="font-medium text-white">{msg.orderInfo.itemsCount} jerseys</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Payment:</span>
                        <span className="text-white font-medium capitalize">Cash on Delivery</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Delivery Zone:</span>
                        <span className="text-white font-medium capitalize">
                          {msg.orderInfo.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                        </span>
                      </div>
                    </div>

                    {onOpenTrackOrder && (
                      <button
                        onClick={() => onOpenTrackOrder(msg.orderInfo?.orderNumber)}
                        className="w-full mt-2 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-white rounded-lg text-center font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                      >
                        <span>View Live Tracking Progress</span>
                        <ChevronRight className="w-3.5 h-3.5 text-lime-400" />
                      </button>
                    )}
                  </div>
                )}

                {/* Product Cards Carousel / Stack */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 w-full space-y-2.5">
                    <div className="text-[11px] font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Verified Sports Products ({msg.products.length})</span>
                    </div>

                    <div className="space-y-2">
                      {msg.products.map((product) => {
                        const currentSize = selectedSizeMap[product.id] || product.sizes[0] || 'L';
                        const isAdded = addedItemMap[product.id];

                        return (
                          <div
                            key={product.id}
                            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors flex gap-3 text-xs"
                          >
                            {/* Product Thumbnail */}
                            <div 
                              onClick={() => handleViewProduct(product)}
                              className="w-20 h-20 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0 overflow-hidden cursor-pointer relative group"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=400&auto=format&fit=crop&q=80';
                                }}
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-semibold text-lime-400 uppercase font-mono truncate">
                                    {product.team}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono ${
                                    product.stock > 0 
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                                      : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                  }`}>
                                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                  </span>
                                </div>

                                <h4 
                                  onClick={() => handleViewProduct(product)}
                                  className="text-xs font-bold text-white truncate cursor-pointer hover:text-lime-400 transition-colors"
                                  title={product.name}
                                >
                                  {product.name}
                                </h4>

                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                  <span className="text-xs font-black font-mono text-lime-400">
                                    ৳{product.salePrice.toLocaleString()}
                                  </span>
                                  {product.regularPrice > product.salePrice && (
                                    <span className="text-[10px] text-zinc-500 line-through font-mono">
                                      ৳{product.regularPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Size Selector & Action Buttons */}
                              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-zinc-800/60">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-zinc-500">Size:</span>
                                  <select
                                    value={currentSize}
                                    onChange={(e) => setSelectedSizeMap(prev => ({ ...prev, [product.id]: e.target.value as ProductSize }))}
                                    className="bg-zinc-950 border border-zinc-800 text-white rounded px-1.5 py-0.5 text-[10px] font-bold"
                                    aria-label={`Select size for ${product.name}`}
                                  >
                                    {product.sizes.map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleViewProduct(product)}
                                    className="px-2 py-1 text-[10px] font-semibold text-zinc-300 hover:text-white bg-zinc-800 rounded transition-colors"
                                    title="View product details modal"
                                  >
                                    View
                                  </button>

                                  <button
                                    onClick={() => handleAddToCartFromCard(product)}
                                    disabled={product.stock <= 0}
                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-all ${
                                      isAdded 
                                        ? 'bg-emerald-400 text-zinc-950 font-black' 
                                        : 'bg-lime-400 hover:bg-lime-300 text-zinc-950 disabled:opacity-50'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Added</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingBag className="w-3 h-3" />
                                        <span>Add</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested Quick Replies */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-1">
                    {msg.suggestedReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(reply)}
                        className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-lime-400/40 text-[11px] text-zinc-300 hover:text-lime-400 transition-colors text-left"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing / Querying Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm w-fit text-xs text-zinc-400">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] font-medium text-zinc-300">Apex Kit Assistant is checking warehouse catalog...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-850 shrink-0">
            {/* Caption near chat input */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 px-0.5">
              <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />
                Finished chatting? Close this chat anytime.
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-zinc-400 hover:text-white hover:underline flex items-center gap-1 font-semibold cursor-pointer py-0.5 px-1 rounded hover:bg-zinc-850 transition-colors"
                title="Close chat window"
                aria-label="Close chat window"
              >
                <span>Close (X)</span>
              </button>
            </div>

            <div className="relative flex items-center gap-2 bg-zinc-900 border border-zinc-800 focus-within:border-lime-400 rounded-xl px-3 py-1.5 transition-colors">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about jerseys, sizes, prices in English or বাংলা..."
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none resize-none max-h-24 py-1.5"
                disabled={isLoading}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="p-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-40 disabled:hover:bg-lime-400 text-zinc-950 rounded-lg transition-colors shrink-0 focus:outline-none"
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 mt-1.5">
              <span>Enter to send · Shift+Enter for newline</span>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <span>WhatsApp: {FORMATTED_PHONE}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
