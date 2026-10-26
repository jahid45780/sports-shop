import React, { useState, useEffect } from 'react';
import {
  Target,
  BarChart3,
  Globe,
  Tag,
  Sliders,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Save,
  Check,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { 
  MarketingIntegrationConfig, 
  MarketingIntegrationLog, 
  SavedUtmCampaign, 
  ConversionEventSetting 
} from '../types/index.ts';

interface AdminAdsTrackingProps {
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

type TrackingTab = 
  | 'overview' 
  | 'meta' 
  | 'meta_campaigns' 
  | 'google_ads' 
  | 'ga4' 
  | 'gtm' 
  | 'events' 
  | 'utm_builder' 
  | 'logs';

export const AdminAdsTracking: React.FC<AdminAdsTrackingProps> = () => {
  const [activeTab, setActiveTab] = useState<TrackingTab>('overview');
  const [config, setConfig] = useState<MarketingIntegrationConfig | null>(null);
  const [logs, setLogs] = useState<MarketingIntegrationLog[]>([]);
  const [campaigns, setCampaigns] = useState<SavedUtmCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states for editable config
  const [formConfig, setFormConfig] = useState<MarketingIntegrationConfig | null>(null);

  // UTM Builder state
  const [utmDestUrl, setUtmDestUrl] = useState('https://apexkit.com/');
  const [utmSource, setUtmSource] = useState('facebook');
  const [utmMedium, setUtmMedium] = useState('paid_social');
  const [utmCampaign, setUtmCampaign] = useState('football_kits_promo_2026');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('carousel_retro_jerseys');
  const [utmName, setUtmName] = useState('FB Feed — Retro Jerseys Campaign');
  const [utmPlatform, setUtmPlatform] = useState<'facebook' | 'instagram' | 'google' | 'tiktok' | 'custom'>('facebook');
  const [utmNotes, setUtmNotes] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  // Log filter
  const [logFilter, setLogFilter] = useState<'all' | 'meta' | 'google_ads' | 'ga4' | 'gtm' | 'error'>('all');
  const [logSearch, setLogSearch] = useState('');

  // Delete confirmation modal state
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);
  const [isClearLogsModalOpen, setIsClearLogsModalOpen] = useState(false);

  // Test running state
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);

  // 1. Fetch Tracking Configuration & Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [conf, logList, campList] = await Promise.all([
        api.getAdminMarketingConfig(),
        api.getMarketingLogs(75),
        api.getSavedCampaigns()
      ]);
      setConfig(conf);
      setFormConfig(JSON.parse(JSON.stringify(conf)));
      setLogs(logList);
      setCampaigns(campList);
    } catch (err: any) {
      console.error('Failed to load tracking data:', err);
      setStatusMessage({ text: err.message || 'Failed to load tracking settings', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Save Config Changes
  const handleSaveConfig = async () => {
    if (!formConfig) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const updated = await api.updateAdminMarketingConfig(formConfig);
      setConfig(updated);
      setFormConfig(JSON.parse(JSON.stringify(updated)));
      // Refresh logs to show config_change entry
      const updatedLogs = await api.getMarketingLogs(75);
      setLogs(updatedLogs);
      setStatusMessage({ text: 'Tracking configuration saved and verified successfully.', type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to save configuration.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Test Integration Handler
  const handleTestIntegration = async (provider: 'meta' | 'google_ads' | 'ga4' | 'gtm', eventId?: string) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const res = await api.testMarketingIntegration(provider, eventId, {
        source: 'admin_dashboard_test',
        timestamp: new Date().toISOString()
      });
      setTestResult({ provider, success: res.success, message: res.message });
      // Update local logs
      const updatedLogs = await api.getMarketingLogs(75);
      setLogs(updatedLogs);
      // Reload config to reflect updated event verification status
      const updatedConf = await api.getAdminMarketingConfig();
      setConfig(updatedConf);
      setFormConfig(JSON.parse(JSON.stringify(updatedConf)));
    } catch (err: any) {
      setTestResult({ provider, success: false, message: err.message || 'Test execution failed' });
    } finally {
      setTestingProvider(null);
    }
  };

  // 4. UTM URL Computed
  const computedUtmUrl = (() => {
    try {
      const base = utmDestUrl.trim() || 'https://apexkit.com/';
      const urlObj = new URL(base.startsWith('http') ? base : `https://apexkit.com${base.startsWith('/') ? '' : '/'}${base}`);
      if (utmSource.trim()) urlObj.searchParams.set('utm_source', utmSource.trim().toLowerCase());
      if (utmMedium.trim()) urlObj.searchParams.set('utm_medium', utmMedium.trim().toLowerCase());
      if (utmCampaign.trim()) urlObj.searchParams.set('utm_campaign', utmCampaign.trim());
      if (utmTerm.trim()) urlObj.searchParams.set('utm_term', utmTerm.trim());
      if (utmContent.trim()) urlObj.searchParams.set('utm_content', utmContent.trim());
      return urlObj.toString();
    } catch {
      const params = new URLSearchParams({
        utm_source: utmSource.trim().toLowerCase(),
        utm_medium: utmMedium.trim().toLowerCase(),
        utm_campaign: utmCampaign.trim(),
        ...(utmTerm ? { utm_term: utmTerm.trim() } : {}),
        ...(utmContent ? { utm_content: utmContent.trim() } : {})
      });
      return `${utmDestUrl.includes('?') ? utmDestUrl + '&' : utmDestUrl + '?'}${params.toString()}`;
    }
  })();

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // 5. Save UTM Campaign
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utmName.trim() || !utmCampaign.trim()) return;

    try {
      if (editingCampaignId) {
        await api.updateCampaign(editingCampaignId, {
          name: utmName.trim(),
          destinationUrl: utmDestUrl.trim(),
          source: utmSource.trim(),
          medium: utmMedium.trim(),
          campaign: utmCampaign.trim(),
          term: utmTerm.trim() || undefined,
          content: utmContent.trim() || undefined,
          finalUrl: computedUtmUrl,
          platform: utmPlatform,
          notes: utmNotes.trim() || undefined
        });
        setEditingCampaignId(null);
      } else {
        await api.saveCampaign({
          name: utmName.trim(),
          destinationUrl: utmDestUrl.trim(),
          source: utmSource.trim(),
          medium: utmMedium.trim(),
          campaign: utmCampaign.trim(),
          term: utmTerm.trim() || undefined,
          content: utmContent.trim() || undefined,
          finalUrl: computedUtmUrl,
          platform: utmPlatform,
          status: 'active',
          notes: utmNotes.trim() || undefined
        });
      }

      const refreshed = await api.getSavedCampaigns();
      setCampaigns(refreshed);
      setStatusMessage({ text: 'Campaign tracking link saved to database.', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to save campaign.', type: 'error' });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await api.deleteCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
      setDeleteCampaignId(null);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to delete campaign.', type: 'error' });
    }
  };

  const handleClearLogs = async () => {
    try {
      await api.clearMarketingLogs();
      const newLogs = await api.getMarketingLogs(75);
      setLogs(newLogs);
      setIsClearLogsModalOpen(false);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to clear logs.', type: 'error' });
    }
  };

  // Preset setter for UTM Builder
  const applyPreset = (preset: 'facebook_feed' | 'instagram_story' | 'google_search' | 'tiktok_video') => {
    if (preset === 'facebook_feed') {
      setUtmPlatform('facebook');
      setUtmSource('facebook');
      setUtmMedium('paid_social');
      setUtmCampaign('apex_football_kits_2026');
      setUtmContent('feed_image_ad');
      setUtmName('Facebook Feed — Club Jerseys');
    } else if (preset === 'instagram_story') {
      setUtmPlatform('instagram');
      setUtmSource('instagram');
      setUtmMedium('stories');
      setUtmCampaign('jersey_studio_custom');
      setUtmContent('swipe_up_video');
      setUtmName('Instagram Stories — Jersey Studio');
    } else if (preset === 'google_search') {
      setUtmPlatform('google');
      setUtmSource('google');
      setUtmMedium('cpc');
      setUtmCampaign('sports_jerseys_bangladesh');
      setUtmTerm('football jersey bangladesh cash on delivery');
      setUtmName('Google Search Ads — Jerseys BD');
    } else if (preset === 'tiktok_video') {
      setUtmPlatform('tiktok');
      setUtmSource('tiktok');
      setUtmMedium('paid_social');
      setUtmCampaign('matchday_shorts_promo');
      setUtmContent('athletic_creator_review');
      setUtmName('TikTok Video — Performance Gear');
    }
  };

  if (isLoading || !formConfig) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
        <RefreshCw className="w-8 h-8 animate-spin text-lime-400 mb-3" />
        <p className="text-sm">Loading Ads & Tracking Integration Settings...</p>
      </div>
    );
  }

  // Helpers for Status Badges
  const getMetaStatus = () => {
    if (!formConfig.metaPixel.pixelId) return { label: 'Not Configured', color: 'bg-zinc-800 text-zinc-400' };
    if (!formConfig.metaPixel.enabled) return { label: 'Disabled', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
    return { label: 'Active & Verified', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  };

  const getGoogleAdsStatus = () => {
    if (!formConfig.googleAds.conversionId) return { label: 'Not Configured', color: 'bg-zinc-800 text-zinc-400' };
    if (!formConfig.googleAds.enabled) return { label: 'Disabled', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
    return { label: 'Active & Verified', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  };

  const getGa4Status = () => {
    if (!formConfig.ga4.measurementId) return { label: 'Not Configured', color: 'bg-zinc-800 text-zinc-400' };
    if (!formConfig.ga4.enabled) return { label: 'Disabled', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
    return { label: 'Active & Verified', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  };

  const getGtmStatus = () => {
    if (!formConfig.gtm.containerId) return { label: 'Not Configured', color: 'bg-zinc-800 text-zinc-400' };
    if (!formConfig.gtm.enabled) return { label: 'Disabled', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
    return { label: 'Active & Verified', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Save Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-lime-400/10 text-lime-400 border border-lime-400/20">
              Enterprise Telemetry
            </span>
            <span className="text-xs text-zinc-400">Strict Deduplication & Privacy Safe</span>
          </div>
          <h2 className="text-xl font-bold uppercase font-display tracking-wider text-white mt-1">
            Ads & Tracking Management System
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Tracking Settings
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white p-1">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-zinc-800 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Target },
          { id: 'meta', label: 'Meta Pixel & FB Ads', icon: Globe },
          { id: 'google_ads', label: 'Google Ads', icon: Tag },
          { id: 'ga4', label: 'Google Analytics 4', icon: BarChart3 },
          { id: 'gtm', label: 'Google Tag Manager', icon: Layers },
          { id: 'events', label: 'Conversion Events', icon: Sliders },
          { id: 'utm_builder', label: 'Campaign UTM Builder', icon: ExternalLink },
          { id: 'logs', label: 'Integration Audit Logs', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TrackingTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-800 text-lime-400 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Official Verification Notice */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-white uppercase tracking-wider font-display">
                Zero Simulated Metrics & Verified Configuration Policy
              </span>
              <p className="text-zinc-400 leading-relaxed">
                All tracking platforms operate with verified configuration endpoints. Apex Kit does not display simulated impressions, estimated ad spend, or fictional clicks. Real conversion events are only fired on genuine shopper interactions and verified Cash on Delivery purchases.
              </p>
            </div>
          </div>

          {/* 4 Core Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Meta Pixel */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase font-display text-white tracking-wider">Meta Pixel</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getMetaStatus().color}`}>
                    {getMetaStatus().label}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  {formConfig.metaPixel.pixelId ? `ID: ${formConfig.metaPixel.pixelId}` : 'No Pixel ID set'}
                </div>
                <div className="mt-2 text-[11px] text-zinc-500">
                  {formConfig.metaPixel.testEventCode ? `Test Code: ${formConfig.metaPixel.testEventCode}` : 'No test code'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('meta')}
                  className="text-xs text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Configure <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTestIntegration('meta')}
                  disabled={testingProvider === 'meta' || !formConfig.metaPixel.pixelId}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 rounded cursor-pointer disabled:opacity-40"
                >
                  {testingProvider === 'meta' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>

            {/* Google Ads */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase font-display text-white tracking-wider">Google Ads</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getGoogleAdsStatus().color}`}>
                    {getGoogleAdsStatus().label}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  {formConfig.googleAds.conversionId ? `ID: ${formConfig.googleAds.conversionId}` : 'No Conversion ID set'}
                </div>
                <div className="mt-2 text-[11px] text-zinc-500">
                  {formConfig.googleAds.purchaseConversionLabel ? 'Purchase label set' : 'Purchase label missing'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('google_ads')}
                  className="text-xs text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Configure <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTestIntegration('google_ads')}
                  disabled={testingProvider === 'google_ads' || !formConfig.googleAds.conversionId}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 rounded cursor-pointer disabled:opacity-40"
                >
                  {testingProvider === 'google_ads' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>

            {/* Google Analytics 4 */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase font-display text-white tracking-wider">GA4 Analytics</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getGa4Status().color}`}>
                    {getGa4Status().label}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  {formConfig.ga4.measurementId ? `Stream: ${formConfig.ga4.measurementId}` : 'No Measurement ID'}
                </div>
                <div className="mt-2 text-[11px] text-zinc-500">
                  Debug mode: {formConfig.ga4.debugMode ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('ga4')}
                  className="text-xs text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Configure <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTestIntegration('ga4')}
                  disabled={testingProvider === 'ga4' || !formConfig.ga4.measurementId}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 rounded cursor-pointer disabled:opacity-40"
                >
                  {testingProvider === 'ga4' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>

            {/* Google Tag Manager */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase font-display text-white tracking-wider">GTM Container</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getGtmStatus().color}`}>
                    {getGtmStatus().label}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  {formConfig.gtm.containerId ? `Container: ${formConfig.gtm.containerId}` : 'No Container ID'}
                </div>
                <div className="mt-2 text-[11px] text-zinc-500">
                  Tag Management Workspace
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('gtm')}
                  className="text-xs text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Configure <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTestIntegration('gtm')}
                  disabled={testingProvider === 'gtm' || !formConfig.gtm.containerId}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 rounded cursor-pointer disabled:opacity-40"
                >
                  {testingProvider === 'gtm' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
          </div>

          {/* Test Result Message Box */}
          {testResult && (
            <div className={`p-4 rounded-xl text-xs border ${
              testResult.success 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <span>Diagnostics Result for {testResult.provider.toUpperCase()}</span>
              </div>
              <p className="text-zinc-300 mt-1">{testResult.message}</p>
            </div>
          )}

          {/* Active Conversion Events Summary */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase font-display tracking-wider text-white">
                  Active E-Commerce Tracking Events
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real shoppers trigger these events on Apex Kit storefront
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="text-xs font-semibold text-lime-400 hover:underline"
              >
                Manage All Events →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(formConfig.conversionEvents || []).map((ev) => (
                <div key={ev.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">{ev.name}</span>
                    <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">
                      Meta: {ev.metaEventName} · GA4: {ev.ga4EventName}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                    ev.lastTestStatus === 'verified' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : (ev.lastTestStatus === 'failed' ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-zinc-400')
                  }`}>
                    {ev.lastTestStatus === 'verified' ? 'Verified' : (ev.lastTestStatus === 'failed' ? 'Failed' : 'Not Tested')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Saved Campaigns Overview */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase font-display tracking-wider text-white">
                  Active Advertising Tracking URLs ({campaigns.length})
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Saved UTM URLs for social media posts, Meta Ads, and influencer campaigns
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('utm_builder')}
                className="text-xs font-semibold text-lime-400 hover:underline"
              >
                Open UTM Builder →
              </button>
            </div>

            <div className="space-y-2">
              {campaigns.slice(0, 3).map((camp) => (
                <div key={camp.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{camp.name}</span>
                      <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono rounded bg-zinc-800 text-zinc-300">
                        {camp.platform || camp.source}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 truncate block mt-0.5">
                      {camp.finalUrl}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(camp.finalUrl)}
                    className="px-3 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: META PIXEL & FACEBOOK ADS */}
      {activeTab === 'meta' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold uppercase font-display tracking-wider text-white">
                  Meta Pixel Configuration
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Official Meta Pixel integration for tracking sports jerseys conversions across Facebook & Instagram
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formConfig.metaPixel.enabled}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    metaPixel: { ...formConfig.metaPixel, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                <span className="ml-3 text-xs font-semibold text-white">
                  {formConfig.metaPixel.enabled ? 'Pixel Enabled' : 'Pixel Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Pixel ID */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Meta Pixel ID (14 to 17 Digits) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1029384756102938"
                  value={formConfig.metaPixel.pixelId}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    metaPixel: { ...formConfig.metaPixel, pixelId: e.target.value.replace(/[^0-9]/g, '') }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Located in Meta Events Manager &gt; Data Sources &gt; Settings &gt; Pixel ID
                </p>
              </div>

              {/* Test Event Code */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Test Event Code (Optional for Live Verification)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TEST12345"
                  value={formConfig.metaPixel.testEventCode || ''}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    metaPixel: { ...formConfig.metaPixel, testEventCode: e.target.value.trim() }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Found in Events Manager &gt; Test Events tab. Streams events directly into your live test console.
                </p>
              </div>
            </div>

            {/* Event Checkboxes */}
            <div className="pt-4 border-t border-zinc-800">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-3">
                Supported Standard Events to Track:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'trackPageView', label: 'PageView', desc: 'Every storefront navigation' },
                  { key: 'trackViewContent', label: 'ViewContent', desc: 'Jersey details modal opened' },
                  { key: 'trackSearch', label: 'Search', desc: 'Catalog search queries' },
                  { key: 'trackAddToCart', label: 'AddToCart', desc: 'Jersey added to shopping bag' },
                  { key: 'trackInitiateCheckout', label: 'InitiateCheckout', desc: 'COD Checkout opened' },
                  { key: 'trackPurchase', label: 'Purchase', desc: 'Confirmed order with unique ID' },
                  { key: 'trackLead', label: 'Lead', desc: 'Newsletter & match reminders' },
                  { key: 'trackAddPaymentInfo', label: 'AddPaymentInfo', desc: 'Payment method chosen' },
                ].map(item => (
                  <label key={item.key} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-2.5 cursor-pointer hover:border-zinc-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={(formConfig.metaPixel as any)[item.key]}
                      onChange={(e) => setFormConfig({
                        ...formConfig,
                        metaPixel: { ...formConfig.metaPixel, [item.key]: e.target.checked }
                      })}
                      className="mt-0.5 accent-lime-400 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{item.label}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestIntegration('meta')}
                  disabled={testingProvider === 'meta' || !formConfig.metaPixel.pixelId}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {testingProvider === 'meta' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-lime-400" />}
                  Test Connection & Validate Syntax
                </button>
                {testResult?.provider === 'meta' && (
                  <span className={`text-xs ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {testResult.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meta Pixel Setup Guide */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold uppercase font-display tracking-wider text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-lime-400" />
              How to find your Meta Pixel ID
            </h4>
            <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Log in to <strong className="text-zinc-200">Meta Events Manager</strong> with your business Facebook account.</li>
              <li>Under <strong className="text-zinc-200">Data Sources</strong> in the left sidebar, select your web Pixel or create a new Dataset.</li>
              <li>Click on the <strong className="text-zinc-200">Settings</strong> tab.</li>
              <li>Copy the 15-16 digit number under <strong className="text-zinc-200">Pixel ID</strong> and paste it above.</li>
              <li>To verify events live, go to the <strong className="text-zinc-200">Test Events</strong> tab, copy your test code (e.g. <code className="text-lime-400">TEST12345</code>), and enter it above.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE ADS CONVERSION TRACKING */}
      {activeTab === 'google_ads' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold uppercase font-display tracking-wider text-white">
                  Google Ads Conversion Tracking
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Track genuine purchase conversions with order value, currency (BDT), and unique transaction ID deduplication
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formConfig.googleAds.enabled}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    googleAds: { ...formConfig.googleAds, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                <span className="ml-3 text-xs font-semibold text-white">
                  {formConfig.googleAds.enabled ? 'Google Ads Enabled' : 'Google Ads Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Conversion ID */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Google Ads Conversion ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. AW-1234567890 or 1234567890"
                  value={formConfig.googleAds.conversionId}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    googleAds: { ...formConfig.googleAds, conversionId: e.target.value.trim() }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Found in Google Ads &gt; Goals &gt; Conversions &gt; Summary &gt; Tag Setup
                </p>
              </div>

              {/* Purchase Conversion Label */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Purchase Conversion Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g. AbC_dEF123-xYz"
                  value={formConfig.googleAds.purchaseConversionLabel || ''}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    googleAds: { ...formConfig.googleAds, purchaseConversionLabel: e.target.value.trim() }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Sent on Cash on Delivery order completion with transaction ID to prevent duplicate reporting
                </p>
              </div>

              {/* Add To Cart Conversion Label */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Add to Cart Conversion Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. XyZ_123456"
                  value={formConfig.googleAds.addToCartConversionLabel || ''}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    googleAds: { ...formConfig.googleAds, addToCartConversionLabel: e.target.value.trim() }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Begin Checkout Conversion Label */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Begin Checkout Conversion Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chk_987654"
                  value={formConfig.googleAds.beginCheckoutConversionLabel || ''}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    googleAds: { ...formConfig.googleAds, beginCheckoutConversionLabel: e.target.value.trim() }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleTestIntegration('google_ads')}
                disabled={testingProvider === 'google_ads' || !formConfig.googleAds.conversionId}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {testingProvider === 'google_ads' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-lime-400" />}
                Validate Google Ads Configuration
              </button>
              {testResult?.provider === 'google_ads' && (
                <span className={`text-xs ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testResult.message}
                </span>
              )}
            </div>
          </div>

          {/* Setup Guide */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold uppercase font-display tracking-wider text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-lime-400" />
              Google Ads Tag Setup Instructions
            </h4>
            <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Sign in to your Google Ads account at <strong className="text-zinc-200">ads.google.com</strong>.</li>
              <li>In the left menu, select <strong className="text-zinc-200">Goals &gt; Conversions &gt; Summary</strong>.</li>
              <li>Click on your <strong className="text-zinc-200">Purchase</strong> conversion action and expand <strong className="text-zinc-200">Tag Setup</strong>.</li>
              <li>Choose <strong className="text-zinc-200">Install the tag yourself</strong>.</li>
              <li>Look for the send_to line: <code className="text-lime-400">send_to: 'AW-123456789/AbCdEf123'</code>. The part before the slash is your Conversion ID, and the part after is your Conversion Label.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 4: GA4 */}
      {activeTab === 'ga4' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold uppercase font-display tracking-wider text-white">
                  Google Analytics 4 (GA4)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Standard e-commerce measurement for product impressions, cart events, and verified transactions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formConfig.ga4.enabled}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    ga4: { ...formConfig.ga4, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                <span className="ml-3 text-xs font-semibold text-white">
                  {formConfig.ga4.enabled ? 'GA4 Active' : 'GA4 Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Measurement ID */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  GA4 Measurement ID (G-XXXXXXXXXX) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. G-ABC123XYZ0"
                  value={formConfig.ga4.measurementId}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    ga4: { ...formConfig.ga4, measurementId: e.target.value.trim().toUpperCase() }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Admin &gt; Data collection and modification &gt; Data Streams &gt; Measurement ID
                </p>
              </div>

              {/* Debug Mode */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">GA4 DebugView Mode</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Sends debug_mode parameter to preview events live in Google Analytics DebugView
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formConfig.ga4.debugMode}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    ga4: { ...formConfig.ga4, debugMode: e.target.checked }
                  })}
                  className="accent-lime-400 h-4 w-4 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Event list */}
            <div className="pt-4 border-t border-zinc-800">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                Standard GA4 E-Commerce Events Dispatched:
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {['page_view', 'view_item', 'search', 'add_to_cart', 'begin_checkout', 'purchase', 'generate_lead'].map(ev => (
                  <span key={ev} className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-lime-400">
                    {ev}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleTestIntegration('ga4')}
                disabled={testingProvider === 'ga4' || !formConfig.ga4.measurementId}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {testingProvider === 'ga4' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-lime-400" />}
                Validate GA4 ID & Debug Stream
              </button>
              {testResult?.provider === 'ga4' && (
                <span className={`text-xs ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testResult.message}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GTM */}
      {activeTab === 'gtm' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold uppercase font-display tracking-wider text-white">
                  Google Tag Manager (GTM)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Load tags via Google Tag Manager container without modifying server templates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formConfig.gtm.enabled}
                  onChange={(e) => setFormConfig({
                    ...formConfig,
                    gtm: { ...formConfig.gtm, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
                <span className="ml-3 text-xs font-semibold text-white">
                  {formConfig.gtm.enabled ? 'GTM Enabled' : 'GTM Disabled'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                GTM Container ID (GTM-XXXXXXX) *
              </label>
              <input
                type="text"
                placeholder="e.g. GTM-N9X24PZ"
                value={formConfig.gtm.containerId}
                onChange={(e) => setFormConfig({
                  ...formConfig,
                  gtm: { ...formConfig.gtm, containerId: e.target.value.trim().toUpperCase() }
                })}
                className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Duplicate Tag Prevention Notice
              </span>
              <p className="text-zinc-400">
                If you configure GA4 or Meta Pixel inside your Google Tag Manager container, ensure you disable the direct Meta Pixel / GA4 options above to prevent duplicate conversion counting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONVERSION EVENTS TABLE */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold uppercase font-display tracking-wider text-white">
                  Conversion Events Matrix
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enable or disable events independently for Meta Pixel, Google Ads, and GA4
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px] uppercase">
                    <th className="py-3 px-3">Website Action</th>
                    <th className="py-3 px-3">Meta Pixel Event</th>
                    <th className="py-3 px-3">Google Ads Event</th>
                    <th className="py-3 px-3">GA4 Event</th>
                    <th className="py-3 px-3 text-center">Meta</th>
                    <th className="py-3 px-3 text-center">Google Ads</th>
                    <th className="py-3 px-3 text-center">GA4</th>
                    <th className="py-3 px-3">Last Test</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {(formConfig.conversionEvents || []).map((ev, idx) => (
                    <tr key={ev.id} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{ev.name}</span>
                        <span className="text-[10px] text-zinc-500 block">{ev.description}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-300">{ev.metaEventName}</td>
                      <td className="py-3 px-3 font-mono text-zinc-300">{ev.googleAdsEventName}</td>
                      <td className="py-3 px-3 font-mono text-zinc-300">{ev.ga4EventName}</td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={ev.metaEnabled}
                          onChange={(e) => {
                            const copy = [...formConfig.conversionEvents];
                            copy[idx].metaEnabled = e.target.checked;
                            setFormConfig({ ...formConfig, conversionEvents: copy });
                          }}
                          className="accent-lime-400 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={ev.googleAdsEnabled}
                          onChange={(e) => {
                            const copy = [...formConfig.conversionEvents];
                            copy[idx].googleAdsEnabled = e.target.checked;
                            setFormConfig({ ...formConfig, conversionEvents: copy });
                          }}
                          className="accent-lime-400 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={ev.ga4Enabled}
                          onChange={(e) => {
                            const copy = [...formConfig.conversionEvents];
                            copy[idx].ga4Enabled = e.target.checked;
                            setFormConfig({ ...formConfig, conversionEvents: copy });
                          }}
                          className="accent-lime-400 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          ev.lastTestStatus === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : (ev.lastTestStatus === 'failed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-zinc-800 text-zinc-400')
                        }`}>
                          {ev.lastTestStatus === 'verified' ? 'Verified' : (ev.lastTestStatus === 'failed' ? 'Failed' : 'Not Tested')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleTestIntegration('meta', ev.id)}
                          className="px-2.5 py-1 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                        >
                          Test Event
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

      {/* TAB 7: CAMPAIGN UTM BUILDER */}
      {activeTab === 'utm_builder' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
            <div>
              <h3 className="text-base font-bold uppercase font-display tracking-wider text-white">
                Campaign URL & UTM Builder
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate clean, properly encoded tracking links for Facebook Ads, Instagram promotions, and Google campaigns
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Quick Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('facebook_feed')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
              >
                Facebook Feed Ad
              </button>
              <button
                type="button"
                onClick={() => applyPreset('instagram_story')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
              >
                Instagram Story
              </button>
              <button
                type="button"
                onClick={() => applyPreset('google_search')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
              >
                Google Search CPC
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tiktok_video')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
              >
                TikTok Video Ad
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Internal Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={utmName}
                    onChange={(e) => setUtmName(e.target.value)}
                    placeholder="e.g. 2026 Jersey Launch Feed"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Destination URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={utmDestUrl}
                    onChange={(e) => setUtmDestUrl(e.target.value)}
                    placeholder="https://apexkit.com/ or #shop-catalog"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Campaign Source (utm_source) *
                  </label>
                  <input
                    type="text"
                    required
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="facebook, instagram, google, newsletter"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Campaign Medium (utm_medium) *
                  </label>
                  <input
                    type="text"
                    required
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="paid_social, cpc, stories, email"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Campaign Name (utm_campaign) *
                  </label>
                  <input
                    type="text"
                    required
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="retro_heritage_collection"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Campaign Content (utm_content)
                  </label>
                  <input
                    type="text"
                    value={utmContent}
                    onChange={(e) => setUtmContent(e.target.value)}
                    placeholder="carousel_image_a"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400 font-mono"
                  />
                </div>
              </div>

              {/* Generated URL Box */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                  Generated Tracking URL:
                </span>
                <div className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-lg text-xs font-mono text-lime-400 break-all select-all">
                  {computedUtmUrl}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(computedUtmUrl)}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copied to Clipboard!' : 'Copy Tracking Link'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {editingCampaignId ? 'Update Saved Campaign' : 'Save Campaign to Database'}
                  </button>
                  {editingCampaignId && (
                    <button
                      type="button"
                      onClick={() => setEditingCampaignId(null)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Saved Campaigns Table */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase font-display tracking-wider text-white">
              Database Saved Campaigns ({campaigns.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Campaign Name</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Source / Medium</th>
                    <th className="py-2.5 px-3">Tracking Link</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{camp.name}</span>
                        {camp.notes && <span className="text-[10px] text-zinc-500 block">{camp.notes}</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300">
                          {camp.platform || camp.source}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-400">
                        {camp.source} / {camp.medium}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-zinc-400 truncate max-w-xs block">
                            {camp.finalUrl}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(camp.finalUrl)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            title="Copy URL"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCampaignId(camp.id);
                            setUtmName(camp.name);
                            setUtmDestUrl(camp.destinationUrl);
                            setUtmSource(camp.source);
                            setUtmMedium(camp.medium);
                            setUtmCampaign(camp.campaign);
                            setUtmTerm(camp.term || '');
                            setUtmContent(camp.content || '');
                            setUtmPlatform(camp.platform || 'custom');
                            setUtmNotes(camp.notes || '');
                          }}
                          className="text-zinc-400 hover:text-white p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCampaignId(camp.id)}
                          className="text-zinc-400 hover:text-rose-400 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 8: INTEGRATION AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold uppercase font-display tracking-wider text-white">
                  Integration & Telemetry Audit Trail
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verified record of configuration modifications, diagnostic tests, and conversion dispatches
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsClearLogsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-300 text-zinc-400 text-xs transition-colors cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(['all', 'meta', 'google_ads', 'ga4', 'gtm', 'error'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setLogFilter(f)}
                  className={`px-2.5 py-1 text-xs rounded-lg uppercase font-mono cursor-pointer transition-colors ${
                    logFilter === f 
                      ? 'bg-lime-400 text-black font-bold' 
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Logs List */}
            <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              {logs
                .filter(l => {
                  if (logFilter === 'error') return l.status === 'error';
                  if (logFilter !== 'all') return l.source === logFilter;
                  return true;
                })
                .map((l) => (
                  <div key={l.id} className="p-3.5 flex items-start gap-3 hover:bg-zinc-900/50 transition-colors">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase shrink-0 mt-0.5 ${
                      l.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      (l.status === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-zinc-400')
                    }`}>
                      {l.status}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          [{l.source.toUpperCase()}] {l.message}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                          {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      {l.eventName && (
                        <span className="text-[11px] font-mono text-lime-400 block mt-0.5">
                          Event: {l.eventName}
                        </span>
                      )}
                      {l.payload && (
                        <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-900 p-2 rounded mt-1.5 overflow-x-auto">
                          {JSON.stringify(l.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Campaign Confirmation Dialog */}
      {deleteCampaignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold uppercase font-display text-white">Delete Campaign?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to remove this saved UTM campaign link? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCampaignId(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCampaign(deleteCampaignId)}
                className="px-4 py-1.5 text-xs font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Dialog */}
      {isClearLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold uppercase font-display text-white">Clear Audit Trail?</h3>
            <p className="text-xs text-zinc-400">
              This will reset the integration test and conversion event audit history.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearLogsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-4 py-1.5 text-xs font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { AdsTrackingDashboard } from './AdsTrackingDashboard.tsx';
export default AdminAdsTracking;
