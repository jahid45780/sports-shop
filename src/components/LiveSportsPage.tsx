import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  RefreshCw, 
  Search, 
  Clock, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Shirt,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { SportMatch, SportType, MatchStatus } from '../types/index.ts';
import { MatchDetailsModal } from './MatchDetailsModal.tsx';

interface LiveSportsPageProps {
  onShopCategory: (category: string) => void;
  onOpenJerseyStudio?: () => void;
}

const POPULAR_LEAGUES = [
  { id: 'all', label: 'All Competitions' },
  { id: 'premier league', label: 'Premier League' },
  { id: 'la liga', label: 'La Liga' },
  { id: 'champions league', label: 'Champions League' },
  { id: 'nba', label: 'NBA Basketball' },
  { id: 'cricket', label: 'Cricket Leagues' }
];

export const LiveSportsPage: React.FC<LiveSportsPageProps> = ({
  onShopCategory,
  onOpenJerseyStudio
}) => {
  const [matches, setMatches] = useState<SportMatch[]>([]);
  const [activeSport, setActiveSport] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activeLeague, setActiveLeague] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [liveCount, setLiveCount] = useState<number>(0);
  const [upcomingCount, setUpcomingCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Match details modal state
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<SportMatch | null>(null);

  // Polling ref
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMatches = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const data = await api.getLiveSportsFeed({
        sport: activeSport,
        status: activeStatus,
        league: activeLeague,
        search: searchQuery
      });

      setMatches(data.matches || []);
      setLiveCount(data.liveCount || 0);
      setUpcomingCount(data.upcomingCount || 0);
      setCompletedCount(data.completedCount || 0);
      setLastUpdated(data.lastUpdated || new Date().toISOString());
    } catch (err: any) {
      console.error('Error fetching live sports feed:', err);
      if (!isBackground) {
        setError('Temporarily unable to update live match stream. Showing latest retrieved results.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeSport, activeStatus, activeLeague, searchQuery]);

  // Initial load & filter change
  useEffect(() => {
    fetchMatches(false);
  }, [fetchMatches]);

  // Polling interval: 45 seconds (pauses when page is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMatches(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    pollTimerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMatches(true);
      }
    }, 45 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchMatches]);

  const handleOpenDetails = (match: SportMatch) => {
    setSelectedMatch(match);
    setSelectedMatchId(match.id);
  };

  const handleShopTeam = (teamName: string, sport: string) => {
    if (sport === 'cricket') {
      onShopCategory('sports-tshirts');
    } else {
      onShopCategory('club-jerseys');
    }
    setTimeout(() => {
      const catalog = document.getElementById('shop-catalog');
      if (catalog) {
        catalog.scrollIntoView({ behavior: 'smooth' });
        const input = catalog.querySelector('input') as HTMLInputElement | null;
        if (input) {
          input.value = teamName;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, 100);
  };

  const formatLastUpdatedTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const formatKickoffTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Partition matches
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const completedMatches = matches.filter(m => m.status === 'completed');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================================= */}
        {/* 1. HERO HEADER                                            */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-850">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Live Sports & Scores</span>
              </span>
              {liveCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{liveCount} Live Now</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-display">
              Live Sports Match Center
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Real-time match scores, ongoing fixtures, and certified results for Football, Cricket, and Basketball.
            </p>
          </div>

          {/* Telemetry Status & Manual Refresh Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-end text-right hidden sm:block">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Telemetry Stream</span>
              </div>
              {lastUpdated && (
                <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                  Updated: {formatLastUpdatedTime(lastUpdated)}
                </span>
              )}
            </div>

            <button
              onClick={() => fetchMatches(false)}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-60 min-h-[44px]"
              title="Refresh live match scores"
            >
              <RefreshCw className={`w-4 h-4 text-lime-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SPORT & STATUS FILTER BAR                              */}
        {/* ========================================================= */}
        <div className="space-y-4">
          
          {/* Main Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Sport Category Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-850 rounded-xl overflow-x-auto">
              {[
                { id: 'all', label: 'All Sports' },
                { id: 'football', label: 'Football / Soccer' },
                { id: 'cricket', label: 'Cricket' },
                { id: 'basketball', label: 'Basketball (NBA)' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSport(s.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[40px] flex items-center gap-1.5 ${
                    activeSport === s.id
                      ? 'bg-lime-400 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Status Tabs (All, Live, Upcoming, Finished) */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-850 rounded-xl overflow-x-auto">
              {[
                { id: 'all', label: 'All Matches', count: liveCount + upcomingCount + completedCount },
                { id: 'live', label: 'Live Now', count: liveCount, isLiveBadge: true },
                { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
                { id: 'completed', label: 'Finished', count: completedCount }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveStatus(t.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[40px] flex items-center gap-1.5 ${
                    activeStatus === t.id
                      ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  {t.isLiveBadge && liveCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      activeStatus === t.id ? 'bg-zinc-700 text-lime-400' : 'bg-zinc-850 text-zinc-500'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

          </div>

          {/* Search & Popular Leagues Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Popular Leagues Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mr-1 shrink-0">
                Leagues:
              </span>
              {POPULAR_LEAGUES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLeague(l.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors whitespace-nowrap ${
                    activeLeague === l.id
                      ? 'bg-zinc-800 border-lime-400/40 text-lime-400 font-semibold'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Match Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search team, stadium, league..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-lime-400 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Error banner if telemetry temporarily disconnected */}
        {error && (
          <div className="p-4 bg-zinc-900 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300 gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchMatches(false)}
              className="px-3 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 rounded-lg font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. MATCH CARDS SECTIONS                                   */}
        {/* ========================================================= */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="p-5 bg-zinc-900/60 border border-zinc-850 rounded-2xl animate-pulse space-y-4">
                <div className="flex justify-between">
                  <div className="w-24 h-4 bg-zinc-800 rounded" />
                  <div className="w-16 h-4 bg-zinc-800 rounded" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="w-20 h-5 bg-zinc-800 rounded" />
                  <div className="w-12 h-6 bg-zinc-800 rounded" />
                  <div className="w-20 h-5 bg-zinc-800 rounded" />
                </div>
                <div className="w-full h-3 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* ------------------------------------------------------- */}
            {/* LIVE MATCHES SECTION                                    */}
            {/* ------------------------------------------------------- */}
            {(activeStatus === 'all' || activeStatus === 'live') && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-display">
                    Ongoing Live Matches ({liveMatches.length})
                  </h2>
                </div>

                {liveMatches.length === 0 ? (
                  <div className="p-8 bg-zinc-900/40 border border-zinc-850 rounded-2xl text-center space-y-2">
                    <p className="text-zinc-300 font-medium text-sm">
                      No live matches right now. Check upcoming fixtures.
                    </p>
                    <p className="text-xs text-zinc-500">
                      Live scoreboards automatically update the moment scheduled matches kick off.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        onClick={() => handleOpenDetails(m)}
                        onShop={() => handleShopTeam(m.homeTeam.name, m.sport)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* UPCOMING MATCHES SECTION                                */}
            {/* ------------------------------------------------------- */}
            {(activeStatus === 'all' || activeStatus === 'upcoming') && upcomingMatches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-display flex items-center gap-2">
                    <Clock className="w-4 h-4 text-lime-400" />
                    <span>Upcoming Fixtures & Schedule ({upcomingMatches.length})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      onClick={() => handleOpenDetails(m)}
                      onShop={() => handleShopTeam(m.homeTeam.name, m.sport)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* RECENT COMPLETED RESULTS SECTION                        */}
            {/* ------------------------------------------------------- */}
            {(activeStatus === 'all' || activeStatus === 'completed') && completedMatches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white font-display flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Recent Completed Results ({completedMatches.length})</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      onClick={() => handleOpenDetails(m)}
                      onShop={() => handleShopTeam(m.homeTeam.name, m.sport)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty Search Result State */}
            {matches.length === 0 && (
              <div className="p-12 bg-zinc-900/40 border border-zinc-850 rounded-3xl text-center space-y-3">
                <Trophy className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No matches found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  No sports matches matched your current search or sport filter. Try selecting "All Sports" or clearing search keywords.
                </p>
                <button
                  onClick={() => {
                    setActiveSport('all');
                    setActiveStatus('all');
                    setActiveLeague('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-lime-400 text-zinc-950 font-bold text-xs rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* 4. CONTEXTUAL E-COMMERCE ADJACENCY BANNER                */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-lime-400/30 rounded-3xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-400/10 border border-lime-400/30 rounded-full text-lime-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Matchday Kits</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-display tracking-tight">
              Wear the Pride of Your Favorite Squad
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Elevate your game with authentic European club jerseys, national team kits, and performance Dri-FIT athletic wear. Custom printing with your favorite player's name & squad number available.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onShopCategory('club-jerseys')}
                className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Club Jerseys</span>
              </button>

              <button
                onClick={() => onShopCategory('national-team')}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs rounded-xl transition-all border border-zinc-700 flex items-center gap-1.5"
              >
                <span>National Kits</span>
              </button>

              <button
                onClick={onOpenJerseyStudio}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-lime-400 font-bold text-xs rounded-xl transition-all border border-zinc-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Print Studio</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Match Details Modal */}
      <MatchDetailsModal
        isOpen={Boolean(selectedMatchId)}
        matchId={selectedMatchId}
        initialMatch={selectedMatch}
        onClose={() => {
          setSelectedMatchId(null);
          setSelectedMatch(null);
        }}
        onShopTeam={handleShopTeam}
      />
    </div>
  );
};

// =====================================================================
// MATCH CARD COMPONENT (Sport-Specific Layouts)
// =====================================================================
interface MatchCardProps {
  match: SportMatch;
  onClick: () => void;
  onShop: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, onShop }) => {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  const formatMatchTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`group bg-zinc-900 border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isLive 
          ? 'border-red-500/40 hover:border-red-500 shadow-lg shadow-red-950/20' 
          : 'border-zinc-800 hover:border-lime-400/50 hover:bg-zinc-850/80 shadow-md'
      }`}
    >
      {/* Card Header: League & Status Badge */}
      <div className="flex items-center justify-between text-xs gap-2 mb-3">
        <span className="font-semibold text-zinc-400 truncate max-w-[180px]">
          {match.competition}
        </span>

        {isLive ? (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>{match.statusText || 'LIVE'}</span>
          </span>
        ) : isCompleted ? (
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-semibold shrink-0">
            {match.statusText || 'FT'}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-400 font-mono shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3 text-lime-400" />
            <span>{formatMatchTime(match.matchTime)}</span>
          </span>
        )}
      </div>

      {/* Main Score & Teams Area */}
      <div className="space-y-2 py-1">
        
        {/* Home Team Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-zinc-950 border border-zinc-800 p-0.5 flex items-center justify-center shrink-0">
              {match.homeTeam.logo ? (
                <img 
                  src={match.homeTeam.logo} 
                  alt={match.homeTeam.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Shirt className="w-3.5 h-3.5 text-lime-400" />
              )}
            </div>
            <span className={`text-xs font-bold truncate ${
              match.homeTeam.isWinner ? 'text-lime-400' : 'text-zinc-200 group-hover:text-white'
            }`}>
              {match.homeTeam.name}
            </span>
          </div>

          <div className="text-right shrink-0">
            {match.status === 'upcoming' ? (
              <span className="text-xs text-zinc-500 font-mono">-</span>
            ) : (
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-sm font-black font-display text-white tabular-nums">
                  {match.homeTeam.score ?? 0}
                </span>
                {match.homeTeam.subScore && (
                  <span className="text-[10px] text-lime-400 font-mono font-semibold">
                    {match.homeTeam.subScore}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Away Team Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-zinc-950 border border-zinc-800 p-0.5 flex items-center justify-center shrink-0">
              {match.awayTeam.logo ? (
                <img 
                  src={match.awayTeam.logo} 
                  alt={match.awayTeam.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Shirt className="w-3.5 h-3.5 text-lime-400" />
              )}
            </div>
            <span className={`text-xs font-bold truncate ${
              match.awayTeam.isWinner ? 'text-lime-400' : 'text-zinc-200 group-hover:text-white'
            }`}>
              {match.awayTeam.name}
            </span>
          </div>

          <div className="text-right shrink-0">
            {match.status === 'upcoming' ? (
              <span className="text-xs text-zinc-500 font-mono">-</span>
            ) : (
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-sm font-black font-display text-white tabular-nums">
                  {match.awayTeam.score ?? 0}
                </span>
                {match.awayTeam.subScore && (
                  <span className="text-[10px] text-lime-400 font-mono font-semibold">
                    {match.awayTeam.subScore}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Card Footer: Venue & Action Affordance */}
      <div className="pt-3 mt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="truncate max-w-[190px] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
          <span className="truncate">{match.venue || 'Stadium'}</span>
        </span>

        <span className="text-lime-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

    </div>
  );
};
