import React, { useState } from 'react';
import { X, Gift, Sparkles, Check, Copy, ArrowRight, ShieldCheck, Clock, Loader2 } from 'lucide-react';
import { api } from '../services/api.ts';
import type { LoyaltyAccount, LoyaltyRewardVoucher } from '../types/index.ts';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  onOpenCart
}) => {
  const [query, setQuery] = useState('01712345678');
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState<LoyaltyRewardVoucher | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLookup = async (lookupQuery?: string) => {
    const q = lookupQuery || query;
    if (!q) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const acc = await api.getLoyaltyBalance(q);
      setAccount(acc);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch loyalty account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (pointsCost: number) => {
    if (!account) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.redeemLoyaltyReward(account.phone, pointsCost);
      if (res.success && res.voucher) {
        setRedeemedVoucher(res.voucher);
        // Refresh account balance
        await handleLookup(account.phone);
      } else {
        setErrorMsg(res.message || 'Redemption failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Redemption failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyVoucher = () => {
    if (!redeemedVoucher) return;
    navigator.clipboard.writeText(redeemedVoucher.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loyalty-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="loyalty-title" className="text-lg sm:text-xl font-black uppercase font-display tracking-tight text-white">
                  Apex Club Loyalty Program
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                  1 pt per ৳10
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Earn points automatically on every Cash on Delivery order and redeem for instant discount vouchers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            aria-label="Close Loyalty Program"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Phone Lookup Input Bar */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
              Look Up Points Balance by Mobile Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="e.g. 01712345678"
                className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-lime-400"
              />
              <button
                onClick={() => handleLookup()}
                disabled={isLoading}
                className="py-2.5 px-5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Check Balance</span>
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
            )}
          </div>

          {/* Account Overview Card */}
          {account && (
            <div className="p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-lime-400/30 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">LOYALTY MEMBER</span>
                  <h3 className="text-base font-bold text-white">{account.customerName}</h3>
                  <p className="text-xs font-mono text-zinc-500">{account.phone}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-lime-400 text-zinc-950 font-mono">
                    {account.tier} Tier
                  </span>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Active Balance</p>
                  <p className="text-xl font-black font-mono text-lime-400 mt-0.5">{account.pointsBalance} pts</p>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Total Earned</p>
                  <p className="text-sm font-bold font-mono text-zinc-200 mt-1">{account.totalEarned} pts</p>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Total Redeemed</p>
                  <p className="text-sm font-bold font-mono text-zinc-400 mt-1">{account.totalRedeemed} pts</p>
                </div>
              </div>
            </div>
          )}

          {/* Voucher Redemptions Banner */}
          {redeemedVoucher && (
            <div className="p-4 bg-lime-400/10 border border-lime-400/40 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                  <h4 className="text-sm font-bold text-white">Voucher Generated Successfully!</h4>
                </div>
                <span className="text-xs font-bold text-lime-400">৳{redeemedVoucher.discountValue} OFF</span>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                <span className="font-mono font-black text-sm text-lime-400 tracking-wider">
                  {redeemedVoucher.code}
                </span>

                <button
                  onClick={handleCopyVoucher}
                  className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-400">
                This coupon has been registered in the store system. Paste it into the coupon code field at checkout!
              </p>
            </div>
          )}

          {/* Redeem Rewards Options */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Redeem Available Rewards
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { cost: 50, value: 50, label: '৳50 Off Voucher' },
                { cost: 100, value: 100, label: '৳100 Off Voucher' },
                { cost: 200, value: 250, label: '৳250 Off Voucher (Bonus)' }
              ].map((r) => {
                const canAfford = account ? account.pointsBalance >= r.cost : false;
                return (
                  <div
                    key={r.cost}
                    className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <span className="text-xs font-black font-mono text-lime-400 block">{r.cost} pts</span>
                      <h5 className="text-sm font-bold text-white mt-1">{r.label}</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Valid on orders over ৳{r.value * 3}</p>
                    </div>

                    <button
                      onClick={() => handleRedeem(r.cost)}
                      disabled={!canAfford || isLoading}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-lime-400 hover:bg-lime-300 text-zinc-950'
                          : 'bg-zinc-850 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem Voucher' : `Need ${r.cost} pts`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction History */}
          {account && account.transactions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Points Activity History
              </h4>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl divide-y divide-zinc-850 overflow-hidden">
                {account.transactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-zinc-200">{tx.description}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <span className={`font-mono font-bold text-xs ${
                      tx.type === 'earned' || tx.type === 'bonus' ? 'text-lime-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'redeemed' ? `-${tx.points} pts` : `+${tx.points} pts`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Server-validated points balance</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
