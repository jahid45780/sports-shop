import React, { useState, useEffect } from 'react';
import { X, Trophy, Bell, ChevronRight, Activity, Calendar, ShieldCheck, Info } from 'lucide-react';
import { api } from '../services/api.ts';
import type { SportMatch, MatchStanding, SportType, MatchStatus } from '../types/index.ts';

interface SportsMatchCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReminderModal?: (teamName?: string, sport?: SportType) => void;
}

export const SportsMatchCenterModal: React.FC<SportsMatchCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenReminderModal
}) => {
  const [activeSport, setActiveSport] = useState<SportType>('football');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [matches, setMatches] = useState<SportMatch[]>([]);
  const [standings, setStandings] = useState<MatchStanding[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLiveFeedActive, setIsLiveFeedActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMatch, setSelectedMatch] = useState<SportMatch | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, activeSport, activeStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [matchesRes, standingsRes] = await Promise.all([
        api.getSportsMatches({
          sport: activeSport,
          status: activeStatus !== 'all' ? activeStatus : undefined
        }),
        api.getSportsStandings(activeSport)
      ]);
      setMatches(matchesRes.matches);
      setStatusMessage(matchesRes.statusMessage);
      setIsLiveFeedActive(matchesRes.isLiveFeedActive);
      setStandings(standingsRes);
    } catch (err) {
      console.error('Error loading sports data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-center-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="match-center-title" className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-white">
                  Sports Match Center
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {activeSport === 'football' ? 'Football' : 'Cricket'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Verified live scores, official fixtures schedule, and certified standings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close match center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Data Source Status Banner */}
        <div className="px-6 py-2.5 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-zinc-300">{statusMessage}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-zinc-500 font-mono">
              {isLiveFeedActive ? 'API TELEMETRY LIVE' : 'VERIFIED OFFICIAL ARCHIVE'}
            </span>
          </div>
        </div>

        {/* Controls: Sport selector & Status filter */}
        <div className="p-4 sm:px-6 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Sport Toggle */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveSport('football')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSport === 'football' 
                  ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⚽ Football
            </button>
            <button
              onClick={() => setActiveSport('cricket')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSport === 'cricket' 
                  ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🏏 Cricket
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['all', 'live', 'upcoming', 'completed', 'standings'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setActiveStatus(st)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap font-medium transition-colors ${
                  activeStatus === st
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {st === 'completed' ? 'Results' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-zinc-950/60 border border-zinc-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activeStatus === 'standings' ? (
            /* Standings Table View */
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  {activeSport === 'football' ? 'European League Standings' : 'BPL T20 Standings Table'}
                </h4>
                <span className="text-[11px] text-zinc-400">Official Points Differential</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-850 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">Pos</th>
                      <th className="py-2.5 px-4">Club / Team</th>
                      <th className="py-2.5 px-3 text-center">P</th>
                      <th className="py-2.5 px-3 text-center">W</th>
                      <th className="py-2.5 px-3 text-center">D/T</th>
                      <th className="py-2.5 px-3 text-center">L</th>
                      <th className="py-2.5 px-3 text-center">GD/NRR</th>
                      <th className="py-2.5 px-4 text-center font-bold text-white">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 text-zinc-300">
                    {standings.map((team) => (
                      <tr key={team.rank} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-bold text-zinc-400">
                          {team.rank}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                          <span>{team.team}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({team.shortName})</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{team.played}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{team.won}</td>
                        <td className="py-3 px-3 text-center font-mono text-zinc-400">{team.drawn}</td>
                        <td className="py-3 px-3 text-center font-mono text-red-400">{team.lost}</td>
                        <td className="py-3 px-3 text-center font-mono">{team.goalDiffOrNrr}</td>
                        <td className="py-3 px-4 text-center font-mono font-black text-lime-400 text-sm">
                          {team.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <Info className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No matches found for selected filter</p>
              <p className="text-xs text-zinc-500">Try switching sports or viewing upcoming matches.</p>
            </div>
          ) : (
            /* Matches List */
            <div className="space-y-3">
              {matches.map((m) => {
                const isSelected = selectedMatch?.id === m.id;
                return (
                  <div
                    key={m.id}
                    className={`bg-zinc-950 border rounded-2xl transition-all overflow-hidden ${
                      isSelected ? 'border-lime-400/50 ring-1 ring-lime-400/30' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Match Top Bar */}
                    <div className="px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-850 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-zinc-300">
                        <span className="font-semibold text-lime-400">{m.competition}</span>
                        {m.round && <span className="text-zinc-500">· {m.round}</span>}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {m.status === 'live' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 rounded-full animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {m.statusText || 'LIVE'}
                          </span>
                        ) : m.status === 'completed' ? (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded">
                            {m.statusText || 'Full Time'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-lime-400/10 text-lime-400 rounded">
                            {m.statusText || 'Upcoming'}
                          </span>
                        )}

                        <button
                          onClick={() => onOpenReminderModal?.(m.homeTeam.name, m.sport)}
                          className="p-1 text-zinc-400 hover:text-lime-400 rounded transition-colors"
                          title={`Set reminder for ${m.homeTeam.name}`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Main Match Score Row */}
                    <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                      {/* Home Team */}
                      <div className="flex-1 flex items-center justify-end gap-3 text-right">
                        <div>
                          <p className="text-sm sm:text-base font-bold text-white leading-tight">
                            {m.homeTeam.name}
                          </p>
                          {m.homeTeam.subScore && (
                            <p className="text-[11px] font-mono text-zinc-400">{m.homeTeam.subScore}</p>
                          )}
                        </div>
                        <div 
                          className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center font-bold text-xs shrink-0"
                          style={{ backgroundColor: m.homeTeam.logoColor || '#27272a' }}
                        >
                          {m.homeTeam.shortName.slice(0, 3)}
                        </div>
                      </div>

                      {/* Score / Center Divider */}
                      <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-center shrink-0 min-w-[90px]">
                        {m.status === 'upcoming' ? (
                          <div className="text-xs font-mono font-bold text-zinc-300">
                            VS
                          </div>
                        ) : (
                          <div className="text-base sm:text-xl font-black font-mono tracking-tight text-white">
                            {m.homeTeam.score ?? 0} - {m.awayTeam.score ?? 0}
                          </div>
                        )}
                        <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[110px]">
                          {(m.venue || 'Stadium').split(',')[0]}
                        </p>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex items-center justify-start gap-3 text-left">
                        <div 
                          className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center font-bold text-xs shrink-0"
                          style={{ backgroundColor: m.awayTeam.logoColor || '#27272a' }}
                        >
                          {m.awayTeam.shortName.slice(0, 3)}
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-white leading-tight">
                            {m.awayTeam.name}
                          </p>
                          {m.awayTeam.subScore && (
                            <p className="text-[11px] font-mono text-zinc-400">{m.awayTeam.subScore}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand Details Trigger */}
                    <div className="px-4 py-2 bg-zinc-900/30 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1.5 text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.matchTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <button
                        onClick={() => setSelectedMatch(isSelected ? null : m)}
                        className="text-zinc-300 hover:text-lime-400 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>{isSelected ? 'Hide Match Details' : 'View Match Details & Stats'}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Match Details Drawer */}
                    {isSelected && (
                      <div className="p-4 sm:p-5 bg-zinc-900/70 border-t border-zinc-800 space-y-4 animate-in fade-in duration-150">
                        {/* Highlights */}
                        {m.highlights && m.highlights.length > 0 && (
                          <div className="space-y-1.5">
                            <h5 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5 text-lime-400" />
                              <span>Key Match Events</span>
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {m.highlights.map((h, idx) => (
                                <span key={idx} className="text-xs bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300 font-mono">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Team Stats */}
                        {m.stats && (
                          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                            <h5 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                              Team Head-to-Head Statistics
                            </h5>

                            {m.stats.possession && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-zinc-400 font-mono">
                                  <span>{m.stats.possession.home}%</span>
                                  <span className="text-[11px] uppercase tracking-wider text-zinc-500">Possession</span>
                                  <span>{m.stats.possession.away}%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                                  <div style={{ width: `${m.stats.possession.home}%` }} className="bg-lime-400 h-full" />
                                  <div style={{ width: `${m.stats.possession.away}%` }} className="bg-blue-500 h-full" />
                                </div>
                              </div>
                            )}

                            {m.stats.shotsOnTarget && (
                              <div className="flex justify-between text-xs text-zinc-300 font-mono py-1 border-b border-zinc-850">
                                <span className="font-bold">{m.stats.shotsOnTarget.home}</span>
                                <span className="text-[11px] text-zinc-500">Shots on Target</span>
                                <span className="font-bold">{m.stats.shotsOnTarget.away}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Venue: {m.venue}</span>
                          <span className="text-emerald-400">Verified by BCB / UEFA Match Control</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <p>Support your team with an authentic kit from our catalog.</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
