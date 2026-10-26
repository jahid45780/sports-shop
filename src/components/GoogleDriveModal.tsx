import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  HardDrive,
  FolderPlus,
  Upload,
  Search,
  FileText,
  Image as ImageIcon,
  Folder,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  File,
  Download,
  Receipt,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Grid,
  List as ListIcon
} from 'lucide-react';
import {
  initGoogleAuth,
  googleSignIn,
  googleSignOut,
  listDriveFiles,
  getDriveAbout,
  createDriveFolder,
  uploadFileToDrive,
  uploadTextToDrive,
  deleteDriveFile,
  DriveFileItem,
  DriveStorageQuota
} from '../services/googleDriveAuth.ts';
import type { Order } from '../types/index.ts';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders?: Order[];
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  recentOrders = []
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Files & Drive State
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderHistory, setFolderHistory] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [storageQuota, setStorageQuota] = useState<DriveStorageQuota | null>(null);

  // Actions State
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Mandatory Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Export Status
  const [exportingOrderId, setExportingOrderId] = useState<string | null>(null);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initialize auth listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Load files & quota when authenticated and folder changes
  const loadDriveContents = async (folderId: string = currentFolderId, query?: string) => {
    if (!accessToken) return;
    setIsLoadingFiles(true);
    setAuthError(null);
    try {
      const [filesRes, aboutRes] = await Promise.all([
        listDriveFiles(folderId, query),
        getDriveAbout().catch(() => null)
      ]);
      setFiles(filesRes.files);
      if (aboutRes?.storageQuota) {
        setStorageQuota(aboutRes.storageQuota);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to load Google Drive contents.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen && accessToken) {
      loadDriveContents(currentFolderId, searchQuery);
    }
  }, [isOpen, accessToken, currentFolderId]);

  if (!isOpen) return null;

  // Handle Google Sign In
  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        await loadDriveContents('root');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed or popup was closed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setAccessToken(null);
    setFiles([]);
    setFolderHistory([{ id: 'root', name: 'My Drive' }]);
    setCurrentFolderId('root');
  };

  // Folder navigation
  const openFolder = (folderId: string, folderName: string) => {
    setFolderHistory(prev => [...prev, { id: folderId, name: folderName }]);
    setCurrentFolderId(folderId);
  };

  const navigateToHistory = (index: number) => {
    const target = folderHistory[index];
    setFolderHistory(prev => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  // Folder creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    setActionError(null);
    try {
      await createDriveFolder(newFolderName, currentFolderId);
      setNewFolderName('');
      setIsCreatingFolder(false);
      await loadDriveContents(currentFolderId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to create folder');
      setIsCreatingFolder(false);
    }
  };

  // File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setActionError(null);
    setUploadStatus(`Uploading ${file.name}...`);
    try {
      await uploadFileToDrive(file, currentFolderId);
      setUploadStatus(`Successfully uploaded "${file.name}" to Google Drive!`);
      setTimeout(() => setUploadStatus(null), 4000);
      await loadDriveContents(currentFolderId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to upload file to Google Drive');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Mandatory Confirmed Delete Operation
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteDriveFile(deleteTarget.id);
      setDeleteTarget(null);
      await loadDriveContents(currentFolderId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Order Invoice to Drive
  const handleExportOrderToDrive = async (order: Order) => {
    setExportingOrderId(order.id);
    setExportSuccessMsg(null);
    try {
      const invoiceContent = `
======================================================
                  APEXKIT SPORTS
      Official Order Invoice & Match Receipt
======================================================
Order Number:    ${order.orderNumber}
Date Placed:     ${new Date(order.createdAt).toLocaleString()}
Customer Name:   ${order.customer.fullName}
Mobile Phone:    ${order.customer.phone}
Delivery Area:   ${order.customer.district} (${order.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
Address:         ${order.customer.fullAddress}

------------------------------------------------------
ORDER ITEMS
------------------------------------------------------
${order.items.map((item, idx) => `
${idx + 1}. ${item.name}
   SKU:      ${item.sku}
   Size:     ${item.size} | Color: ${item.color}
   Quantity: ${item.quantity} x ৳${item.price} = ৳${item.itemTotal}
   ${item.customPrint ? `[Customized: "${item.customPrint.playerName} #${item.customPrint.playerNumber}"] (+৳${item.customPrint.extraCost})` : ''}
`).join('')}
------------------------------------------------------
Subtotal:        ৳${order.subtotal}
Coupon Discount: ৳${order.discount} ${order.couponCode ? `(Code: ${order.couponCode})` : ''}
Delivery Charge: ৳${order.deliveryFee}
------------------------------------------------------
TOTAL AMOUNT:    ৳${order.total} (Cash on Delivery)
Payment Status:  ${order.paymentStatus.toUpperCase()}
Fulfillment:     ${order.orderStatus.toUpperCase()}
======================================================
Thank you for sporting with ApexKit Bangladesh!
Support: support@apexkit.com | 01763-943446
======================================================
      `.trim();

      const fileName = `ApexKit_Invoice_${order.orderNumber}.txt`;
      await uploadTextToDrive(fileName, invoiceContent, 'text/plain', currentFolderId);
      setExportSuccessMsg(`Order invoice ${order.orderNumber} successfully saved to Google Drive!`);
      setTimeout(() => setExportSuccessMsg(null), 5000);
      await loadDriveContents(currentFolderId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to export invoice to Google Drive');
    } finally {
      setExportingOrderId(null);
    }
  };

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return '';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-zinc-100">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <HardDrive className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-display tracking-wide uppercase">
                  Google Drive Storage Hub
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  currentUser
                    ? 'bg-lime-400/10 text-lime-400 border-lime-400/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {currentUser ? 'Connected' : 'Permission Required'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Browse files, upload jersey crests, and export official matchday receipts directly to Google Drive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* 1. NOT AUTHENTICATED STATE: Official Sign In with Google */}
          {!currentUser ? (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-lime-400/20 text-white flex items-center justify-center mx-auto border border-zinc-800 shadow-xl">
                <HardDrive className="w-8 h-8 text-lime-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-display">
                  Connect Your Google Drive
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Sign in with your Google Account to access and organize sports files, custom jersey artwork, and order receipts with your direct permission.
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Official Google Sign-In Button */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <button
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white text-zinc-800 hover:bg-zinc-100 font-semibold text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{ minWidth: '220px', justifyContent: 'center' }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>

                <div className="flex items-center gap-2 mt-4 text-[11px] text-zinc-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                  <span>Tokens cached strictly in-memory per security guidelines</span>
                </div>
              </div>
            </div>
          ) : (
            /* 2. AUTHENTICATED DRIVE EXPLORER */
            <div className="space-y-6">
              
              {/* Account & Storage Status Banner */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-850 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border border-lime-400"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-lime-400 text-zinc-950 font-bold flex items-center justify-center text-sm">
                      {(currentUser.displayName || currentUser.email || 'G').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{currentUser.displayName || 'Google Workspace Account'}</span>
                      <span className="text-[10px] text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/30">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">{currentUser.email}</div>
                  </div>
                </div>

                {/* Storage Quota */}
                {storageQuota && storageQuota.limit && (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 gap-4">
                      <span>Google Drive Storage:</span>
                      <span className="font-mono text-white">
                        {(parseInt(storageQuota.usage || '0', 10) / (1024 * 1024 * 1024)).toFixed(1)} GB / {(parseInt(storageQuota.limit, 10) / (1024 * 1024 * 1024)).toFixed(0)} GB
                      </span>
                    </div>
                    <div className="w-44 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-lime-400 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((parseInt(storageQuota.usage || '0', 10) / parseInt(storageQuota.limit, 10)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-850">
                
                {/* Left: Breadcrumbs Navigation */}
                <div className="flex items-center gap-1.5 text-xs overflow-x-auto py-1">
                  {folderHistory.map((folder, idx) => (
                    <React.Fragment key={folder.id}>
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />}
                      <button
                        onClick={() => navigateToHistory(idx)}
                        className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 font-semibold ${
                          idx === folderHistory.length - 1
                            ? 'bg-zinc-800 text-lime-400'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>{folder.name}</span>
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Right: Actions (Search, New Folder, Upload) */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Drive files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadDriveContents(currentFolderId, searchQuery)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400 w-44 sm:w-56"
                    />
                  </div>

                  {/* Create Folder Button */}
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-lime-400" />
                    <span>New Folder</span>
                  </button>

                  {/* Upload File Input */}
                  <label className="px-3 py-1.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>

                  {/* Refresh Button */}
                  <button
                    onClick={() => loadDriveContents(currentFolderId, searchQuery)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin text-lime-400' : ''}`} />
                  </button>

                  {/* View Mode Toggle */}
                  <div className="bg-zinc-950 p-0.5 rounded-xl border border-zinc-800 flex items-center">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                    >
                      <ListIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Uploading Banner */}
              {uploadStatus && (
                <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/30 text-xs text-lime-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {/* Action Error Banner */}
              {actionError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{actionError}</span>
                  </div>
                  <button
                    onClick={() => setActionError(null)}
                    className="p-1 text-red-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Inline Folder Creation Form */}
              {isCreatingFolder && (
                <form onSubmit={handleCreateFolder} className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center gap-3">
                  <FolderPlus className="w-4 h-4 text-lime-400 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="Enter folder name (e.g. ApexKit Sports Receipts)..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-lime-400 text-zinc-950 font-bold text-xs rounded-lg hover:bg-lime-300 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-lg hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Export Order Receipts Hub */}
              {recentOrders.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-lime-400" />
                      <h4 className="text-xs font-bold text-white uppercase font-display tracking-wider">
                        Export Matchday Order Invoices to Drive
                      </h4>
                    </div>
                    {exportSuccessMsg && (
                      <span className="text-[11px] text-lime-400 font-semibold animate-fadeIn">
                        {exportSuccessMsg}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recentOrders.slice(0, 3).map(order => (
                      <div
                        key={order.id}
                        className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs hover:border-zinc-700 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{order.orderNumber}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">৳{order.total}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-[140px]">
                            {order.customer.fullName} · {order.items.length} items
                          </div>
                        </div>

                        <button
                          onClick={() => handleExportOrderToDrive(order)}
                          disabled={exportingOrderId === order.id}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Download className="w-3 h-3" />
                          <span>{exportingOrderId === order.id ? 'Saving...' : 'Save to Drive'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File List / Grid Display */}
              {isLoadingFiles ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-lime-400 animate-spin" />
                  <span className="text-xs text-zinc-400">Loading your Google Drive contents...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800">
                  <Folder className="w-10 h-10 text-zinc-600 mx-auto" />
                  <div className="text-xs font-bold text-zinc-400">This folder is empty</div>
                  <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                    Upload your custom jersey logos, vector graphics, or export order invoices directly into this Google Drive location.
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {files.map(file => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    const isImage = file.mimeType.startsWith('image/');

                    return (
                      <div
                        key={file.id}
                        onDoubleClick={() => isFolder && openFolder(file.id, file.name)}
                        className={`p-3.5 rounded-xl bg-zinc-900 border border-zinc-850 hover:border-zinc-700 transition-all flex flex-col justify-between group relative ${
                          isFolder ? 'cursor-pointer hover:bg-zinc-850/60' : ''
                        }`}
                      >
                        {/* Top: Icon or Thumbnail */}
                        <div className="h-24 rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden mb-2 relative">
                          {isFolder ? (
                            <Folder className="w-10 h-10 text-blue-400" />
                          ) : isImage && file.thumbnailLink ? (
                            <img
                              src={file.thumbnailLink}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-zinc-500" />
                          )}

                          {/* Quick Actions Overlay */}
                          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 rounded shadow"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(file);
                              }}
                              className="p-1 bg-zinc-900/90 hover:bg-red-500/20 text-red-400 rounded shadow"
                              title="Delete File"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div>
                          <div
                            onClick={() => isFolder && openFolder(file.id, file.name)}
                            className="font-bold text-xs text-white truncate hover:text-lime-400 transition-colors"
                            title={file.name}
                          >
                            {file.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 flex items-center justify-between mt-1 font-mono">
                            <span>{isFolder ? 'Folder' : formatFileSize(file.size)}</span>
                            <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW */
                <div className="overflow-x-auto rounded-xl border border-zinc-850">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Last Modified</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-zinc-300">
                      {files.map(file => {
                        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                        return (
                          <tr key={file.id} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="py-2.5 px-3">
                              <div
                                onClick={() => isFolder && openFolder(file.id, file.name)}
                                className={`flex items-center gap-2.5 font-semibold text-white ${
                                  isFolder ? 'cursor-pointer hover:text-lime-400' : ''
                                }`}
                              >
                                {isFolder ? (
                                  <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                )}
                                <span className="truncate max-w-xs">{file.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-zinc-400">
                              {isFolder ? 'Folder' : file.mimeType.split('/').pop()}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                              {isFolder ? '—' : formatFileSize(file.size)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500">
                              {new Date(file.modifiedTime).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {file.webViewLink && (
                                  <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                    title="Open in Google Drive"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  onClick={() => setDeleteTarget(file)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                  title="Delete File"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400" />
            <span>Google Drive API v3 · Authorized with User Consent</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>

      {/* ================= MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE OPERATIONS ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white font-display">
                Confirm Deletion from Google Drive
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-white font-mono">"{deleteTarget.name}"</span> from your Google Drive?
              </p>
              <p className="text-[11px] text-amber-400/90 font-medium">
                This action modifies your Google Drive storage.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete from Drive'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
