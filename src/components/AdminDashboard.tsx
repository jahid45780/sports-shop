import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Save, 
  Printer, 
  X, 
  LogOut, 
  Settings as SettingsIcon,
  RefreshCw,
  Sliders,
  Check,
  User,
  RotateCcw,
  ExternalLink,
  Bot,
  MessageSquare,
  HardDrive,
  Target,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { api, setStoredAdminToken, getStoredAdminToken } from '../services/api.ts';
import { AdminSalesOverview } from './AdminSalesOverview.tsx';
import { GoogleDriveModal } from './GoogleDriveModal.tsx';
import { AdsTrackingDashboard } from './AdsTrackingDashboard.tsx';
import type { 
  Product, 
  Order, 
  OrderStatus, 
  PaymentStatus, 
  DashboardStats, 
  StoreSettings, 
  ProductCategory, 
  ProductSize,
  FounderProfile,
  ChatbotSettings
} from '../types/index.ts';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshPublicProducts?: () => void;
}

type AdminTab = 'overview' | 'sales' | 'orders' | 'products' | 'inventory' | 'settings' | 'founder' | 'chatbot' | 'ads_tracking';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onRefreshPublicProducts
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(getStoredAdminToken());
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('onlyadminpage');
  const [loginPassword, setLoginPassword] = useState('..');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Modals inside Admin
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Product create/edit
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('club-jerseys');
  const [prodTeam, setProdTeam] = useState('');
  const [prodRegularPrice, setProdRegularPrice] = useState(1500);
  const [prodSalePrice, setProdSalePrice] = useState(1200);
  const [prodStock, setProdStock] = useState(25);
  const [prodSku, setProdSku] = useState('');
  const [prodSizes, setProdSizes] = useState<ProductSize[]>(['S', 'M', 'L', 'XL']);
  const [prodColors, setProdColors] = useState('Stealth Black / Lime');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('/src/assets/images/hero_sports_jersey_1792747635843.jpg');
  const [prodFeatured, setProdFeatured] = useState(true);
  const [prodAllowCustom, setProdAllowCustom] = useState(true);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Founder Profile Settings Form
  const [founderForm, setFounderForm] = useState<FounderProfile>({
    name: 'MD Jahid',
    position: 'CEO',
    address: 'DHAKA',
    photoUrl: '',
    bio: 'Leading ApexKit with an unwavering commitment to empowering athletes and sports fans across Bangladesh with authentic, elite-quality sports performance kits and apparel.'
  });
  const [founderSaved, setFounderSaved] = useState<string | null>(null);
  const [founderError, setFounderError] = useState<string | null>(null);
  const [isSavingFounder, setIsSavingFounder] = useState(false);
  const [founderPreviewError, setFounderPreviewError] = useState(false);

  // Chatbot Settings State
  const [chatbotForm, setChatbotForm] = useState<ChatbotSettings | null>(null);
  const [isSavingChatbot, setIsSavingChatbot] = useState(false);
  const [chatbotSaved, setChatbotSaved] = useState<string | null>(null);
  const [newSuggestedQuestion, setNewSuggestedQuestion] = useState('');
  const [isAdminDriveOpen, setIsAdminDriveOpen] = useState(false);

  // Image upload and validation states
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [productImageUploadError, setProductImageUploadError] = useState<string | null>(null);
  const [isUploadingFounderImage, setIsUploadingFounderImage] = useState(false);
  const [founderImageUploadError, setFounderImageUploadError] = useState<string | null>(null);
  const [productModalError, setProductModalError] = useState<string | null>(null);

  // Non-blocking toast notification state
  const [dashboardToast, setDashboardToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setDashboardToast({ text, type });
    setTimeout(() => {
      setDashboardToast(prev => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Safe product deletion confirmation modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Load Admin Data
  const loadAdminData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [sData, pData, oData, setts, fProfile, cSettings] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProducts(),
        api.getAdminOrders({
          status: orderStatusFilter !== 'all' ? orderStatusFilter : undefined,
          paymentStatus: orderPaymentFilter !== 'all' ? orderPaymentFilter : undefined,
          search: orderSearch || undefined
        }),
        api.getSettings(),
        api.getFounderProfile(),
        api.getChatbotSettings()
      ]);
      setStats(sData);
      setProducts(pData);
      setOrders(oData);
      setSettings(setts);
      setSettingsForm(setts);
      if (fProfile) {
        setFounderForm(fProfile);
        setFounderPreviewError(false);
      }
      if (cSettings) {
        setChatbotForm(cSettings);
      }
    } catch (e: any) {
      const isAuthError = e?.message && (
        e.message.toLowerCase().includes('unauthorized') ||
        e.message.toLowerCase().includes('token') ||
        e.message.toLowerCase().includes('expired') ||
        e.message.toLowerCase().includes('invalid')
      );
      if (isAuthError) {
        setIsAuthenticated(false);
        setStoredAdminToken(null);
        setLoginError('Your administrator session has expired. Please sign in again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthError = (event: any) => {
      setIsAuthenticated(false);
      setStoredAdminToken(null);
      setLoginError(event?.detail?.message || 'Administrator authentication required.');
    };
    window.addEventListener('apex:admin_unauthorized', handleAuthError);
    return () => window.removeEventListener('apex:admin_unauthorized', handleAuthError);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, orderStatusFilter, orderPaymentFilter, orderSearch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await api.adminLogin(loginEmail, loginPassword);
      if (res.success && res.token) {
        setStoredAdminToken(res.token);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setStoredAdminToken(null);
    setIsAuthenticated(false);
  };

  // Open Product Modal (New or Edit)
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('club-jerseys');
    setProdTeam('');
    setProdRegularPrice(1600);
    setProdSalePrice(1290);
    setProdStock(20);
    setProdSku(`APK-${Date.now().toString().slice(-4)}`);
    setProdSizes(['S', 'M', 'L', 'XL']);
    setProdColors('Official Colors');
    setProdDesc('Match edition sports jersey engineered with breathable micro-mesh.');
    setProdImage('/src/assets/images/product_club_jersey_1792747635830.jpg');
    setProdFeatured(true);
    setProdAllowCustom(true);
    setProductImageUploadError(null);
    setProductModalError(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdTeam(p.team);
    setProdRegularPrice(p.regularPrice);
    setProdSalePrice(p.salePrice);
    setProdStock(p.stock);
    setProdSku(p.sku);
    setProdSizes(p.sizes);
    setProdColors(p.colors.join(', '));
    setProdDesc(p.description);
    setProdImage(p.images[0] || '');
    setProdFeatured(p.isFeatured);
    setProdAllowCustom(Boolean(p.allowCustomPrint));
    setProductImageUploadError(null);
    setProductModalError(null);
    setIsProductModalOpen(true);
  };

  // Product Image File Upload Handler
  const handleProductImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProductImageUploadError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setProductImageUploadError('Invalid format. Please select a JPG, PNG, WEBP, GIF, or SVG image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProductImageUploadError(`Image exceeds 5MB size limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`);
      return;
    }

    setIsUploadingProductImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setProdImage(res.url);
        showToast('Product image uploaded successfully!', 'success');
      } else {
        setProductImageUploadError(res.message || 'Image upload failed.');
      }
    } catch (err: any) {
      setProductImageUploadError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploadingProductImage(false);
      e.target.value = '';
    }
  };

  // Founder Photo File Upload Handler
  const handleFounderPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFounderImageUploadError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setFounderImageUploadError('Invalid format. Please select a JPG, PNG, WEBP, GIF, or SVG image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFounderImageUploadError(`Image exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`);
      return;
    }

    setIsUploadingFounderImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        setFounderForm(prev => ({ ...prev, photoUrl: res.url }));
        setFounderPreviewError(false);
        showToast('Founder profile photo uploaded successfully!', 'success');
      } else {
        setFounderImageUploadError(res.message || 'Upload failed.');
      }
    } catch (err: any) {
      setFounderImageUploadError(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingFounderImage(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductModalError(null);
    try {
      const payload: Partial<Product> = {
        name: prodName,
        category: prodCategory,
        team: prodTeam || 'Apex Athletic',
        regularPrice: Number(prodRegularPrice),
        salePrice: Number(prodSalePrice),
        stock: Number(prodStock),
        sku: prodSku,
        sizes: prodSizes,
        colors: prodColors.split(',').map(c => c.trim()).filter(Boolean),
        description: prodDesc,
        images: [prodImage],
        isFeatured: prodFeatured,
        allowCustomPrint: prodAllowCustom
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast(`Product "${prodName}" updated successfully.`, 'success');
      } else {
        await api.createProduct(payload);
        showToast(`Product "${prodName}" created successfully.`, 'success');
      }

      setIsProductModalOpen(false);
      await loadAdminData();
      if (onRefreshPublicProducts) onRefreshPublicProducts();
    } catch (err: any) {
      setProductModalError(err.message || 'Failed to save product');
    }
  };

  // Safe non-blocking delete prompt
  const promptDeleteProduct = (id: string, name: string) => {
    setDeleteConfirmTarget({ id, name });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeletingProduct(true);
    try {
      await api.deleteProduct(deleteConfirmTarget.id);
      showToast(`Product "${deleteConfirmTarget.name}" deleted successfully.`, 'success');
      setDeleteConfirmTarget(null);
      await loadAdminData();
      if (onRefreshPublicProducts) onRefreshPublicProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Status updates
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      showToast(`Order status updated to "${status}".`, 'success');
      await loadAdminData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: status } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      await api.updatePaymentStatus(orderId, paymentStatus);
      showToast(`Payment status updated to "${paymentStatus}".`, 'success');
      await loadAdminData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update payment status', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      await api.updateSettings(settingsForm);
      setSettingsSaved(true);
      showToast('Store settings saved successfully.', 'success');
      setTimeout(() => setSettingsSaved(false), 3000);
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    }
  };

  const handleSaveFounderProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFounderError(null);
    setFounderSaved(null);

    // Validate mandatory fields
    if (!founderForm.name || !founderForm.name.trim()) {
      setFounderError('Founder name is required.');
      return;
    }
    if (!founderForm.position || !founderForm.position.trim()) {
      setFounderError('Founder position is required (e.g. CEO).');
      return;
    }
    if (!founderForm.address || !founderForm.address.trim()) {
      setFounderError('Founder address is required (e.g. DHAKA).');
      return;
    }

    // Validate URL schema if present
    if (founderForm.photoUrl && founderForm.photoUrl.trim() !== '') {
      const trimmed = founderForm.photoUrl.trim();
      if (!/^https?:\/\/.+/i.test(trimmed) && !trimmed.startsWith('/uploads/') && !trimmed.startsWith('/src/assets/')) {
        setFounderError('Profile photo URL must start with http://, https://, /uploads/, or /src/assets/');
        return;
      }
    }

    setIsSavingFounder(true);
    try {
      const res = await api.updateFounderProfile(founderForm);
      setFounderForm(res.founderProfile);
      setFounderPreviewError(false);
      setFounderSaved('Founder Profile & About Us Page updated successfully!');
      showToast('Founder profile updated successfully!', 'success');
      setTimeout(() => setFounderSaved(null), 4000);
    } catch (err: any) {
      setFounderError(err.message || 'Failed to update founder profile');
      showToast(err.message || 'Failed to update founder profile', 'error');
    } finally {
      setIsSavingFounder(false);
    }
  };

  const handleResetFounderPhoto = () => {
    setFounderForm(prev => ({ ...prev, photoUrl: '' }));
    setFounderPreviewError(false);
  };

  const handleSaveChatbotSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatbotForm) return;
    setIsSavingChatbot(true);
    setChatbotSaved(null);
    try {
      const res = await api.updateChatbotSettings(chatbotForm);
      setChatbotForm(res.settings);
      setChatbotSaved('AI Chatbot configurations saved successfully!');
      showToast('AI Chatbot configurations saved successfully!', 'success');
      setTimeout(() => setChatbotSaved(null), 3500);
    } catch (err: any) {
      showToast(err.message || 'Failed to save chatbot settings', 'error');
    } finally {
      setIsSavingChatbot(false);
    }
  };

  const handleAddSuggestedQuestion = () => {
    if (!newSuggestedQuestion.trim() || !chatbotForm) return;
    const updated = [...(chatbotForm.suggestedQuestions || []), newSuggestedQuestion.trim()];
    setChatbotForm({ ...chatbotForm, suggestedQuestions: updated });
    setNewSuggestedQuestion('');
  };

  const handleRemoveSuggestedQuestion = (index: number) => {
    if (!chatbotForm) return;
    const updated = chatbotForm.suggestedQuestions.filter((_, i) => i !== index);
    setChatbotForm({ ...chatbotForm, suggestedQuestions: updated });
  };

  // 1. If not authenticated, render Admin Login view
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center mx-auto text-lime-400 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black uppercase text-white font-display">
              Store Owner Portal
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              ApexKit Administration & COD Order Management
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors mt-2"
            >
              {isLoggingIn ? 'Verifying...' : 'Sign In as Administrator'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Dashboard Layout
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto flex flex-col text-zinc-100">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-black tracking-tight text-white font-display uppercase flex items-center gap-1.5">
            <span>APEX</span>
            <span className="text-lime-400">KIT</span>
            <span className="text-[10px] font-sans font-bold bg-lime-400/10 text-lime-400 px-2 py-0.5 rounded ml-2 border border-lime-400/30">
              ADMIN
            </span>
          </div>
        </div>

        {/* Tab Navigation in Top Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'overview' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'sales' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-lime-400" />
            <span>Sales Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'products' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'inventory' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Inventory ({stats?.lowStockCount || 0} alerts)
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'settings' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('founder')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'founder' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-lime-400" />
            <span>Founder & About</span>
          </button>
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'chatbot' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-lime-400" />
            <span>AI Chatbot</span>
          </button>
          <button
            onClick={() => setActiveTab('ads_tracking')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ads_tracking' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-lime-400" />
            <span>Ads & Tracking</span>
          </button>
        </nav>

        {/* Header Right Cluster */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminDriveOpen(true)}
            className="px-2.5 py-1.5 text-zinc-300 hover:text-white rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Open Google Drive Storage Hub"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Drive</span>
          </button>
          <button
            onClick={loadAdminData}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-lime-400' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Store</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto p-2 bg-zinc-900 border-b border-zinc-800 text-xs">
        {(['overview', 'sales', 'orders', 'products', 'inventory', 'settings', 'founder', 'chatbot', 'ads_tracking'] as AdminTab[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap capitalize font-semibold ${
              activeTab === t ? 'bg-lime-400 text-zinc-950' : 'text-zinc-400'
            }`}
          >
            {t === 'sales' ? 'Sales Overview' : t === 'founder' ? 'Founder Profile' : t === 'chatbot' ? 'AI Chatbot' : t === 'ads_tracking' ? 'Ads & Tracking' : t}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Collected Revenue */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Collected Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                  ৳{stats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  From delivered & verified orders
                </div>
              </div>

              {/* Pending Orders */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Pending Dispatch</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                  {stats.pendingOrdersCount}
                </div>
                <div className="text-[11px] text-amber-400/80">
                  Awaiting courier booking
                </div>
              </div>

              {/* Total Orders */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Total Orders Placed</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                  {stats.totalOrdersCount}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {stats.deliveredOrdersCount} delivered · {stats.cancelledOrdersCount} cancelled
                </div>
              </div>

              {/* Low Stock Alert */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Low Stock Warning</span>
                  <div className="w-8 h-8 rounded-lg bg-red-400/10 text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                  {stats.lowStockCount}
                </div>
                <div className="text-[11px] text-zinc-500">
                  Products with ≤ 10 units left
                </div>
              </div>

            </div>

            {/* Sales Trend Bar Card with direct link to Recharts Sales Overview */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-lime-400" />
                    <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider">
                      7-Day Sales Trend (BDT ৳)
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">Daily revenue collected from completed orders</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-lime-400 font-mono font-bold">
                    Live DB Metrics
                  </span>
                  <button
                    onClick={() => setActiveTab('sales')}
                    className="px-3 py-1.5 bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Full Analytics & Popularity</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Responsive Bar Visualization */}
              <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-zinc-800">
                {stats.salesByDay.map((day, idx) => {
                  const maxSale = Math.max(...stats.salesByDay.map(s => s.sales), 3000);
                  const heightPercent = Math.max(10, Math.round((day.sales / maxSale) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer" onClick={() => setActiveTab('sales')}>
                      <div className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ৳{day.sales}
                      </div>
                      <div
                        className="w-full bg-zinc-800 group-hover:bg-lime-400 rounded-t transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] font-mono text-zinc-500">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders Overview Table */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider">
                  Recent Matchday Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-lime-400 hover:underline font-semibold"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-sans">
                    <tr>
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Total (COD)</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 text-zinc-300">
                    {stats.recentOrders.map(ord => (
                      <tr key={ord.id} className="hover:bg-zinc-850/50">
                        <td className="py-2.5 px-3 font-bold text-lime-400">{ord.orderNumber}</td>
                        <td className="py-2.5 px-3 font-sans text-white">{ord.customer.fullName}</td>
                        <td className="py-2.5 px-3 text-zinc-400 font-sans">{ord.customer.district}</td>
                        <td className="py-2.5 px-3 font-bold text-white tabular-nums">৳{ord.total}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            ord.orderStatus === 'delivered' ? 'bg-lime-400/10 text-lime-400' :
                            ord.orderStatus === 'shipped' ? 'bg-blue-400/10 text-blue-400' :
                            ord.orderStatus === 'cancelled' ? 'bg-red-400/10 text-red-400' :
                            'bg-amber-400/10 text-amber-400'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold ${ord.paymentStatus === 'paid' ? 'text-lime-400' : 'text-zinc-500'}`}>
                            {ord.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setIsOrderModalOpen(true);
                            }}
                            className="text-xs text-lime-400 hover:underline font-semibold"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB: SALES OVERVIEW (RECHARTS) ================= */}
        {activeTab === 'sales' && (
          <AdminSalesOverview
            orders={orders}
            products={products}
            onNavigateToOrders={() => setActiveTab('orders')}
            onNavigateToProducts={() => setActiveTab('products')}
          />
        )}

        {/* ================= TAB 2: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Filter toolbar */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by order # or phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400 w-56"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>Payment:</span>
                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400"
                  >
                    <option value="all">All Payments</option>
                    <option value="unpaid">Unpaid (COD)</option>
                    <option value="paid">Paid (Collected)</option>
                  </select>
                </div>
              </div>

              <div className="text-xs font-mono text-zinc-400">
                {orders.length} Orders matching filter
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-zinc-850 overflow-hidden bg-zinc-900">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-sans">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer & Phone</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Items Count</th>
                    <th className="py-3 px-4">Payable Total</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4">COD Payment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {orders.map(ord => (
                    <tr key={ord.id} className="hover:bg-zinc-850/50">
                      <td className="py-3 px-4 font-bold text-lime-400">{ord.orderNumber}</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-white">{ord.customer.fullName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{ord.customer.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-sans text-zinc-400 max-w-xs truncate">
                        {ord.customer.fullAddress}, {ord.customer.district}
                      </td>
                      <td className="py-3 px-4">{ord.items.reduce((s, i) => s + i.quantity, 0)} pcs</td>
                      <td className="py-3 px-4 font-bold text-white tabular-nums">৳{ord.total}</td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 capitalize"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleUpdatePaymentStatus(ord.id, ord.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                            ord.paymentStatus === 'paid'
                              ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                              : 'bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20'
                          }`}
                        >
                          {ord.paymentStatus === 'paid' ? 'Paid ✓' : 'Mark Paid'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setIsOrderModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-semibold"
                        >
                          View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 3: PRODUCTS MANAGEMENT ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <button
                onClick={openNewProductModal}
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Jersey / Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-xl border border-zinc-850 overflow-hidden bg-zinc-900">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-sans">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Sale Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {products
                    .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                    .map(p => (
                      <tr key={p.id} className="hover:bg-zinc-850/50">
                        <td className="py-3 px-4 flex items-center gap-3 font-sans">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-950 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-white text-xs truncate max-w-xs">{p.name}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              Sizes: {p.sizes.join(', ')}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-sans capitalize text-zinc-400">{p.category.replace('-', ' ')}</td>
                        <td className="py-3 px-4 font-sans text-white">{p.team}</td>
                        <td className="py-3 px-4 font-bold text-white tabular-nums">৳{p.salePrice}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                            p.stock <= 5 ? 'bg-red-500/20 text-red-400' :
                            p.stock <= 10 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-zinc-950 text-zinc-300'
                          }`}>
                            {p.stock} pcs
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 font-mono">{p.sku}</td>
                        <td className="py-3 px-4 text-right font-sans space-x-1">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => promptDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 4: INVENTORY ALERTS ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Real-time inventory monitor. Items with 10 or fewer units in stock require restocking from suppliers.</span>
            </div>

            <div className="rounded-xl border border-zinc-850 overflow-hidden bg-zinc-900">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-sans">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-850/50">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">SKU: {p.sku}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-base font-mono tabular-nums">
                        {p.stock}
                      </td>
                      <td className="py-3 px-4">
                        {p.stock === 0 ? (
                          <span className="text-red-400 font-bold uppercase text-[10px]">Out of Stock</span>
                        ) : p.stock <= 10 ? (
                          <span className="text-amber-400 font-bold uppercase text-[10px]">Low Stock</span>
                        ) : (
                          <span className="text-lime-400 font-bold uppercase text-[10px]">Optimal</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">৳{p.salePrice}</td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={async () => {
                            await api.updateProduct(p.id, { stock: p.stock + 20 });
                            await loadAdminData();
                            if (onRefreshPublicProducts) onRefreshPublicProducts();
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-lime-400 font-bold rounded text-xs"
                        >
                          +20 Units
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: STORE SETTINGS ================= */}
        {activeTab === 'settings' && settingsForm && (
          <div className="max-w-2xl bg-zinc-900 border border-zinc-850 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-display tracking-wider">
                Store Configurations & Delivery Charges
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Configure delivery fees and announcement ticker in real-time.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-lime-400/10 border border-lime-400/30 rounded-xl text-xs text-lime-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Store settings successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Store Name</label>
                <input
                  type="text"
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Top Announcement Bar Text</label>
                <textarea
                  rows={2}
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Inside Dhaka Delivery Fee (৳)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryFeeInsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeInsideDhaka: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Outside Dhaka Delivery Fee (৳)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryFeeOutsideDhaka}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeOutsideDhaka: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Free Delivery Minimum Order (৳)</label>
                <input
                  type="number"
                  value={settingsForm.freeDeliveryThreshold}
                  onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 mt-4"
              >
                <Save className="w-4 h-4" />
                <span>Save Store Configurations</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 5: FOUNDER & ABOUT SETTINGS ================= */}
        {activeTab === 'founder' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase font-display text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-lime-400" />
                  <span>Founder Profile & About Us Settings</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage executive founder details displayed on the public <code className="text-lime-400 font-mono">/about</code> page. Updates persist in backend storage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                  Protected Admin API (/api/admin/founder-profile)
                </span>
              </div>
            </div>

            {/* Success & Error Banners */}
            {founderSaved && (
              <div className="p-3.5 bg-lime-400/10 border border-lime-400/30 rounded-xl text-xs text-lime-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{founderSaved}</span>
              </div>
            )}

            {founderError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{founderError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Side */}
              <form onSubmit={handleSaveFounderProfile} className="lg:col-span-7 bg-zinc-900 border border-zinc-850 rounded-2xl p-6 space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">
                      Founder Name <span className="text-lime-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={founderForm.name}
                      onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                      placeholder="e.g. MD Jahid"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">
                      Position / Title <span className="text-lime-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={founderForm.position}
                      onChange={(e) => setFounderForm({ ...founderForm, position: e.target.value })}
                      placeholder="e.g. CEO"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Address / Headquarters Location <span className="text-lime-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={founderForm.address}
                    onChange={(e) => setFounderForm({ ...founderForm, address: e.target.value })}
                    placeholder="e.g. DHAKA"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-400 font-medium uppercase"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">Default: DHAKA</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-zinc-300">
                      Profile Photo URL
                    </label>
                    {founderForm.photoUrl && (
                      <button
                        type="button"
                        onClick={handleResetFounderPhoto}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Photo</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-white rounded-lg text-xs font-semibold border border-zinc-700 transition-colors">
                      {isUploadingFounderImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-lime-400" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-lime-400" />
                          <span>Upload Photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        disabled={isUploadingFounderImage}
                        onChange={handleFounderPhotoFileChange}
                      />
                    </label>
                    <span className="text-[11px] text-zinc-500">Max 5MB (JPG, PNG, WEBP)</span>
                  </div>

                  {founderImageUploadError && (
                    <p className="text-[11px] text-red-400 font-medium mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {founderImageUploadError}
                    </p>
                  )}

                  <input
                    type="text"
                    value={founderForm.photoUrl}
                    onChange={(e) => {
                      setFounderForm({ ...founderForm, photoUrl: e.target.value });
                      setFounderPreviewError(false);
                    }}
                    placeholder="https://example.com/photo.jpg or /uploads/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-lime-400"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Upload a file above or enter URL (<code className="text-zinc-400 font-mono">https://</code>, <code className="text-zinc-400 font-mono">/uploads/</code>). Leave empty for initials.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Founder Quote / Statement
                  </label>
                  <textarea
                    rows={3}
                    value={founderForm.bio || ''}
                    onChange={(e) => setFounderForm({ ...founderForm, bio: e.target.value })}
                    placeholder="Enter inspiring founder vision statement..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-400 leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingFounder}
                    className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-lime-400/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingFounder ? 'Saving Changes...' : 'Save Founder Profile'}</span>
                  </button>
                </div>

              </form>

              {/* Live Preview Side */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                  <span>Live Preview Card</span>
                  <span className="text-[10px] text-lime-400 font-mono bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                    Real-time
                  </span>
                </div>

                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-lime-400/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-5 border-b border-zinc-800 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Leadership Preview
                    </span>
                    <span className="px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 text-[10px] font-bold border border-lime-400/20 font-mono">
                      APEX EXECUTIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-5">
                    {/* Photo or Initials */}
                    <div className="relative w-20 h-20 rounded-2xl bg-zinc-950 border-2 border-lime-400/40 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      {founderForm.photoUrl && !founderPreviewError ? (
                        <img
                          src={founderForm.photoUrl}
                          alt={founderForm.name}
                          onError={() => setFounderPreviewError(true)}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center text-lime-400">
                          <span className="text-xl font-black font-display">
                            {founderForm.name ? founderForm.name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() : 'MJ'}
                          </span>
                          <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-semibold">
                            {founderForm.position || 'CEO'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <h4 className="text-lg font-black font-display uppercase tracking-tight text-white">
                        {founderForm.name || 'MD Jahid'}
                      </h4>
                      <div className="inline-block px-2 py-0.5 bg-lime-400 text-zinc-950 font-bold text-[10px] uppercase tracking-wider rounded">
                        {founderForm.position || 'CEO'}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1 pt-0.5">
                        <span className="text-lime-400 font-bold">●</span>
                        <span className="font-semibold text-zinc-300 uppercase">{founderForm.address || 'DHAKA'}</span>
                      </div>
                    </div>
                  </div>

                  {founderPreviewError && (
                    <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-400">
                      Photo URL failed to load. Fallback initials badge is shown.
                    </div>
                  )}

                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-300 italic leading-relaxed">
                    "{founderForm.bio || 'Leading ApexKit with an unwavering commitment to empowering athletes and sports fans across Bangladesh with authentic, elite-quality sports performance kits and apparel.'}"
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>Store: ApexKit Sports</span>
                    <span className="text-zinc-500">Dhaka, Bangladesh</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-400 leading-relaxed">
                  💡 <strong className="text-zinc-200">Tip:</strong> Saving this form immediately reflects on the customer-facing <span className="text-lime-400 font-mono">/about</span> page and in all founder quote sections.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 6: AI SHOPPING CHATBOT SETTINGS ================= */}
        {activeTab === 'chatbot' && chatbotForm && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase font-display text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-lime-400" />
                  <span>AI Shopping Chat System Configurations</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage the customer-facing AI sports assistant, welcome messages, suggested questions, and live usage telemetry.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime-400 inline-block animate-pulse" />
                  <span>Gemini 3.8 Flash Active</span>
                </span>
              </div>
            </div>

            {/* Usage Statistics KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 space-y-1">
                <div className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>Total AI Queries</span>
                  <MessageSquare className="w-4 h-4 text-lime-400" />
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {chatbotForm.totalQueriesCount || 0}
                </div>
                <div className="text-[10px] text-zinc-500">Real-time questions served</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 space-y-1">
                <div className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>Conversations</span>
                  <Bot className="w-4 h-4 text-lime-400" />
                </div>
                <div className="text-2xl font-black font-mono text-lime-400">
                  {chatbotForm.totalConversationsCount || 0}
                </div>
                <div className="text-[10px] text-zinc-500">Customer chat sessions</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 space-y-1">
                <div className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>Chatbot Status</span>
                  <span className={`w-2 h-2 rounded-full ${chatbotForm.isEnabled ? 'bg-emerald-400' : 'bg-red-500'}`} />
                </div>
                <div className="text-lg font-bold uppercase font-display text-white">
                  {chatbotForm.isEnabled ? 'Online & Serving' : 'Disabled (Offline)'}
                </div>
                <div className="text-[10px] text-zinc-500">Floating widget toggle</div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 space-y-1">
                <div className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>Catalog Grounding</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-display text-white">
                  100% Real DB
                </div>
                <div className="text-[10px] text-zinc-500">Zero fabricated prices/stock</div>
              </div>
            </div>

            {/* Success Alert */}
            {chatbotSaved && (
              <div className="p-3.5 bg-lime-400/10 border border-lime-400/30 rounded-xl text-xs text-lime-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{chatbotSaved}</span>
              </div>
            )}

            {/* Chatbot Settings Form */}
            <form onSubmit={handleSaveChatbotSettings} className="bg-zinc-900 border border-zinc-850 rounded-2xl p-6 space-y-5 text-xs">
              
              {/* Enable / Disable Switch */}
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                <div>
                  <h4 className="font-bold text-white text-sm">Enable Floating AI Shopping Widget</h4>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    When active, customers will see the floating AI Specialist button at the bottom-right of the store.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chatbotForm.isEnabled}
                    onChange={(e) => setChatbotForm({ ...chatbotForm, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                </label>
              </div>

              {/* Welcome Messages */}
              <div className="space-y-4">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-zinc-800 pb-2">
                  Welcome Greetings
                </h4>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    English Welcome Greeting
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={chatbotForm.welcomeMessageEn}
                    onChange={(e) => setChatbotForm({ ...chatbotForm, welcomeMessageEn: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Bengali Welcome Greeting (বাংলা বার্তা)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={chatbotForm.welcomeMessageBn}
                    onChange={(e) => setChatbotForm({ ...chatbotForm, welcomeMessageBn: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Language toggles & Support info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Support WhatsApp / Hotline
                  </label>
                  <input
                    type="text"
                    value={chatbotForm.supportPhone}
                    onChange={(e) => setChatbotForm({ ...chatbotForm, supportPhone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Support Messenger Link
                  </label>
                  <input
                    type="text"
                    value={chatbotForm.supportMessengerUrl}
                    onChange={(e) => setChatbotForm({ ...chatbotForm, supportMessengerUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Suggested Questions Manager */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-zinc-800 pb-2 flex items-center justify-between">
                  <span>Suggested Quick Questions</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Shown as quick action pills in chat</span>
                </h4>

                <div className="space-y-2">
                  {chatbotForm.suggestedQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                      <span className="text-zinc-200">{q}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSuggestedQuestion(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                        title="Remove question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSuggestedQuestion}
                    onChange={(e) => setNewSuggestedQuestion(e.target.value)}
                    placeholder="e.g. ⚽ Show Real Madrid 24/25 Jersey"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSuggestedQuestion}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg shrink-0"
                  >
                    Add Question
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={isSavingChatbot}
                  className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-lime-400/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingChatbot ? 'Saving Configurations...' : 'Save Chatbot Settings'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ================= TAB 9: ADS & TRACKING MANAGEMENT ================= */}
        {activeTab === 'ads_tracking' && (
          <AdsTrackingDashboard onAuthError={handleLogout} />
        )}

      </main>

      {/* ================= MODAL: ORDER DETAILS & PRINT INVOICE ================= */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div 
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:m-0 print:border-none print:shadow-none print:bg-white print:text-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-lime-400" />
                <h3 className="text-base font-bold uppercase font-display text-white">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 text-xs">
              
              {/* Status Action Buttons */}
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Order Status:</span>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-white capitalize font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Payment:</span>
                  <button
                    onClick={() => handleUpdatePaymentStatus(selectedOrder.id, selectedOrder.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                      selectedOrder.paymentStatus === 'paid'
                        ? 'bg-lime-400 text-zinc-950'
                        : 'bg-amber-400 text-zinc-950'
                    }`}
                  >
                    {selectedOrder.paymentStatus === 'paid' ? 'Paid (Collected)' : 'Mark Paid (Collect COD)'}
                  </button>
                </div>
              </div>

              {/* Customer Delivery info */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs">Customer Information</h4>
                <div className="text-white font-semibold">{selectedOrder.customer.fullName}</div>
                <div className="font-mono text-lime-400">{selectedOrder.customer.phone}</div>
                <div className="text-zinc-400">
                  {selectedOrder.customer.fullAddress}, {selectedOrder.customer.thana}, {selectedOrder.customer.district}
                </div>
                {selectedOrder.customer.instructions && (
                  <div className="text-zinc-500 italic text-[11px] pt-1">
                    Customer Note: "{selectedOrder.customer.instructions}"
                  </div>
                )}
              </div>

              {/* Items ordered */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase text-xs">Ordered Sports Items</h4>
                <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{i.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          Size: {i.size} · Color: {i.color} · Qty: {i.quantity}
                        </div>
                        {i.customPrint && (
                          <div className="text-[10px] text-lime-400 font-mono">
                            Custom Print: {i.customPrint.playerName} #{i.customPrint.playerNumber}
                          </div>
                        )}
                      </div>
                      <span className="font-mono font-bold text-white tabular-nums">
                        ৳{i.itemTotal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-zinc-200">৳{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-lime-400">
                    <span>Discount:</span>
                    <span className="font-mono">-৳{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery Charge:</span>
                  <span className="font-mono text-zinc-200">৳{selectedOrder.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-850">
                  <span>Payable Total:</span>
                  <span className="font-mono text-lime-400 text-base">৳{selectedOrder.total}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between print:hidden">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-1.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded text-xs font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT PRODUCT ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div 
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold uppercase font-display text-white">
                {editingProduct ? 'Edit Product' : 'Create New Sports Jersey'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-6 space-y-4 text-xs">
              {productModalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{productModalError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Real Madrid 24/25 Gold Home Jersey"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="club-jerseys">Club Football Jerseys</option>
                    <option value="national-team">National Team Kits</option>
                    <option value="custom-jerseys">Custom Printed Jerseys</option>
                    <option value="sports-tshirts">Sports T-Shirts & Tops</option>
                    <option value="retro-classics">Retro Classics</option>
                    <option value="football-jerseys">Standard Football Jerseys</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Club / Squad Team</label>
                  <input
                    type="text"
                    required
                    value={prodTeam}
                    onChange={(e) => setProdTeam(e.target.value)}
                    placeholder="e.g. Barcelona, Argentina, Apex FC"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={prodRegularPrice}
                    onChange={(e) => setProdRegularPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Sale Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Product Jersey Image</label>
                
                {/* Upload Action & Presets */}
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-white rounded-lg text-xs font-semibold border border-zinc-700 transition-colors">
                    {isUploadingProductImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-lime-400" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-lime-400" />
                        <span>Upload Image File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      disabled={isUploadingProductImage}
                      onChange={handleProductImageFileChange}
                    />
                  </label>
                  <span className="text-[11px] text-zinc-500">Max 5MB (JPG, PNG, WEBP)</span>
                </div>

                {productImageUploadError && (
                  <p className="text-[11px] text-red-400 font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {productImageUploadError}
                  </p>
                )}

                {/* Direct URL / Path */}
                <input
                  type="text"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="/src/assets/images/... or /uploads/... or https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-lime-400"
                />

                {/* Built-in quick preset images */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500">Presets:</span>
                  {[
                    { label: 'Club Kit', path: '/src/assets/images/product_club_jersey_1792747635830.jpg' },
                    { label: 'National', path: '/src/assets/images/product_national_jersey_1792747636134.jpg' },
                    { label: 'Custom', path: '/src/assets/images/product_custom_jersey_1792747711299.jpg' },
                    { label: 'Retro', path: '/src/assets/images/product_retro_jersey_1792747711923.jpg' },
                    { label: 'Training', path: '/src/assets/images/product_training_tshirt_1792747637025.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setProdImage(preset.path)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        prodImage === preset.path
                          ? 'bg-lime-400/20 text-lime-400 border-lime-400/40'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Preview Thumbnail */}
                {prodImage && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                    <img 
                      src={prodImage} 
                      alt="Product Preview" 
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-700 bg-zinc-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/product_club_jersey_1792747635830.jpg';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-mono text-zinc-300 truncate">{prodImage}</p>
                      <p className="text-[10px] text-zinc-500">Active preview thumbnail</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-lime-400 accent-lime-400"
                  />
                  <span className="font-semibold text-white">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodAllowCustom}
                    onChange={(e) => setProdAllowCustom(e.target.checked)}
                    className="w-4 h-4 rounded text-lime-400 accent-lime-400"
                  />
                  <span className="font-semibold text-white">Enable Custom Name & Number Print</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold rounded-lg text-xs uppercase"
                >
                  {editingProduct ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive Storage Hub inside Admin Dashboard */}
      <GoogleDriveModal
        isOpen={isAdminDriveOpen}
        onClose={() => setIsAdminDriveOpen(false)}
        recentOrders={orders}
      />

      {/* Delete Product Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">Confirm Deletion</h3>
                <p className="text-xs text-zinc-400">This action will remove the product from the catalog.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-850">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteConfirmTarget.name}"</span>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={confirmDeleteProduct}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                {isDeletingProduct ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking Admin Toast Notification */}
      {dashboardToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold ${
            dashboardToast.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-800/80'
              : 'bg-zinc-900/95 text-lime-400 border-lime-400/30'
          }`}>
            {dashboardToast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
            )}
            <span>{dashboardToast.text}</span>
            <button
              onClick={() => setDashboardToast(null)}
              className="ml-2 text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
