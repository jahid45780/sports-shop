import React, { useState, useEffect } from 'react';
import { X, Trophy, ShieldCheck, Calendar, MapPin, Users, Award, ChevronRight } from 'lucide-react';
import { api } from '../services/api.ts';
import type { Tournament } from '../types/index.ts';

interface TournamentCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentCenterModal: React.FC<TournamentCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState<'fixtures' | 'teams' | 'standings'>('fixtures');

  useEffect(() => {
    if (!isOpen) return;
    loadTournaments();
  }, [isOpen]);

  const loadTournaments = async () => {
    try {
      const list = await api.getTournaments();
      setTournaments(list);
      if (list.length > 0 && !selectedTournament) {
        setSelectedTournament(list[0]);
      }
    } catch (err) {
      console.error('Error loading tournaments:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tournament-center-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="tournament-center-title" className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-white">
                  Sports Tournament Center
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Verified Schedules Only
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Official tournament fixtures, participating team rosters, and verified points standings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close Tournament Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tournament Switcher */}
        <div className="p-3 sm:px-6 bg-zinc-950 border-b border-zinc-800 flex gap-2 overflow-x-auto text-xs shrink-0">
          {tournaments.map((t) => {
            const isSelected = selectedTournament?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTournament(t)}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected 
                    ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                    : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
                }`}
              >
                <span>{t.sport === 'football' ? '⚽' : '🏏'}</span>
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Tournament Detail */}
        {selectedTournament && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Tournament Meta Card */}
            <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-850">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                      {selectedTournament.edition}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-400">{selectedTournament.dates}</span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    {selectedTournament.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{selectedTournament.dataSourceLabel}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedTournament.overview}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-lime-400" />
                  <span>{selectedTournament.location}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-lime-400" />
                  <span>{selectedTournament.teams.length} Registered Teams</span>
                </span>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs">
              <button
                onClick={() => setActiveTab('fixtures')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  activeTab === 'fixtures'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Match Fixtures ({selectedTournament.fixtures.length})
              </button>
              <button
                onClick={() => setActiveTab('standings')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  activeTab === 'standings'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Official Points Table
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  activeTab === 'teams'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Teams & Captains ({selectedTournament.teams.length})
              </button>
            </div>

            {/* Sub-tab 1: Fixtures */}
            {activeTab === 'fixtures' && (
              <div className="space-y-3">
                {selectedTournament.fixtures.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-lime-400 uppercase tracking-wider">
                        <span>{f.stage}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-400">{f.date} ({f.time})</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {f.homeTeam} <span className="text-zinc-500 font-mono">vs</span> {f.awayTeam}
                      </h4>
                      <p className="text-xs text-zinc-400">{f.venue}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {f.status === 'upcoming' ? 'Scheduled Fixture' : f.result || 'Completed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-tab 2: Standings */}
            {activeTab === 'standings' && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-850 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">Pos</th>
                      <th className="py-2.5 px-4">Team</th>
                      <th className="py-2.5 px-3 text-center">P</th>
                      <th className="py-2.5 px-3 text-center">W</th>
                      <th className="py-2.5 px-3 text-center">L</th>
                      <th className="py-2.5 px-3 text-center">GD / NRR</th>
                      <th className="py-2.5 px-4 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 text-zinc-300">
                    {selectedTournament.standings.map((st) => (
                      <tr key={st.rank} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-bold text-zinc-400">
                          {st.rank}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {st.team} <span className="text-[10px] text-zinc-500 font-mono">({st.shortName})</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{st.played}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{st.won}</td>
                        <td className="py-3 px-3 text-center font-mono text-red-400">{st.lost}</td>
                        <td className="py-3 px-3 text-center font-mono">{st.goalDiffOrNrr}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-lime-400 text-sm">
                          {st.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-tab 3: Teams */}
            {activeTab === 'teams' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTournament.teams.map((tm) => (
                  <div
                    key={tm.id}
                    className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-lime-400 uppercase tracking-wider">
                        {tm.shortName}
                      </span>
                      <h4 className="text-sm font-bold text-white">{tm.name}</h4>
                      <p className="text-xs text-zinc-400">Captain: <span className="text-zinc-200">{tm.captain}</span></p>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-semibold rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      Official Squad
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <p>Verified match records certified by Bangladesh sports authorities.</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close Tournament Center
          </button>
        </div>
      </div>
    </div>
  );
};
