import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  isForced?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, isForced = false }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));

      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Close Button */}
        {!isForced && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white z-20 transition-colors bg-black/20 hover:bg-black/40 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="p-8 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4">
              <Layout size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm mt-2 text-center max-w-xs">
              {isLogin 
                ? 'Sign in to continue using OmniCreator.' 
                : 'You have reached your free usage limit. Create an account to continue.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};