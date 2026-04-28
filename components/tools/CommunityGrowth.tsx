import React, { useState } from 'react';
import { Users, Coins, MessageCircle, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { processCommunityAction } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';

export const CommunityGrowth: React.FC = () => {
  const { user, usageCount, incrementUsage, setShowAuthModal } = useAuth();
  const [tokens, setTokens] = useState(150);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [userAction, setUserAction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAction.trim()) return;

    // Guest Usage Check
    if (!user) {
      if (usageCount >= 1) {
        setShowAuthModal(true);
        return;
      }
      incrementUsage();
    }

    setIsLoading(true);
    setAiResponse(null);
    
    // Optimistic UI update for log
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      const response = await processCommunityAction(userAction, tokens);
      setAiResponse(response);
      setActionLog(prev => [`[${timestamp}] Claim: "${userAction}"`, ...prev]);
      
      if (response.toLowerCase().includes("approv") || response.toLowerCase().includes("congrat")) {
        setTokens(prev => prev + 25); 
      }

      setUserAction('');
    } catch (error) {
      console.error(error);
      alert('Failed to verify action.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Community Growth</h2>
          <p className="text-slate-400 text-lg">Support-for-Support Campaign Manager</p>
        </div>
        
        <div className="glass-panel px-6 py-3 rounded-2xl shadow-lg border border-indigo-500/30 flex items-center gap-4 bg-indigo-900/10">
          <div className="flex flex-col items-end">
             <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Your Balance</span>
             <span className="text-2xl font-bold text-white text-shadow-sm">{tokens}</span>
          </div>
          <div className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <Coins size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Action Input */}
          <div className="glass-panel p-6 rounded-2xl shadow-xl">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              Verify Engagement
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={userAction}
                onChange={(e) => setUserAction(e.target.value)}
                placeholder="I liked and commented on 3 posts in the #startup thread..."
                className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none h-32 text-sm placeholder:text-slate-600"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Be honest! The AI checks for quality.</span>
                <button
                  type="submit"
                  disabled={isLoading || !userAction}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400/20"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  Submit Claim
                </button>
              </div>
            </form>
          </div>

          {/* AI Response Area */}
          {aiResponse && (
            <div className="glass-panel bg-indigo-900/10 border-indigo-500/20 rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-600 rounded-lg p-2 text-white mt-1 shadow-lg shadow-indigo-500/20">
                  <MessageCircle size={16} />
                </div>
                <div className="prose prose-sm prose-invert prose-indigo max-w-none text-slate-300">
                  <div className="whitespace-pre-wrap">{aiResponse}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl shadow-xl">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {actionLog.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No verification attempts yet.</p>
              ) : (
                actionLog.map((log, i) => (
                  <div key={i} className="text-xs text-slate-400 border-b border-white/5 last:border-0 pb-2">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/90 to-violet-700/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-700"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Marketplace</h3>
            <p className="text-indigo-100 text-sm mb-4 relative z-10">Spend your hard-earned tokens.</p>
            <ul className="space-y-3 text-sm relative z-10">
              <li className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5 hover:bg-black/30 transition-colors cursor-pointer">
                <span>50 YouTube Likes</span>
                <span className="font-bold text-indigo-200">100 T</span>
              </li>
              <li className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5 hover:bg-black/30 transition-colors cursor-pointer">
                <span>20 Twitter Retweets</span>
                <span className="font-bold text-indigo-200">80 T</span>
              </li>
              <li className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5 hover:bg-black/30 transition-colors cursor-pointer">
                <span>1 Instagram Collab</span>
                <span className="font-bold text-indigo-200">500 T</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};