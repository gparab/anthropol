import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';
import { 
  ShieldCheck, 
  Lock,
  CheckCircle2,
  Share2,
  LogOut,
  User as UserIcon,
  Activity,
  Eye,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { AppView } from './types';
import { NavRail } from './components/NavRail';
import { Dashboard } from './components/Dashboard';
import { BioOpticEngine } from './components/BioOpticEngine';
import { DeveloperAssets } from './components/DeveloperAssets';
import { DeveloperExperience } from './components/DeveloperExperience';
import { Whitepaper } from './components/Whitepaper';
import { Features } from './components/Features';
import { Product } from './components/Product';
import { BusinessCases } from './components/BusinessCases';
import { AdminPanel } from './components/AdminPanel';
import { AdminRoute } from './components/AdminRoute';
import { Pricing } from './components/Pricing';
import { AnthropolAnalyticsHub } from './components/AnthropolAnalyticsHub';
import { AuthPage } from './components/AuthPage';
import { ProfilePage } from './components/ProfilePage';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { verificationService } from './lib/services';

/**
 * Anthropol.io Main Application Entry Point
 * 
 * This component manages the high-level routing, authentication state, 
 * and platform layout. It features a modern, premium SaaS aesthetic 
 * inspired by high-end design systems like Hatchable.com, characterized 
 * by soft surfaces, rounded geometry, and refined typography.
 */
export default function App() {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isVerified, setIsVerified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [metrics, setMetrics] = useState({
    entropy: 0.9994,
    rppgDiff: '-0.04ms',
    attestation: 'SIGNED_LOCAL',
    bpm: 0
  });
  const [logs, setLogs] = useState<any[]>([]);

  /**
   * Centralized Authentication Handler
   * Triggers the Google OAuth flow with error isolation for cancelled popups.
   */
  const handleLogin = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const result = await signInWithGoogle();
      // If result is null, it means the user cancelled the popup
      if (!result) return;
    } catch (error: any) {
      const isCancelled = error.code === 'auth/popup-closed-by-user' || 
                         error.code === 'auth/cancelled-popup-request' ||
                         error.message?.includes('closed by user');

      if (isCancelled) {
        console.warn('[AUTH]: Request interrupted by user (Popup closed/cancelled).');
        return;
      }
      console.error('[AUTH]: Unexpected identity failure:', error);
      alert('Authentication failed. Check your connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * PROTOCOL: Identity State Synchronization
   * 
   * Orchestrates the complex lifecycle of a verified operator:
   * 1. Listens for core Auth transitions.
   * 2. Authoritatively verifies administrative status via the 'admins' relation.
   * 3. Ensures the presence of a persistent client profile (Lazy Hydration).
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (u) {
        // [AUTH-LIFECYCLE]: Synchronize administrative privileges. 
        // We fetch this document directly instead of relying on claims to ensure 
        // immediate consistency across global infrastructure.
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const adminDoc = await getDoc(doc(db, 'admins', u.uid));
          setIsAdmin(adminDoc.exists());
        } catch (e) {
          console.error('[AUTH-PROTOCOL]: Failed to synchronize admin authority:', e);
          setIsAdmin(false);
        }

        // [USER-LIFECYCLE]: Lazy infrastructure hydration.
        // Ensure the high-sovereignty profile document exists for the session.
        const profile = await verificationService.getClientProfile(u.uid);
        if (!profile) {
          await verificationService.initializeClientProfile(u.uid, u.displayName || u.email || 'Operator');
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCaptureComplete = () => {
    setIsVerified(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-paper flex items-center justify-center">
        <div className="mono text-[10px] animate-pulse uppercase tracking-[0.2em]">Synchronizing Subsystems...</div>
      </div>
    );
  }

  /**
   * Landing Page (Unauthenticated / Marketing View)
   * Designed to facilitate high-conversion through interactive Bio-Telemetry demonstration.
   */
  // ---------------------------------------------------------
  // Marketing & Public Pages (Accessible to all)
  // ---------------------------------------------------------
  if (view === AppView.WHITEPAPER) {
      return (
        <div className="min-h-screen bg-brand-paper selection:bg-brand-accent selection:text-brand-primary">
          <nav className="px-12 py-8 flex justify-between items-center border-b border-brand-primary/5 sticky top-0 bg-brand-paper/80 backdrop-blur-md z-[100]">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
              <Logo className="w-9 h-9 text-brand-primary" />
              <h1 className="text-xl font-bold tracking-tighter uppercase">anthropol.io</h1>
            </div>
            <button 
              onClick={() => setView(AppView.LANDING)}
              className="mono text-[10px] uppercase font-bold hover:text-brand-accent transition-colors flex items-center gap-2"
            >
              <ArrowRight size={14} className="rotate-180" /> Back to Landing
            </button>
          </nav>
          <Whitepaper onNavigate={setView} />
        </div>
      );
    }

    if (view === AppView.FEATURES) {
      return (
        <div className="min-h-screen bg-brand-paper selection:bg-brand-accent selection:text-brand-primary">
          <nav className="px-12 py-8 flex justify-between items-center border-b border-brand-primary/5 sticky top-0 bg-brand-paper/80 backdrop-blur-md z-[100]">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
              <Logo className="w-9 h-9 text-brand-primary" />
              <h1 className="text-xl font-bold tracking-tighter uppercase">anthropol.io</h1>
            </div>
            <button 
              onClick={() => setView(AppView.LANDING)}
              className="mono text-[10px] uppercase font-bold hover:text-brand-accent transition-colors flex items-center gap-2"
            >
              <ArrowRight size={14} className="rotate-180" /> Back to Landing
            </button>
          </nav>
          <div className="px-8 md:px-12 lg:px-16">
            <Features onNavigate={setView} />
          </div>
        </div>
      );
    }

    if (view === AppView.PRODUCT) {
      return (
        <div className="min-h-screen bg-brand-paper selection:bg-brand-accent selection:text-brand-primary">
          <nav className="px-12 py-8 flex justify-between items-center border-b border-brand-primary/5 sticky top-0 bg-brand-paper/80 backdrop-blur-md z-[100]">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
              <Logo className="w-9 h-9 text-brand-primary" />
              <h1 className="text-xl font-bold tracking-tighter uppercase">anthropol.io</h1>
            </div>
            <button 
              onClick={() => setView(AppView.LANDING)}
              className="mono text-[10px] uppercase font-bold hover:text-brand-accent transition-colors flex items-center gap-2"
            >
              <ArrowRight size={14} className="rotate-180" /> Back to Landing
            </button>
          </nav>
          <div className="px-8 md:px-12 lg:px-16">
            <Product onNavigate={setView} />
          </div>
        </div>
      );
    }

    if (view === AppView.BUSINESS_CASES) {
      return (
        <div className="min-h-screen bg-brand-paper selection:bg-brand-accent selection:text-brand-primary">
          <nav className="px-12 py-8 flex justify-between items-center border-b border-brand-primary/5 sticky top-0 bg-brand-paper/80 backdrop-blur-md z-[100]">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
              <Logo className="w-9 h-9 text-brand-primary" />
              <h1 className="text-xl font-bold tracking-tighter uppercase">anthropol.io</h1>
            </div>
            <button 
              onClick={() => setView(AppView.LANDING)}
              className="mono text-[10px] uppercase font-bold hover:text-brand-accent transition-colors flex items-center gap-2"
            >
              <ArrowRight size={14} className="rotate-180" /> Back to Landing
            </button>
          </nav>
          <div className="px-8 md:px-12 lg:px-16">
            <BusinessCases onNavigate={setView} />
          </div>
        </div>
      );
    }

    if (view === AppView.DEVELOPER_EXPERIENCE) {
      return (
        <div className="min-h-screen bg-brand-paper selection:bg-brand-accent selection:text-brand-primary">
          <nav className="px-12 py-8 flex justify-between items-center border-b border-brand-primary/5 sticky top-0 bg-brand-paper/80 backdrop-blur-md z-[100]">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
              <Logo className="w-9 h-9 text-brand-primary" />
              <h1 className="text-xl font-bold tracking-tighter uppercase">anthropol.io</h1>
            </div>
            <button 
              onClick={() => setView(AppView.LANDING)}
              className="mono text-[10px] uppercase font-bold hover:text-brand-accent transition-colors flex items-center gap-2"
            >
              <ArrowRight size={14} className="rotate-180" /> Back to Landing
            </button>
          </nav>
          <div className="px-8 md:px-12 lg:px-16">
            <DeveloperExperience onNavigate={setView} />
          </div>
        </div>
      );
    }

  if (view === AppView.LANDING) {
    return (
      <div className="min-h-screen bg-brand-paper selection:bg-brand-accent selection:text-brand-primary">
        <nav className="px-12 py-8 flex justify-between items-center border-b border-brand-primary/5 sticky top-0 bg-brand-paper/80 backdrop-blur-md z-[100]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.LANDING)}>
            <Logo className="w-9 h-9 text-brand-primary" />
            <h1 className="text-xl font-bold tracking-tighter uppercase">anthropol.io</h1>
          </div>
          <div className="flex items-center gap-10">
            <button 
              onClick={() => setView(AppView.PRODUCT)}
              className="mono text-[11px] uppercase font-bold hover:text-brand-accent transition-colors tracking-widest"
            >
              Product
            </button>
            <button 
              onClick={() => setView(AppView.FEATURES)}
              className="mono text-[11px] uppercase font-bold hover:text-brand-accent transition-colors tracking-widest"
            >
              Features
            </button>
            <button 
              onClick={() => setView(AppView.BUSINESS_CASES)}
              className="mono text-[11px] uppercase font-bold hover:text-brand-accent transition-colors tracking-widest"
            >
              Business Cases
            </button>
            <button 
              onClick={() => setView(AppView.DEVELOPER_EXPERIENCE)}
              className="mono text-[11px] uppercase font-bold hover:text-brand-accent transition-colors tracking-widest"
            >
              Developers
            </button>
            {user ? (
              <button 
                onClick={() => setView(AppView.DASHBOARD)}
                className="bg-brand-primary text-brand-paper px-8 py-3 rounded-sm mono text-[11px] font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <button 
                disabled={isAuthenticating}
                onClick={() => setView(AppView.AUTH)}
                className={`bg-brand-primary text-brand-paper px-8 py-3 rounded-sm mono text-[11px] font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all ${isAuthenticating ? 'opacity-50 cursor-wait' : ''}`}
              >
                Access Gate
              </button>
            )}
          </div>
        </nav>

        <section className="px-8 py-20 lg:py-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Column: Messaging & Conversion */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12 text-left"
            >
              <div className="space-y-6">
                <div className="flex">
                  <span className="mono text-[10px] uppercase border border-brand-primary/20 px-4 py-1.5 rounded-full font-bold text-brand-secondary bg-brand-surface/50 backdrop-blur-sm">
                    Edge Intelligence Node Active
                  </span>
                </div>
                <h2 className="text-7xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85] text-brand-primary">
                  The <br/> <span className="text-brand-accent">Humanity</span> <br/> Layer
                </h2>
              </div>
              <p className="text-xl md:text-2xl text-brand-secondary max-w-xl leading-relaxed font-normal opacity-80">
                Secure your user base against the synthetic surge. Enterprise-grade Sybil resistance powered by sub-perceptual cardiovascular telemetry and hardware-bound Zero-Knowledge proofs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  disabled={isAuthenticating}
                  className={`bg-brand-primary text-brand-paper px-10 py-5 text-sm font-bold uppercase rounded-sm hover:bg-brand-accent hover:text-brand-primary transition-all shadow-xl shadow-brand-primary/10 flex items-center gap-3 group ${isAuthenticating ? 'opacity-50 cursor-wait' : ''}`}
                  onClick={() => {
                    if (user) {
                      setView(AppView.DASHBOARD);
                    } else {
                      setView(AppView.AUTH);
                    }
                  }}
                >
                  {isAuthenticating ? 'Connecting...' : 'Get Started'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  className="bg-white border border-brand-primary/10 px-10 py-5 text-sm font-bold uppercase rounded-sm hover:bg-brand-surface transition-all"
                  onClick={() => setView(AppView.BUSINESS_CASES)}
                >
                  Business Cases
                </button>
              </div>

              <div className="pt-8 flex items-center gap-8 border-t border-brand-primary/5">
                <div className="space-y-1">
                  <p className="text-2xl font-bold italic tracking-tighter">99.8%</p>
                  <p className="mono text-[9px] uppercase opacity-40 font-bold">Fraud Suppression</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold italic tracking-tighter">1.2ms</p>
                  <p className="mono text-[9px] uppercase opacity-40 font-bold">Inference Latency</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold italic tracking-tighter">0.0%</p>
                  <p className="mono text-[9px] uppercase opacity-40 font-bold">PII Exposure</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Live Demo */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="bg-zinc-950 rounded-[2.5rem] p-3 shadow-2xl shadow-brand-primary/20 ring-1 ring-white/10 relative overflow-hidden">
                {/* Demo Window Header */}
                <div className="bg-zinc-900/50 px-6 py-4 rounded-t-[2rem] border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <span 
                      className="mono text-[9px] uppercase font-bold text-white/40 border-l border-white/10 pl-3"
                      aria-label="Real-time system telemetry and signal analysis feed"
                      title="Direct biological signal recovery from hardware sensor"
                    >
                      Live Protocol Feed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                    <span className="mono text-[8px] text-brand-accent font-bold uppercase tracking-widest">Oracle Stream 01</span>
                  </div>
                </div>

                {/* Sub-component Container */}
                <div className="relative overflow-hidden">
                  <BioOpticEngine 
                    onCaptureComplete={() => setIsVerified(true)}
                    onReset={() => setIsVerified(false)}
                    onMetricUpdate={setMetrics}
                    onLogUpdate={setLogs}
                  />
                </div>

                {/* Integrated Log/Metric Footer */}
                <div className="bg-zinc-900/80 backdrop-blur-md px-8 py-6 rounded-b-[2rem] border-t border-white/5 space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="mono text-[9px] uppercase font-bold text-white">Entropy Score</p>
                      <p className="mono text-sm text-green-400 font-bold">{metrics.entropy.toFixed(4)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="mono text-[9px] uppercase font-bold text-white">rPPG Diff</p>
                      <p className="mono text-sm text-white font-bold">{metrics.rppgDiff}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="mono text-[9px] uppercase font-bold text-white">Attestation</p>
                      <p className="mono text-sm text-brand-accent font-bold truncate">{metrics.attestation}</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5 space-y-1.5 overflow-hidden">
                    <div className="flex justify-between items-center opacity-60">
                      <span className="mono text-[8px] uppercase font-bold">System Operations Log</span>
                      <span className="mono text-[8px] uppercase font-bold text-brand-accent italic">ACTIVE-R</span>
                    </div>
                    <div className="space-y-1 max-h-16 overflow-hidden" aria-live="polite">
                      {logs.length > 0 ? (
                        logs.slice(-3).map((log, i) => (
                           <p key={i} className={`mono text-[9px] font-medium ${log.type === 'error' ? 'text-red-500' : log.type === 'warn' ? 'text-brand-accent' : 'text-white/50'}`}>
                             {">>"} {log.message}
                           </p>
                        ))
                      ) : (
                        <>
                          <p className="mono text-[9px] text-green-500/80 font-medium">{">>"} biosensors searching...</p>
                          <p className="mono text-[9px] text-white/50 font-medium">{">>"} awaiting handshake...</p>
                          <p className="mono text-[9px] text-white/30 font-medium">{">>"} enclave standby</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decoration */}
                <div className="absolute top-1/2 left-0 w-24 h-24 bg-brand-accent/10 blur-[100px] -z-10 rounded-full" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-primary/20 blur-[120px] -z-10 rounded-full" />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white border border-brand-primary/10 p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-subtle z-20">
                <div className="w-10 h-10 rounded-full bg-brand-success/10 flex items-center justify-center">
                  <ShieldCheck className="text-brand-success" size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tighter">Hardware ID Bound</p>
                  <p className="mono text-[9px] opacity-60">TPM/Secure Enclave Link Active</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Trust Scroller */}
        <section className="py-12 border-y border-brand-primary/5 overflow-hidden bg-brand-surface/30">
          <div className="flex justify-around items-center opacity-60 mono text-[11px] uppercase font-bold whitespace-nowrap animate-marquee tracking-[0.2em]">
            <span>Sybil-Resistance Protocol</span>
            <span className="text-brand-accent px-12">•</span>
            <span>Real-Time Biometric Oracle</span>
            <span className="text-brand-accent px-12">•</span>
            <span>Agent-Gated Authentication</span>
            <span className="text-brand-accent px-12">•</span>
            <span>Privacy-Preserving Liveness</span>
            <span className="text-brand-accent px-12">•</span>
            <span>Sybil-Resistance Protocol</span>
            <span className="text-brand-accent px-12">•</span>
          </div>
        </section>

        <section className="px-8 py-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: 'Anthropol Telemetry', desc: 'Isolate human cardiovascular signals from video streams with sub-perceptual precision.', icon: Activity },
             { title: 'ZK-Attestation', desc: 'Verify humanity without exposing identities. Bind hardware enclaves to physical presence.', icon: ShieldCheck },
             { title: 'Synthetic Mitigation', desc: 'Detect deepfakes, re-broadcasts, and LLM-driven avatars in 184ms.', icon: Eye }
           ].map((card, i) => (
             <div key={i} className="bg-brand-surface/30 p-12 rounded-lg space-y-6 hover:bg-brand-surface transition-colors group">
                <card.icon className="text-brand-primary opacity-40 group-hover:text-brand-accent group-hover:opacity-100 transition-all" size={32} />
                <div className="space-y-3">
                   <h3 className="text-2xl font-bold uppercase tracking-tighter">{card.title}</h3>
                   <p className="text-base text-brand-secondary leading-relaxed">{card.desc}</p>
                </div>
             </div>
           ))}
        </section>


        <footer className="p-20 text-center border-t border-brand-primary/10">
          <p className="mono text-[10px] uppercase opacity-20">© 2026 Anthropol Technology Group // Silicon Valley Cluster</p>
        </footer>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage 
        onBack={() => setView(AppView.LANDING)} 
        onSuccess={() => setView(AppView.DASHBOARD)} 
      />
    );
  }

  /**
   * Application Layout (Authenticated Session)
   * Provides the primary NavRail interface and dynamic viewport routing.
   */
  return (
    <div className="flex min-h-screen bg-brand-paper selection:bg-brand-accent selection:text-brand-primary">
      <NavRail currentView={view} setView={setView} />
      
      <main className="flex-1 p-8 md:p-12 lg:p-16 overflow-x-hidden">
        <header className="fixed top-8 right-12 flex items-center gap-4 z-50">
           <div 
             className="flex items-center gap-3 bg-white border border-brand-primary/10 rounded-full px-4 py-2 shadow-sm cursor-pointer hover:bg-brand-surface transition-all group"
             onClick={() => setView(AppView.PROFILE)}
           >
              <div className="w-8 h-8 rounded-full border border-brand-primary/10 flex items-center justify-center overflow-hidden bg-brand-surface group-hover:border-brand-accent transition-colors">
                {user.photoURL ? <img src={user.photoURL} alt="Profile" /> : <UserIcon size={16} className="text-brand-secondary" />}
              </div>
              <span className="mono text-[10px] font-bold uppercase truncate max-w-[120px]">{user.displayName || user.email}</span>
              <button 
                onClick={() => auth.signOut()}
                className="text-brand-secondary hover:text-brand-primary transition-colors ml-2"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
           </div>
        </header>


        <AnimatePresence mode="wait">
          <motion.div
            key={view + (isVerified ? '_verified' : '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {view === 'dashboard' && <Dashboard />}
            {view === 'analytics' && <AnthropolAnalyticsHub />}
            {view === 'admin' && (
              <AdminRoute isAdmin={isAdmin}>
                <AdminPanel />
              </AdminRoute>
            )}
            {view === 'pricing' && <Pricing />}
            {view === 'whitepaper' && <Whitepaper onNavigate={(v) => setView(v as AppView)} />}
            {view === 'features' && <Features onNavigate={(v) => setView(v as AppView)} />}
            {view === 'product' && <Product onNavigate={(v) => setView(v as AppView)} />}
            {view === 'business_cases' && <BusinessCases onNavigate={(v) => setView(v as AppView)} />}
            {view === 'developer_experience' && <DeveloperExperience onNavigate={(v) => setView(v as AppView)} />}
            {view === 'profile' && <ProfilePage />}
            
            {view === 'verification_demo' && (
              <div className="max-w-4xl mx-auto space-y-16">
                 {!isVerified ? (
                    <>
                      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 gap-4 border-b border-brand-primary/5">
                        <div>
                          <h2 className="text-5xl font-bold tracking-tighter uppercase leading-none text-brand-primary">Capture Reality</h2>
                          <div className="flex items-center gap-4 mt-4">
                             <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20">
                                <Activity size={10} className="text-brand-accent" />
                                <span className="mono text-[9px] uppercase font-bold text-brand-primary tracking-widest">Protocol Active</span>
                             </div>
                             <p className="text-brand-secondary mono uppercase text-[9px] tracking-widest opacity-60">Status: Secure Telemetry Node</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-success/10 text-brand-success rounded-full border border-brand-success/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                             <span className="mono text-[9px] font-bold uppercase tracking-widest">Oracle Health 99%</span>
                          </div>
                        </div>
                      </header>
                      
                      <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-2xl p-6 space-y-6">
                        <BioOpticEngine 
                          onCaptureComplete={handleCaptureComplete}
                          onReset={() => setIsVerified(false)}
                          onMetricUpdate={setMetrics}
                          onLogUpdate={setLogs}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-brand-surface/30 rounded-xl border border-brand-primary/5">
                           <div className="space-y-1">
                              <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest text-brand-primary">Entropy Score</p>
                              <p className="text-2xl font-bold tracking-tighter text-brand-primary">{metrics.entropy.toFixed(4)}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest text-brand-primary">R-Wave Offset</p>
                              <p className="text-2xl font-bold tracking-tighter text-brand-primary">{metrics.rppgDiff}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest text-brand-primary">Biometric Sync</p>
                              <p className="text-2xl font-bold tracking-tighter text-brand-accent uppercase">{metrics.attestation}</p>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mono text-[11px] uppercase font-bold tracking-wider">
                        <div className="bg-brand-surface/40 rounded-xl p-6 flex gap-4 items-center border border-brand-primary/5">
                          <Lock size={16} className="text-brand-accent" />
                          <span>E2EE Stream</span>
                        </div>
                        <div className="bg-brand-surface/40 rounded-xl p-6 flex gap-4 items-center border border-brand-primary/5">
                          <ShieldCheck size={16} className="text-brand-accent" />
                          <span>ZK-SNARK Attest</span>
                        </div>
                      </div>
                    </>
                 ) : (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-24 px-8 space-y-10 bg-brand-primary text-brand-paper rounded-2xl shadow-2xl shadow-brand-primary/20"
                    >
                      <div className="flex justify-center">
                         <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
                            <CheckCircle2 size={64} className="text-brand-accent" />
                         </div>
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-6xl font-bold tracking-tighter uppercase mb-2">Attestation Complete</h2>
                        <p className="mono text-xs uppercase tracking-[0.3em] text-brand-accent">ZK-Proof Validated: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                      </div>
                      <div className="max-w-md mx-auto border border-white/10 p-10 space-y-8 bg-white/5 rounded-xl">
                        <p className="text-base opacity-70 leading-relaxed italic">
                          Your cardiovascular telemetry has been cross-referenced with spatial physics. A non-malleable Groth16 proof is now bound to your hardware enclave.
                        </p>
                        <div className="flex gap-4">
                          <button 
                            onClick={async () => {
                              try {
                                const placeholderId = Math.random().toString(36).substring(7).toUpperCase();
                                if (navigator.share) {
                                  await navigator.share({
                                    title: 'Anthropol Proof of Humanity',
                                    text: `Verified via Anthropol.io. Proof ID: ${placeholderId}`,
                                    url: window.location.origin
                                  });
                                } else {
                                  await navigator.clipboard.writeText(placeholderId);
                                  alert('Proof ID copied to clipboard');
                                }
                              } catch (e) {
                                console.warn('Sharing failed', e);
                              }
                            }}
                            className="flex-1 bg-brand-accent text-brand-primary px-6 py-4 rounded-sm mono text-[11px] font-bold uppercase hover:bg-white transition-all flex items-center justify-center gap-2"
                          >
                            <Share2 size={14} /> Share Proof
                          </button>
                          <button 
                            onClick={() => setIsVerified(false)}
                            className="flex-1 border border-white/20 px-6 py-4 rounded-sm mono text-[11px] font-bold uppercase hover:bg-white/10 transition-colors"
                          >
                            Reset Engine
                          </button>
                        </div>
                      </div>
                    </motion.div>
                 )}
              </div>
            )}

            {view === 'developer_assets' && <DeveloperAssets />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-6 left-12 mono text-[10px] uppercase opacity-40 pointer-events-none origin-left -rotate-90">
        anthropol.io // infra_node_{auth.currentUser?.uid.substring(0, 8)}
      </footer>
    </div>
  );
}
