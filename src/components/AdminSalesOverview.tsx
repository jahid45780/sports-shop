import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Layers,
  Award,
  Sparkles,
  ArrowUpRight,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import type { Order, Product } from '../types/index.ts';

interface AdminSalesOverviewProps {
  orders: Order[];
  products: Product[];
  onNavigateToOrders?: () => void;
  onNavigateToProducts?: () => void;
}

type TimeRange = '7d' | '14d' | '30d' | 'all';
type MetricView = 'revenue' | 'orders';
type ProductRankMetric = 'units' | 'revenue';

const CATEGORY_COLORS: Record<string, string> = {
  'club-jerseys': '#a3e635',     // Lime
  'national-team': '#38bdf8',    // Sky
  'custom-jerseys': '#fbbf24',   // Amber
  'sports-tshirts': '#34d399',   // Emerald
  'retro-classics': '#f43f5e',   // Rose
  'shorts-apparel': '#a855f7',   // Purple
  'default': '#94a3b8'
};

const CATEGORY_LABELS: Record<string, string> = {
  'club-jerseys': 'Club Jerseys',
  'national-team': 'National Team',
  'custom-jerseys': 'Custom Jerseys',
  'sports-tshirts': 'Sports T-Shirts',
  'retro-classics': 'Retro Classics',
  'shorts-apparel': 'Shorts & Apparel'
};

export const AdminSalesOverview: React.FC<AdminSalesOverviewProps> = ({
  orders,
  products,
  onNavigateToOrders,
  onNavigateToProducts
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [metricView, setMetricView] = useState<MetricView>('revenue');
  const [productRankMetric, setProductRankMetric] = useState<ProductRankMetric>('units');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 1. Filter orders based on time range and non-cancelled status
  const validOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus !== 'cancelled');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const now = Date.now();
    let cutoffMs = 0;
    if (timeRange === '7d') cutoffMs = 7 * 86400000;
    else if (timeRange === '14d') cutoffMs = 14 * 86400000;
    else if (timeRange === '30d') cutoffMs = 30 * 86400000;

    if (cutoffMs === 0) return validOrders;

    return validOrders.filter(o => {
      const orderTime = new Date(o.createdAt).getTime();
      return now - orderTime <= cutoffMs;
    });
  }, [validOrders, timeRange]);

  // 2. High Level Metrics
  const summaryMetrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = filteredOrders.length;
    
    let totalUnitsSold = 0;
    let customPrintCount = 0;
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        totalUnitsSold += item.quantity;
        if (item.customPrint) customPrintCount += item.quantity;
      });
    });

    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
    const paidRevenue = filteredOrders
      .filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
    
    const customPrintRate = totalUnitsSold > 0 ? Math.round((customPrintCount / totalUnitsSold) * 100) : 0;

    return {
      totalRevenue,
      totalOrdersCount,
      totalUnitsSold,
      avgOrderValue,
      paidRevenue,
      customPrintRate,
      customPrintCount
    };
  }, [filteredOrders]);

  // 3. Daily Sales Trends Data for Recharts
  const dailySalesData = useMemo(() => {
    const dayMap = new Map<string, {
      date: string;
      label: string;
      revenue: number;
      orders: number;
      units: number;
      paidRevenue: number;
    }>();

    // Determine how many days to display on X axis
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 14;
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const isoKey = d.toISOString().slice(0, 10);
      const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap.set(isoKey, {
        date: isoKey,
        label: displayLabel,
        revenue: 0,
        orders: 0,
        units: 0,
        paidRevenue: 0
      });
    }

    filteredOrders.forEach(ord => {
      const isoKey = ord.createdAt.slice(0, 10);
      if (dayMap.has(isoKey)) {
        const entry = dayMap.get(isoKey)!;
        entry.revenue += ord.total;
        entry.orders += 1;
        if (ord.paymentStatus === 'paid' || ord.orderStatus === 'delivered') {
          entry.paidRevenue += ord.total;
        }
        ord.items.forEach(it => {
          entry.units += it.quantity;
        });
      }
    });

    return Array.from(dayMap.values()).map(d => ({
      ...d,
      avgOrderValue: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0
    }));
  }, [filteredOrders, timeRange]);

  // 4. Product Popularity based on real Order Data
  const productPopularityData = useMemo(() => {
    const popMap = new Map<string, {
      id: string;
      name: string;
      sku: string;
      image: string;
      category: string;
      unitsSold: number;
      revenue: number;
      orderCount: number;
      stock: number;
    }>();

    filteredOrders.forEach(ord => {
      ord.items.forEach(it => {
        const prodId = it.productId;
        const liveProd = products.find(p => p.id === prodId);
        const category = liveProd?.category || 'club-jerseys';
        const currentStock = liveProd ? liveProd.stock : 0;

        if (!popMap.has(prodId)) {
          popMap.set(prodId, {
            id: prodId,
            name: it.name,
            sku: it.sku,
            image: it.image,
            category,
            unitsSold: 0,
            revenue: 0,
            orderCount: 0,
            stock: currentStock
          });
        }

        const record = popMap.get(prodId)!;
        record.unitsSold += it.quantity;
        record.revenue += it.itemTotal;
        record.orderCount += 1;
      });
    });

    const list = Array.from(popMap.values());
    const totalRev = list.reduce((sum, p) => sum + p.revenue, 0) || 1;
    const totalUnits = list.reduce((sum, p) => sum + p.unitsSold, 0) || 1;

    let processed = list.map(item => ({
      ...item,
      shortName: item.name.length > 22 ? item.name.slice(0, 20) + '...' : item.name,
      revenueShare: Math.round((item.revenue / totalRev) * 100),
      unitShare: Math.round((item.unitsSold / totalUnits) * 100)
    }));

    if (selectedCategory !== 'all') {
      processed = processed.filter(p => p.category === selectedCategory);
    }

    if (productRankMetric === 'units') {
      processed.sort((a, b) => b.unitsSold - a.unitsSold);
    } else {
      processed.sort((a, b) => b.revenue - a.revenue);
    }

    return processed;
  }, [filteredOrders, products, selectedCategory, productRankMetric]);

  // 5. Category Breakdown Data for Pie Chart
  const categoryChartData = useMemo(() => {
    const catMap = new Map<string, { name: string; category: string; value: number; units: number }>();

    filteredOrders.forEach(ord => {
      ord.items.forEach(it => {
        const liveProd = products.find(p => p.id === it.productId);
        const catKey = liveProd?.category || 'club-jerseys';
        const label = CATEGORY_LABELS[catKey] || catKey;

        if (!catMap.has(catKey)) {
          catMap.set(catKey, {
            name: label,
            category: catKey,
            value: 0,
            units: 0
          });
        }

        const entry = catMap.get(catKey)!;
        entry.value += it.itemTotal;
        entry.units += it.quantity;
      });
    });

    const arr = Array.from(catMap.values());
    const totalCategoryRev = arr.reduce((s, c) => s + c.value, 0) || 1;

    return arr.map(c => ({
      ...c,
      share: Math.round((c.value / totalCategoryRev) * 100)
    })).sort((a, b) => b.value - a.value);
  }, [filteredOrders, products]);

  // 6. Delivery Zone & Fulfillment Breakdown
  const deliveryBreakdown = useMemo(() => {
    let insideDhaka = 0;
    let outsideDhaka = 0;
    let insideRev = 0;
    let outsideRev = 0;

    filteredOrders.forEach(ord => {
      if (ord.deliveryZone === 'inside_dhaka') {
        insideDhaka += 1;
        insideRev += ord.total;
      } else {
        outsideDhaka += 1;
        outsideRev += ord.total;
      }
    });

    const totalOrders = insideDhaka + outsideDhaka || 1;
    return {
      insideDhaka,
      outsideDhaka,
      insideRev,
      outsideRev,
      insidePercent: Math.round((insideDhaka / totalOrders) * 100),
      outsidePercent: Math.round((outsideDhaka / totalOrders) * 100)
    };
  }, [filteredOrders]);

  // Custom Dark Tooltip for Daily Trends
  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-950/95 border border-zinc-800 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[180px]">
          <div className="font-bold text-white flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-1.5">
            <span>{data.label}</span>
            <span className="text-[10px] text-zinc-400 font-mono">{data.date}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-lime-400" />
              Total Revenue:
            </span>
            <span className="font-mono font-bold text-lime-400">৳{data.revenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Orders Placed:
            </span>
            <span className="font-mono font-bold text-white">{data.orders}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Units Dispatched:
            </span>
            <span className="font-mono font-bold text-white">{data.units} items</span>
          </div>
          {data.orders > 0 && (
            <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-850 text-[11px]">
              <span>Avg Order Value:</span>
              <span className="font-mono text-zinc-200">৳{data.avgOrderValue.toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Product Popularity
  const CustomProductTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-950/95 border border-zinc-800 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center gap-2.5">
            <img
              src={data.image}
              alt={data.name}
              className="w-10 h-10 rounded-lg object-cover bg-zinc-900 border border-zinc-800 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-bold text-white truncate text-xs">{data.name}</div>
              <div className="text-[10px] text-zinc-400 font-mono">{data.sku}</div>
            </div>
          </div>
          <div className="space-y-1 pt-1 border-t border-zinc-800">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Units Sold:</span>
              <span className="font-bold text-lime-400 font-mono">{data.unitsSold} units</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Total Revenue:</span>
              <span className="font-bold text-white font-mono">৳{data.revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Share of Sales:</span>
              <span className="font-bold text-sky-400 font-mono">{data.revenueShare}%</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[10px]">
              <span>Current Stock:</span>
              <span className={data.stock <= 10 ? 'text-amber-400 font-semibold' : 'text-zinc-300'}>
                {data.stock} available
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-850 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase font-display tracking-wide">
              Sales Analytics & Performance
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Interactive daily sales trends and product popularity grounded in real customer orders
          </p>
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-zinc-500 ml-2 mr-1" />
          {(['7d', '14d', '30d', 'all'] as TimeRange[]).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all uppercase text-[11px] ${
                timeRange === t
                  ? 'bg-lime-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t === '7d' ? 'Last 7 Days' : t === '14d' ? '14 Days' : t === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Period Sales */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-2 relative overflow-hidden group hover:border-lime-400/30 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Total Period Sales</span>
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            ৳{summaryMetrics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Collected / Delivered:</span>
            <span className="font-mono text-lime-400 font-bold">৳{summaryMetrics.paidRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Order Volume */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-2 relative overflow-hidden group hover:border-sky-400/30 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Order Volume</span>
            <div className="w-8 h-8 rounded-lg bg-sky-400/10 text-sky-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {summaryMetrics.totalOrdersCount}
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Total Units Sold:</span>
            <span className="font-mono text-sky-400 font-bold">{summaryMetrics.totalUnitsSold} items</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-2 relative overflow-hidden group hover:border-amber-400/30 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Average Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            ৳{summaryMetrics.avgOrderValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400">
            Based on active customer orders
          </div>
        </div>

        {/* Custom Print Adoption */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-2 relative overflow-hidden group hover:border-purple-400/30 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Custom Jersey Print Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-400/10 text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {summaryMetrics.customPrintRate}%
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Customized Jerseies:</span>
            <span className="font-mono text-purple-400 font-bold">{summaryMetrics.customPrintCount} jerseys</span>
          </div>
        </div>
      </div>

      {/* ================= SECTION 1: DAILY SALES TRENDS (RECHARTS) ================= */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider">
                Daily Sales & Order Trend
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Visualizing revenue velocity and order volume over {timeRange === '7d' ? 'the past 7 days' : timeRange === '14d' ? 'the past 14 days' : timeRange === '30d' ? 'the past 30 days' : 'all recorded orders'}
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setMetricView('revenue')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                  metricView === 'revenue'
                    ? 'bg-zinc-800 text-lime-400 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Revenue (৳)
              </button>
              <button
                onClick={() => setMetricView('orders')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                  metricView === 'orders'
                    ? 'bg-zinc-800 text-sky-400 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Order Volume
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Area / Bar Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'revenue' ? (
              <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                  tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a3e635"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  name="Total Sales (৳)"
                />
                <Area
                  type="monotone"
                  dataKey="paidRevenue"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#paidGradient)"
                  name="Delivered / Paid (৳)"
                />
              </AreaChart>
            ) : (
              <BarChart data={dailySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomDailyTooltip />} />
                <Bar
                  dataKey="orders"
                  fill="#38bdf8"
                  radius={[6, 6, 0, 0]}
                  name="Orders"
                />
                <Bar
                  dataKey="units"
                  fill="#a3e635"
                  radius={[6, 6, 0, 0]}
                  name="Units Sold"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Metrics Footer */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-zinc-800 text-xs text-zinc-400 gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-lime-400" />
              <span>Gross Sales (৳)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-sky-400" />
              <span>Delivered / Collected (৳)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>Peak Daily Sales:</span>
            <span className="font-mono text-lime-400 font-bold">
              ৳{Math.max(...dailySalesData.map(d => d.revenue), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: PRODUCT POPULARITY & CATEGORY DISTRIBUTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Top Selling Products Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-lime-400" />
                  Product Popularity Leaderboard
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Top performing merchandise ranked by actual customer order volume
                </p>
              </div>

              {/* Toggle Rank Metric */}
              <div className="flex items-center gap-2">
                <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setProductRankMetric('units')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      productRankMetric === 'units'
                        ? 'bg-lime-400 text-zinc-950 shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    By Units Sold
                  </button>
                  <button
                    onClick={() => setProductRankMetric('revenue')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      productRankMetric === 'revenue'
                        ? 'bg-lime-400 text-zinc-950 shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    By Revenue (৳)
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-3 text-xs">
              <span className="text-zinc-500 text-[11px] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Category:
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Categories
              </button>
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setSelectedCategory(k)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-semibold transition-all ${
                    selectedCategory === k
                      ? 'bg-zinc-800 text-lime-400 border border-lime-400/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Recharts Horizontal Bar Chart */}
            <div className="h-72 w-full pt-2">
              {productPopularityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={productPopularityData.slice(0, 6)}
                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#27272a' }}
                      tickFormatter={(v) => productRankMetric === 'revenue' ? `৳${v}` : `${v}u`}
                    />
                    <YAxis
                      dataKey="shortName"
                      type="category"
                      stroke="#a1a1aa"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#27272a' }}
                      width={120}
                    />
                    <Tooltip content={<CustomProductTooltip />} />
                    <Bar
                      dataKey={productRankMetric === 'units' ? 'unitsSold' : 'revenue'}
                      fill="#a3e635"
                      radius={[0, 6, 6, 0]}
                    >
                      {productPopularityData.slice(0, 6).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.category] || '#a3e635'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                  No products matched the selected filters.
                </div>
              )}
            </div>
          </div>

          {/* Quick Note */}
          <div className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span>Bar color reflects merchandise sport category</span>
            {onNavigateToProducts && (
              <button
                onClick={onNavigateToProducts}
                className="text-lime-400 hover:underline font-semibold flex items-center gap-1"
              >
                Manage Inventory & Stock →
              </button>
            )}
          </div>
        </div>

        {/* Right 1 Col: Category Revenue Share Pie Chart */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Category Revenue Share
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Sales distribution across sport categories
              </p>
            </div>

            {/* Donut Chart */}
            <div className="h-52 w-full relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cat-cell-${index}`}
                        fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#09090b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Inner Center Label */}
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                  Top Category
                </span>
                <span className="text-xs font-black text-white block">
                  {categoryChartData[0]?.share || 0}%
                </span>
              </div>
            </div>

            {/* Category Legend List */}
            <div className="space-y-2 pt-2">
              {categoryChartData.slice(0, 4).map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }}
                    />
                    <span className="text-zinc-300 truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-zinc-400">৳{cat.value.toLocaleString()}</span>
                    <span className="text-lime-400 font-bold w-9 text-right">{cat.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Region Summary */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-lime-400" />
                Delivery Zones
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {deliveryBreakdown.insideDhaka + deliveryBreakdown.outsideDhaka} orders
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-lime-400 h-full transition-all duration-500"
                style={{ width: `${deliveryBreakdown.insidePercent}%` }}
                title={`Inside Dhaka: ${deliveryBreakdown.insidePercent}%`}
              />
              <div
                className="bg-sky-400 h-full transition-all duration-500"
                style={{ width: `${deliveryBreakdown.outsidePercent}%` }}
                title={`Outside Dhaka: ${deliveryBreakdown.outsidePercent}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-lime-400" />
                Inside Dhaka: {deliveryBreakdown.insidePercent}% (৳{deliveryBreakdown.insideRev.toLocaleString()})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Outside: {deliveryBreakdown.outsidePercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 3: DETAILED PRODUCT POPULARITY TABLE ================= */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider">
              Detailed Product Sales Performance
            </h3>
            <p className="text-xs text-zinc-400">
              Complete unit breakdown, gross revenue contribution, and real-time inventory level
            </p>
          </div>
          {onNavigateToOrders && (
            <button
              onClick={onNavigateToOrders}
              className="text-xs text-lime-400 hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
            >
              Inspect Order Records →
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-sans">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Product Name & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Units Sold</th>
                <th className="py-3 px-3 text-right">Total Revenue</th>
                <th className="py-3 px-3 text-right">Revenue Share</th>
                <th className="py-3 px-3 text-right">Live Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {productPopularityData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-3 px-3 font-sans">
                    <span className={`w-6 h-6 rounded-lg inline-flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-zinc-950'
                        : idx === 1
                        ? 'bg-zinc-300 text-zinc-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg object-cover bg-zinc-950 border border-zinc-800 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate max-w-xs">{item.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[item.category] || '#94a3b8'}20`,
                        color: CATEGORY_COLORS[item.category] || '#94a3b8'
                      }}
                    >
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-white tabular-nums">
                    {item.unitsSold} <span className="text-[10px] text-zinc-500 font-sans">units</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-lime-400 tabular-nums">
                    ৳{item.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="bg-lime-400 h-full rounded-full"
                          style={{ width: `${item.revenueShare}%` }}
                        />
                      </div>
                      <span className="font-bold text-zinc-300 text-[11px] w-8">{item.revenueShare}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.stock <= 5
                        ? 'bg-red-400/10 text-red-400 border border-red-400/30'
                        : item.stock <= 10
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {item.stock} left
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
