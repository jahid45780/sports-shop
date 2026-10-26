import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle, HelpCircle, Trophy, BarChart3, Users, Star, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api.ts';
import type { FanQuiz, FanPredictionPoll, PlayerVoteCandidate, FanLeaderboardEntry } from '../types/index.ts';

interface FanZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoyaltyModal?: () => void;
}

export const FanZoneModal: React.FC<FanZoneModalProps> = ({
  isOpen,
  onClose,
  onOpenLoyaltyModal
}) => {
  const [tab, setTab] = useState<'quizzes' | 'predictions' | 'players' | 'leaderboard'>('quizzes');
  
  // Quizzes state
  const [quizzes, setQuizzes] = useState<FanQuiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<FanQuiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [userPhone, setUserPhone] = useState('');
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; pointsEarned: number; feedback: any[] } | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Predictions state
  const [predictions, setPredictions] = useState<FanPredictionPoll[]>([]);
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});

  // Players voting state
  const [candidates, setCandidates] = useState<PlayerVoteCandidate[]>([]);
  const [votedCandidate, setVotedCandidate] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<FanLeaderboardEntry[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    loadFanZoneData();

    // Load local voted state
    const savedVotes = localStorage.getItem('apex_fan_voted_polls');
    if (savedVotes) {
      try { setVotedPolls(JSON.parse(savedVotes)); } catch (e) {}
    }
  }, [isOpen]);

  const loadFanZoneData = async () => {
    try {
      const [qList, pList, cList, lList] = await Promise.all([
        api.getFanQuizzes(),
        api.getPredictions(),
        api.getPlayerVoteCandidates(),
        api.getLeaderboard()
      ]);
      setQuizzes(qList);
      if (qList.length > 0 && !activeQuiz) setActiveQuiz(qList[0]);
      setPredictions(pList);
      setCandidates(cList);
      setLeaderboard(lList);
    } catch (err) {
      console.error('Error loading fan zone:', err);
    }
  };

  if (!isOpen) return null;

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (quizResult) return; // locked after submission
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmittingQuiz(true);
    try {
      const answersPayload = activeQuiz.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: userAnswers[q.id] ?? -1
      }));

      const res = await api.submitQuiz(activeQuiz.id, answersPayload, userPhone);
      setQuizResult(res);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleVotePrediction = async (pollId: string, option: 'A' | 'B' | 'draw') => {
    if (votedPolls[pollId]) return;
    try {
      const res = await api.votePrediction(pollId, option);
      if (res.success && res.poll) {
        setPredictions((prev) => prev.map((p) => (p.id === pollId ? res.poll! : p)));
        const updatedVotes = { ...votedPolls, [pollId]: option };
        setVotedPolls(updatedVotes);
        localStorage.setItem('apex_fan_voted_polls', JSON.stringify(updatedVotes));
      }
    } catch (err) {
      console.error('Error voting prediction:', err);
    }
  };

  const handleVotePlayer = async (candidateId: string) => {
    if (votedCandidate) return;
    try {
      const res = await api.votePlayer(candidateId);
      if (res.success) {
        setCandidates(res.candidates);
        setVotedCandidate(candidateId);
      }
    } catch (err) {
      console.error('Error voting player:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fanzone-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="fanzone-title" className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-white">
                  Apex Fan Zone
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                  Earn Loyalty Points
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Sports trivia quizzes, derby match prediction polls, player voting, and community leaderboards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close Fan Zone"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-3 sm:px-6 bg-zinc-950 border-b border-zinc-800 flex gap-2 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setTab('quizzes')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'quizzes' 
                ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Trivia Quizzes (+50 pts)</span>
          </button>

          <button
            onClick={() => setTab('predictions')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'predictions' 
                ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Match Predictions</span>
          </button>

          <button
            onClick={() => setTab('players')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'players' 
                ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Player Voting</span>
          </button>

          <button
            onClick={() => setTab('leaderboard')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'leaderboard' 
                ? 'bg-lime-400 text-zinc-950 shadow-sm' 
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Fan Leaderboard</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: QUIZZES */}
          {tab === 'quizzes' && (
            <div className="space-y-6">
              {/* Quiz Selection Buttons */}
              <div className="flex flex-wrap gap-2">
                {quizzes.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuiz(q);
                      setUserAnswers({});
                      setQuizResult(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      activeQuiz?.id === q.id
                        ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {q.sport === 'football' ? '⚽' : '🏏'} {q.title}
                  </button>
                ))}
              </div>

              {activeQuiz && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6">
                  
                  {/* Quiz Title & Points Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                        {activeQuiz.sport.toUpperCase()} TRIVIA
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white">{activeQuiz.title}</h3>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold font-mono">
                      Reward: +{activeQuiz.rewardPoints} Fan Points
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {activeQuiz.questions.map((q, qIndex) => {
                      const selectedOpt = userAnswers[q.id];
                      const feedback = quizResult?.feedback.find((f) => f.questionId === q.id);

                      return (
                        <div key={q.id} className="space-y-3">
                          <p className="text-xs sm:text-sm font-bold text-white">
                            <span className="text-lime-400 mr-1.5">{qIndex + 1}.</span>
                            {q.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIndex) => {
                              const isSelected = selectedOpt === optIndex;
                              let btnClass = 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700';

                              if (feedback) {
                                if (optIndex === feedback.correctIndex) {
                                  btnClass = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
                                } else if (isSelected && !feedback.isCorrect) {
                                  btnClass = 'border-red-500 bg-red-500/20 text-red-300 line-through';
                                }
                              } else if (isSelected) {
                                btnClass = 'border-lime-400 bg-lime-400/10 text-lime-400 font-bold';
                              }

                              return (
                                <button
                                  key={optIndex}
                                  onClick={() => handleSelectAnswer(q.id, optIndex)}
                                  disabled={Boolean(quizResult)}
                                  className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && !quizResult && <CheckCircle className="w-3.5 h-3.5 text-lime-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {feedback && (
                            <p className="text-[11px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-850">
                              <span className="text-lime-400 font-bold">Explanation: </span>
                              {feedback.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submission Row */}
                  {!quizResult ? (
                    <div className="pt-4 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="w-full sm:w-auto flex-1 max-w-xs">
                        <input
                          type="tel"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          placeholder="Your Mobile No (to claim fan pts)"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                        />
                      </div>

                      <button
                        onClick={handleSubmitQuiz}
                        disabled={isSubmittingQuiz}
                        className="w-full sm:w-auto py-2.5 px-6 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        {isSubmittingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Submit Answers & Claim Points</span>
                      </button>
                    </div>
                  ) : (
                    /* Score Result Card */
                    <div className="p-4 bg-zinc-900 border border-lime-400/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-lime-400" />
                          <span>Quiz Completed! Score: {quizResult.score} / {quizResult.total}</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          You earned <span className="text-lime-400 font-bold font-mono">+{quizResult.pointsEarned} Fan Points</span>. Points can be redeemed for checkout vouchers!
                        </p>
                      </div>

                      <button
                        onClick={() => onOpenLoyaltyModal?.()}
                        className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        <span>View Loyalty Rewards</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 2: PREDICTIONS */}
          {tab === 'predictions' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Match Prediction Polls
                </h3>
                <p className="text-xs text-zinc-400">
                  Cast your vote before kickoff. Server-tracked anti-abuse protects against duplicate voting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((p) => {
                  const hasVoted = Boolean(votedPolls[p.id]);
                  const myVote = votedPolls[p.id];
                  const total = Math.max(1, p.totalVotes);
                  const pctA = Math.round((p.votesA / total) * 100);
                  const pctB = Math.round((p.votesB / total) * 100);
                  const pctDraw = p.votesDraw ? Math.round((p.votesDraw / total) * 100) : 0;

                  return (
                    <div key={p.id} className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                          {p.sport.toUpperCase()} DERBY POLL
                        </span>
                        <span className="text-xs font-mono text-zinc-400">{p.totalVotes} fan votes</span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{p.matchTitle}</h4>

                      {/* Vote Buttons & Percentages */}
                      <div className="space-y-2">
                        {/* Option A */}
                        <div>
                          <button
                            onClick={() => handleVotePrediction(p.id, 'A')}
                            disabled={hasVoted}
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                              myVote === 'A'
                                ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            <span>{p.optionA}</span>
                            <span className="font-mono">{pctA}%</span>
                          </button>
                          <div className="h-1.5 bg-zinc-850 rounded-full mt-1 overflow-hidden">
                            <div style={{ width: `${pctA}%` }} className="h-full bg-lime-400" />
                          </div>
                        </div>

                        {/* Option B */}
                        <div>
                          <button
                            onClick={() => handleVotePrediction(p.id, 'B')}
                            disabled={hasVoted}
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                              myVote === 'B'
                                ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            <span>{p.optionB}</span>
                            <span className="font-mono">{pctB}%</span>
                          </button>
                          <div className="h-1.5 bg-zinc-850 rounded-full mt-1 overflow-hidden">
                            <div style={{ width: `${pctB}%` }} className="h-full bg-blue-500" />
                          </div>
                        </div>

                        {/* Draw (if applicable) */}
                        {p.optionDraw && (
                          <div>
                            <button
                              onClick={() => handleVotePrediction(p.id, 'draw')}
                              disabled={hasVoted}
                              className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                                myVote === 'draw'
                                  ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                                  : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                              }`}
                            >
                              <span>{p.optionDraw}</span>
                              <span className="font-mono">{pctDraw}%</span>
                            </button>
                            <div className="h-1.5 bg-zinc-850 rounded-full mt-1 overflow-hidden">
                              <div style={{ width: `${pctDraw}%` }} className="h-full bg-zinc-600" />
                            </div>
                          </div>
                        )}
                      </div>

                      {hasVoted && (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Vote recorded on server! Thank you for participating.</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PLAYER VOTING */}
          {tab === 'players' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Fan Player of the Month
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Vote for the standout performer in football & cricket this month.
                  </p>
                </div>
                {votedCandidate && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Vote Recorded
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {candidates.map((c) => {
                  const isVoted = votedCandidate === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 bg-zinc-950 border rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                        isVoted ? 'border-lime-400 bg-lime-400/5' : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-bold text-lime-400 uppercase tracking-wider">{c.team}</span>
                        <h4 className="text-sm font-bold text-white truncate">{c.name}</h4>
                        <p className="text-xs text-zinc-400">{c.category}</p>
                        <p className="text-[11px] text-zinc-500 italic truncate">"{c.recentHighlight}"</p>
                      </div>

                      <div className="text-right shrink-0 space-y-1.5">
                        <span className="text-xs font-mono font-bold text-zinc-200 block">
                          {c.votes} votes
                        </span>
                        <button
                          onClick={() => handleVotePlayer(c.id)}
                          disabled={Boolean(votedCandidate)}
                          className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                            isVoted
                              ? 'bg-lime-400 text-zinc-950'
                              : votedCandidate
                              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                          }`}
                        >
                          {isVoted ? 'Voted' : 'Vote'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: LEADERBOARD */}
          {tab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Bangladesh Fan Points Leaderboard
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Earn points by completing quizzes, predicting matches, and purchasing official kits.
                  </p>
                </div>
                <button
                  onClick={() => onOpenLoyaltyModal?.()}
                  className="px-3 py-1.5 bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-semibold rounded-lg transition-colors"
                >
                  My Points Balance
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-850 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                      <th className="py-2.5 px-4">Fan</th>
                      <th className="py-2.5 px-4">City</th>
                      <th className="py-2.5 px-4">Community Badge</th>
                      <th className="py-2.5 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 text-zinc-300">
                    {leaderboard.map((user) => (
                      <tr key={user.rank} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{user.userName}</td>
                        <td className="py-3 px-4 text-zinc-400">{user.city}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-850 text-zinc-300 border border-zinc-750">
                            {user.badge}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-lime-400 text-sm">
                          {user.points} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <p>Fan Points are redeemable for discounts on authentic jerseys.</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close Fan Zone
          </button>
        </div>
      </div>
    </div>
  );
};
