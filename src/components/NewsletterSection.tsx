import React, { useState } from 'react';
import { Send, Tag, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api.ts';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.subscribeNewsletter(email.trim());
      setSuccessMsg(res.message);
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Subscription failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-14 bg-zinc-900 border-b border-zinc-850">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-semibold">
          <Tag className="w-3.5 h-3.5" />
          <span>Exclusive 10% Matchday Discount</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
          Join the Squad & Get 10% Off
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Subscribe for early access to limited club jersey drops, restock alerts, and exclusive tournament promos.
        </p>

        {successMsg ? (
          <div className="p-4 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-semibold max-w-md mx-auto flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Get 10% Off</span>
            </button>
          </form>
        )}

        {errorMsg && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}

        <p className="text-[11px] text-zinc-500">
          No spam ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};
