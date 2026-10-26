import React, { useState, useEffect } from 'react';
import { X, Bell, Check, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import { api } from '../services/api.ts';

interface MatchRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTeam?: string;
  initialSport?: string;
}

export const MatchRemindersModal: React.FC<MatchRemindersModalProps> = ({
  isOpen,
  onClose,
  initialTeam,
  initialSport
}) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [selectedTeam, setSelectedTeam] = useState<string>(initialTeam || 'Bangladesh Tigers');
  const [selectedSport, setSelectedSport] = useState<string>(initialSport || 'cricket');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [subscribedTeams, setSubscribedTeams] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
    const saved = localStorage.getItem('apex_followed_teams');
    if (saved) {
      try { setSubscribedTeams(JSON.parse(saved)); } catch (e) {}
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialTeam) setSelectedTeam(initialTeam);
    if (initialSport) setSelectedSport(initialSport);
  }, [initialTeam, initialSport]);

  if (!isOpen) return null;

  const popularTeams = [
    { name: 'Bangladesh Tigers', sport: 'cricket', tag: 'National Squad' },
    { name: 'Real Madrid', sport: 'football', tag: 'La Liga' },
    { name: 'FC Barcelona', sport: 'football', tag: 'La Liga' },
    { name: 'Arsenal FC', sport: 'football', tag: 'Premier League' },
    { name: 'Argentina National Team', sport: 'football', tag: 'World Champions' },
    { name: 'Comilla Victorians', sport: 'cricket', tag: 'BPL T20' }
  ];

  const [notice, setNotice] = useState<string | null>(null);

  const handleRequestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      setNotice('Browser push notifications are not supported in this browser/frame. You can enter your email or phone below to receive matchday alerts!');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setPermissionState(res);
      if (res === 'granted') {
        setNotice(null);
      }
    } catch {
      setNotice('Unable to request notification permission in this frame. Please enter your email or phone below.');
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.subscribeTeamReminder({
        teamName: selectedTeam,
        sport: selectedSport,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        notifyBrowser: permissionState === 'granted',
        notifyEmail: Boolean(customerEmail)
      });

      if (!subscribedTeams.includes(selectedTeam)) {
        const updated = [...subscribedTeams, selectedTeam];
        setSubscribedTeams(updated);
        localStorage.setItem('apex_followed_teams', JSON.stringify(updated));
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3500);

      // Trigger a sample test browser notification if permission granted
      if (permissionState === 'granted') {
        new Notification('ApexKit Match Reminder Confirmed!', {
          body: `You are now following ${selectedTeam}. We will notify you before kickoff!`,
          icon: '/favicon.ico'
        });
      }
    } catch (err) {
      console.error('Failed to subscribe match reminder:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminders-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reminders-title" className="text-base sm:text-lg font-black uppercase font-display tracking-tight text-white">
                Match Day Kickoff Reminders
              </h2>
              <p className="text-xs text-zinc-400">
                Get alerted before your favorite club or national team matches
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close Reminders"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubscribe} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Permission Status Box */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-zinc-300">Browser Alerts Permission:</span>
              {permissionState === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Check className="w-3 h-3" />
                  Permission Granted
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-400">Not Yet Enabled</span>
              )}
            </div>

            {permissionState !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestBrowserPermission}
                className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-zinc-700"
              >
                <Bell className="w-3.5 h-3.5 text-lime-400" />
                <span>Enable Browser Kickoff Notifications</span>
              </button>
            ) : (
              <p className="text-[11px] text-zinc-400">
                System notifications active. You will receive alerts 1 hour before kickoff.
              </p>
            )}

            {notice && (
              <div className="p-3 bg-amber-400/10 border border-amber-400/25 rounded-xl text-xs text-amber-300">
                {notice}
              </div>
            )}
          </div>

          {/* Team Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Select Team to Follow
            </label>
            <div className="grid grid-cols-2 gap-2">
              {popularTeams.map((t) => {
                const isSelected = selectedTeam === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setSelectedTeam(t.name);
                      setSelectedSport(t.sport);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-lime-400 bg-lime-400/5 ring-1 ring-lime-400/30'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">{t.tag}</span>
                    <span className="text-xs font-bold text-white truncate block">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Phone / Email */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Optional Email / SMS Alert
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email address for fixture digest"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Mobile number for SMS alerts (e.g. 01712345678)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Reminder set! You are following {selectedTeam}.</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
          >
            <Bell className="w-4 h-4" />
            <span>Follow {selectedTeam} & Save Reminder</span>
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Opt-in only · No spam policy</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
