import { useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { Github, Mail, Shield, Lock, ArrowRight, Activity, ChevronLeft } from 'lucide-react';
import { signInWithGoogle, signInWithGithub } from '../lib/firebase';
import { AppView } from '../types';

interface AuthPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

/**
 * High-Sovereignty Authentication Gateway
 * 
 * Provides a cryptographically-inspired login and registration experience 
 * supporting Google and GitHub identity sharding.
 */
export const AuthPage = ({ onBack, onSuccess }: AuthPageProps) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider);
    setError(null);
    try {
      const user = provider === 'google' ? await signInWithGoogle() : await signInWithGithub();
      if (user) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('[AUTH]: Gateway rejection:', err);
      if (err.message?.includes('operation-not-allowed')) {
        setError(`${provider === 'github' ? 'GitHub' : 'Google'} authentication is not enabled in your Firebase project yet.`);
      } else {
        setError('Authentication sequence interrupted. Please retry.');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-paper flex flex-col items-center justify-center p-8 selection:bg-brand-accent selection:text-brand-primary">
      {/* Background Grid Decoration */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={onBack}
          className="group mb-12 flex items-center gap-2 mono text-[10px] uppercase font-bold text-brand-secondary hover:text-brand-primary transition-colors"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Gateway Return
        </button>

        <div className="bg-white border border-brand-primary p-10 md:p-12 space-y-10 shadow-2xl shadow-brand-primary/5">
          <header className="space-y-6 text-center">
            <div className="flex justify-center">
              <Logo className="w-12 h-12 text-brand-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tighter uppercase italic">Access Gate</h2>
              <p className="mono text-[10px] uppercase tracking-widest text-brand-secondary opacity-60">Synchronize Identity with Anthropol.io</p>
            </div>
          </header>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-50 border border-red-200 rounded-sm space-y-2"
            >
              <p className="text-[11px] text-red-600 font-bold uppercase flex items-center gap-2">
                <Shield size={12} /> Provider Not Enabled
              </p>
              <p className="text-[10px] text-red-500 leading-relaxed">
                {error} 
                <br /><br />
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold underline hover:text-red-700"
                >
                  Visit Firebase Console
                </a> to enable it under <b>Build &gt; Authentication &gt; Sign-in method</b>.
              </p>
            </motion.div>
          )}

          <div className="space-y-4">
            <button 
              disabled={!!loadingProvider}
              onClick={() => handleAuth('google')}
              className={`w-full flex items-center justify-between p-5 border border-brand-primary/10 hover:border-brand-primary hover:bg-zinc-50 transition-all rounded-sm group ${loadingProvider === 'google' ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="flex items-center gap-4">
                <Mail size={18} className="text-brand-secondary" />
                <span className="text-sm font-bold uppercase tracking-tight">Identity via Google</span>
              </div>
              {loadingProvider === 'google' ? (
                <Activity size={14} className="animate-spin text-brand-accent" />
              ) : (
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              )}
            </button>

            <button 
              disabled={!!loadingProvider}
              onClick={() => handleAuth('github')}
              className={`w-full flex items-center justify-between p-5 border border-brand-primary/10 hover:border-brand-primary hover:bg-zinc-50 transition-all rounded-sm group ${loadingProvider === 'github' ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="flex items-center gap-4">
                <Github size={18} className="text-brand-secondary" />
                <span className="text-sm font-bold uppercase tracking-tight">Identity via GitHub</span>
              </div>
              {loadingProvider === 'github' ? (
                <Activity size={14} className="animate-spin text-brand-accent" />
              ) : (
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              )}
            </button>
          </div>

          <div className="pt-8 border-t border-zinc-100 space-y-6">
            <div className="flex gap-4">
              <div className="p-3 bg-brand-surface border border-brand-primary/5 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-brand-accent" />
              </div>
              <div className="space-y-1">
                <p className="mono text-[9px] font-bold uppercase tracking-widest text-brand-primary">Encrypted Handoff</p>
                <p className="text-[10px] text-brand-secondary leading-relaxed opacity-60 italic">Your biometric signals remain local. Only identity shards are synchronized.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-brand-surface border border-brand-primary/5 rounded-lg flex items-center justify-center">
                <Lock size={16} className="text-brand-accent" />
              </div>
              <div className="space-y-1">
                <p className="mono text-[9px] font-bold uppercase tracking-widest text-brand-primary">Non-Custodial</p>
                <p className="text-[10px] text-brand-secondary leading-relaxed opacity-60 italic">Zero-knowledge proof architecture ensures privacy by design.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center mono text-[8px] uppercase tracking-widest opacity-20">
          SECURE_NODE: IDENTITY_VERIFICATION_REQUIRED
        </p>
      </motion.div>
    </div>
  );
};
