import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  AlertCircle,
  ExternalLink,
  Shirt
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { SportMatch, MatchEvent } from '../types/index.ts';

interface MatchDetailsModalProps {
  matchId: string | null;
  initialMatch?: SportMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onShopTeam?: (teamName: string, sport: string) => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  matchId,
  initialMatch,
  isOpen,
  onClose,
  onShopTeam
}) => {
  const [match, setMatch] = useState<SportMatch | null>(initialMatch || null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [venueInfo, setVenueInfo] = useState<{ name: string; city?: string; capacity?: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !matchId) return;

    if (initialMatch) {
      setMatch(initialMatch);
    }

    const loadDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getMatchDetails(matchId);
        if (data.match) {
          setMatch(data.match);
        }
        if (data.events) {
          setEvents(data.events);
        }
        if (data.venueInfo) {
          setVenueInfo(data.venueInfo);
        }
      } catch (err: any) {
        // Fall back to initialMatch
        if (!initialMatch) {
          setError('Could not load detailed match telemetry. Basic match card data is shown.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [isOpen, matchId, initialMatch]);

  if (!isOpen || !match) return null;

  const isLive = match.status === 'live';
  const isFinished = match.status === 'completed';

  const formatMatchDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-850 flex items-center justify-between shrink-0 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                  {match.sport}
                </span>
                <span className="text-zinc-600">·</span>
                <span id="match-modal-title" className="text-xs font-semibold text-zinc-300 truncate max-w-[200px] sm:max-w-xs">
                  {match.competition}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close match details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Main Scoreboard Hero */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 text-center relative overflow-hidden">
            {/* Live Glow Badge */}
            <div className="flex items-center justify-center mb-3">
              {isLive ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/30 rounded-full text-red-400 text-xs font-black tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{match.statusText || 'LIVE NOW'}</span>
                </div>
              ) : isFinished ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-zinc-800 border border-zinc-750 rounded-full text-zinc-300 text-xs font-semibold">
                  <span>{match.statusText || 'Full Time (FT)'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-zinc-800/80 border border-zinc-750 rounded-full text-zinc-400 text-xs font-medium">
                  <Clock className="w-3 h-3 text-lime-400" />
                  <span>{formatMatchDate(match.matchTime)}</span>
                </div>
              )}
            </div>

            {/* Teams & Score Grid */}
            <div className="grid grid-cols-5 items-center gap-2 sm:gap-4">
              
              {/* Home Team */}
              <div className="col-span-2 flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-950 border border-zinc-800 p-2 flex items-center justify-center mb-2 shadow-inner">
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
                    <Shirt className="w-7 h-7 text-lime-400" />
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white font-display uppercase tracking-tight line-clamp-2">
                  {match.homeTeam.name}
                </h4>
                {match.homeTeam.subScore && (
                  <span className="text-xs text-lime-400 font-mono mt-0.5 font-bold">
                    {match.homeTeam.subScore}
                  </span>
                )}
              </div>

              {/* Center Score Display */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                {match.status === 'upcoming' ? (
                  <div className="text-lg sm:text-2xl font-black text-zinc-500 font-display">
                    VS
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-2xl sm:text-4xl font-black text-white font-display tabular-nums">
                      {match.homeTeam.score ?? 0}
                    </span>
                    <span className="text-zinc-500 text-xl font-bold">:</span>
                    <span className="text-2xl sm:text-4xl font-black text-white font-display tabular-nums">
                      {match.awayTeam.score ?? 0}
                    </span>
                  </div>
                )}
                {match.minute && isLive && (
                  <span className="text-[11px] font-mono font-bold text-red-400 mt-1">
                    {match.minute}'
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="col-span-2 flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-950 border border-zinc-800 p-2 flex items-center justify-center mb-2 shadow-inner">
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
                    <Shirt className="w-7 h-7 text-lime-400" />
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white font-display uppercase tracking-tight line-clamp-2">
                  {match.awayTeam.name}
                </h4>
                {match.awayTeam.subScore && (
                  <span className="text-xs text-lime-400 font-mono mt-0.5 font-bold">
                    {match.awayTeam.subScore}
                  </span>
                )}
              </div>

            </div>

            {/* Basketball Quarter Breakdown */}
            {match.sport === 'basketball' && (match.homeTeam.linescores || match.awayTeam.linescores) && (
              <div className="mt-4 pt-4 border-t border-zinc-800/80">
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">
                  Quarter Scoring Breakdown
                </div>
                <div className="grid grid-cols-6 gap-1 text-xs font-mono max-w-sm mx-auto">
                  <span className="text-zinc-500 font-bold text-left">Team</span>
                  <span className="text-zinc-400">Q1</span>
                  <span className="text-zinc-400">Q2</span>
                  <span className="text-zinc-400">Q3</span>
                  <span className="text-zinc-400">Q4</span>
                  <span className="text-white font-bold">Total</span>

                  <span className="text-zinc-300 truncate text-left">{match.homeTeam.shortName}</span>
                  {(match.homeTeam.linescores || []).map((score, i) => (
                    <span key={i} className="text-zinc-300">{score}</span>
                  ))}
                  <span className="text-lime-400 font-bold">{match.homeTeam.score}</span>

                  <span className="text-zinc-300 truncate text-left">{match.awayTeam.shortName}</span>
                  {(match.awayTeam.linescores || []).map((score, i) => (
                    <span key={i} className="text-zinc-300">{score}</span>
                  ))}
                  <span className="text-lime-400 font-bold">{match.awayTeam.score}</span>
                </div>
              </div>
            )}
          </div>

          {/* Match Metadata Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl flex items-center gap-3 text-xs">
              <Calendar className="w-4 h-4 text-lime-400 shrink-0" />
              <div>
                <div className="text-[10px] uppercase text-zinc-500 font-bold">Date & Kickoff</div>
                <div className="text-zinc-200 font-medium">{formatMatchDate(match.matchTime)}</div>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl flex items-center gap-3 text-xs">
              <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
              <div>
                <div className="text-[10px] uppercase text-zinc-500 font-bold">Stadium & Venue</div>
                <div className="text-zinc-200 font-medium truncate">
                  {venueInfo?.name || match.venue || 'Official Stadium'}
                </div>
              </div>
            </div>
          </div>

          {/* Key Match Events (Goals, Cards, Substitutions) */}
          {events && events.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-lime-400" />
                <span>Key Match Events</span>
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {events.map((ev, index) => (
                  <div 
                    key={ev.id || index}
                    className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-2">
                      {ev.minute && (
                        <span className="px-1.5 py-0.5 bg-zinc-800 text-lime-400 font-mono text-[10px] font-bold rounded">
                          {ev.minute}
                        </span>
                      )}
                      <span className="text-zinc-200 font-medium">{ev.text || ev.player}</span>
                    </div>
                    {ev.team && (
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {ev.team}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contextual E-Commerce Link */}
          <div className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-lime-400/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-lime-400 text-zinc-950 rounded-xl shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-tight">
                  Support Your Squad in Authentic Style
                </h5>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Order authentic Dri-FIT match kits and custom jerseys with Cash on Delivery nationwide.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onShopTeam) {
                  onShopTeam(match.homeTeam.name, match.sport);
                }
              }}
              className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Kits</span>
            </button>
          </div>

          {/* Official Verification Notice */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-850">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Telemetry Feed</span>
            </div>
            <span className="font-mono">Live Match ID: {match.id}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
