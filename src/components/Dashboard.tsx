import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ChevronRight, 
  History, 
  X,
  RefreshCw,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Logo } from './Logo';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { SignalMonitor } from './SignalMonitor';
import { ProofExplorer } from './ProofExplorer';
import { verificationService } from '../lib/services';
import { auth } from '../lib/firebase';
import { webAuthnService } from '../lib/webauthn';
import { VerificationResult } from '../types';

/**
 * Command Center Dashboard
 * 
 * Provides a high-level operational overview of identity verification metrics, 
 * spoofing trends, hardware security status, and live signal telemetry.
 */
export const Dashboard = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [verifications, setVerifications] = useState<VerificationResult[]>([]);
  const [selectedProofData, setSelectedProofData] = useState<VerificationResult | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [registeringHardware, setRegisteringHardware] = useState(false);

  const [hasPasskey, setHasPasskey] = useState(!!localStorage.getItem('anthropol_passkey'));
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  /**
   * Analytics & Data Ingestion
   * Synchronizes performance telemetry using client-side listener.
   */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setAnalyticsError('User not authenticated');
      return;
    }

    return verificationService.subscribeToHourlyAnalytics(
      user.uid,
      (data) => {
        setAnalyticsData(data);
        setAnalyticsError(null);
      },
      (err) => {
        console.error('[INFRA]: Failed to load live analytics aggregator.', err);
        setAnalyticsError(err);
        setAnalyticsData([]);
      }
    );
  }, []);

  /**
   * Triggers hardware-enclave binding for the current session ID.
   */
  const handleRegisterHardware = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setRegisteringHardware(true);
    try {
      const id = await webAuthnService.registerPasskey(user.uid);
      localStorage.setItem('anthropol_passkey', id);
      setHasPasskey(true);
    } catch (e) {
      console.warn('[WEBAUTHN]: Hardware registration aborted.');
    } finally {
      setRegisteringHardware(false);
    }
  };

  /**
   * Exports the current verification dataset as a JSON file.
   */
  const handleExport = () => {
    if (verifications.length === 0) return alert('No data to export.');
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(verifications, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `anthropol_audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  /**
   * Toggles the "Right to be Forgotten" privacy mode in the client profile.
   */
  const togglePurgeTelemetry = async () => {
    const user = auth.currentUser;
    if (!profile || !user) return;
    setUpdatingPrivacy(true);
    const newValue = !profile.privacySettings?.purgeTelemetry;
    try {
      await verificationService.updateClientProfile(user.uid, {
        privacySettings: { ...profile.privacySettings, purgeTelemetry: newValue }
      });
      setProfile({ ...profile, privacySettings: { ...profile.privacySettings, purgeTelemetry: newValue } });
    } catch (e) {
      console.error('Privacy update failed:', e);
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  // Sync selected session data
  useEffect(() => {
    if (selectedSession) {
      const data = verifications.find(v => v.id === selectedSession);
      setSelectedProofData(data || null);
    } else {
      setSelectedProofData(null);
    }
  }, [selectedSession, verifications]);

  /**
   * Real-time Synchronization Strategy
   * Initializes multi-stream subscriptions for profile discovery, 
   * global network stats, and the personalized verification ledger.
   */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Fetch Client Profile
    verificationService.getClientProfile(user.uid).then(setProfile);

    // 2. Subscribe to Global Network Stats
    const unsubGlobal = verificationService.subscribeToGlobalStats(setGlobalStats);

    // 3. Subscribe to Personalized Verification Feed
    const unsubscribe = verificationService.subscribeToVerifications(user.uid, (data) => {
      setVerifications(data.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      }));
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubGlobal();
    };
  }, []);

  const stats = [
    { label: 'Total Verifications', val: (globalStats?.totalVerifications || 1285).toLocaleString(), delta: 'GLOBAL' },
    { label: 'Bot Interceptions', val: (globalStats?.botInterceptions || 14202).toLocaleString(), delta: 'BLOCKED' },
    { label: 'Network Stability', val: `${globalStats?.successRate || 98.2}%`, delta: 'OPTIMAL' }
  ];

  if (loading && verifications.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-brand-accent" size={32} />
          <p className="mono text-[10px] uppercase opacity-40 tracking-widest">Handshaking Biological Oracle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <ProofExplorer 
        isOpen={!!selectedProofData} 
        onClose={() => setSelectedSession(null)} 
        proof={selectedProofData} 
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 gap-6 border-b border-brand-primary/5 mb-10">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase leading-none">Command Center</h1>
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-success/10 rounded-full border border-brand-success/10">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                <span className="mono text-[9px] uppercase font-bold text-brand-success tracking-widest">Protocol Active</span>
             </div>
             <p className="text-brand-secondary mono uppercase text-[9px] tracking-widest opacity-60">Node: infra-01-us-east</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none bg-brand-primary text-brand-paper px-8 py-3 rounded-sm mono text-[11px] font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all shadow-lg shadow-brand-primary/10"
          >
            Audit Export
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!selectedSession ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            {/* Subsystem Audit Table */}
            <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10">
               <div className="flex justify-between items-center mb-12">
                 <div>
                    <h3 className="text-3xl font-bold uppercase tracking-tighter">Subsystem Integrity</h3>
                    <p className="text-brand-secondary mono text-[10px] uppercase mt-1 tracking-widest">Global Service Layer Health</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="mono text-[10px] uppercase font-bold text-brand-secondary">Grade:</span>
                    <span className="mono text-[11px] bg-brand-accent/20 text-brand-primary px-4 py-1.5 rounded-full uppercase font-bold border border-brand-accent/50">Standard 1.A</span>
                 </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left mono text-[11px] uppercase tracking-wider">
                   <thead>
                     <tr className="border-b border-brand-primary/5 opacity-40">
                       <th className="pb-6 font-bold">Module</th>
                       <th className="pb-6 font-bold">Protocol</th>
                       <th className="pb-6 font-bold">Stability</th>
                       <th className="pb-6 text-right font-bold">Recall Rate</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-brand-primary/5">
                     <tr>
                       <td className="py-8 font-bold text-brand-primary">ZK-SNARK Proof Aggregator</td>
                       <td className="text-brand-secondary">Groth16 / Circom</td>
                       <td className="text-brand-success font-bold">Atomic</td>
                       <td className="text-right font-bold text-2xl tracking-tighter text-brand-primary leading-none">{globalStats?.successRate ? (parseFloat(globalStats.successRate) - 3.4).toFixed(1) : '94.8'}%</td>
                     </tr>
                     <tr>
                       <td className="py-8 font-bold text-brand-primary">WebAuthn Hardware Bond</td>
                       <td className="text-brand-secondary">Enclave (TPM)</td>
                       <td className={hasPasskey ? "text-brand-success font-bold" : "text-brand-accent font-bold"}>
                         {hasPasskey ? 'Verified' : 'Virtual'}
                       </td>
                       <td className="text-right font-bold text-2xl tracking-tighter text-brand-primary leading-none">{hasPasskey ? '99.9%' : '82.4%'}</td>
                     </tr>
                     <tr>
                       <td className="py-8 font-bold text-brand-primary">rPPG r/Pulse Detection</td>
                       <td className="text-brand-secondary">DSP Engine Cluster</td>
                       <td className="text-brand-success font-bold">Sync</td>
                       <td className="text-right font-bold text-2xl tracking-tighter text-brand-primary leading-none">{globalStats?.successRate ? (parseFloat(globalStats.successRate)).toFixed(1) : '98.2'}%</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Performance Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-brand-surface rounded-2xl p-10 border border-brand-primary/5 hover:bg-brand-surface/80 transition-all group">
                  <p className="mono text-[11px] uppercase text-brand-secondary font-bold tracking-[0.2em] mb-4">{stat.label}</p>
                  <div className="flex justify-between items-end">
                    <h2 className="text-5xl font-bold tracking-tighter text-brand-primary">{stat.val}</h2>
                    <span className="mono text-[10px] uppercase font-bold text-brand-accent bg-brand-primary px-3 py-1 rounded-full mb-1">{stat.delta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical Intelligence: Trends & Hardware Enclave Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold tracking-tighter uppercase flex items-center gap-3">
                       <Activity className="text-brand-accent" size={24} /> Attack Vectors
                    </h3>
                    <p className="mono text-[10px] uppercase text-brand-secondary tracking-widest font-bold">24-Hour Distribution // Live Edge Logs</p>
                  </div>
                </div>
                <div className="h-64 w-full relative">
                  {analyticsError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-red-500/5 rounded-xl border border-red-500/20">
                      <ShieldCheck className="text-red-500" size={32} />
                      <div className="text-center">
                        <p className="mono font-bold uppercase text-red-500 text-xs tracking-widest">Network Outage</p>
                        <p className="text-brand-secondary text-sm mt-1">{analyticsError}</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData}>
                        <defs>
                        <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-brand-primary)" strokeOpacity={0.05} />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#15120d', fontWeight: 600, opacity: 0.4 }} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ border: 'none', backgroundColor: '#15120d', borderRadius: '12px', fontSize: '10px', fontWeight: 600, padding: '12px', color: '#fbf8f1' }}
                        cursor={{ stroke: 'var(--color-brand-accent)', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="human" stroke="var(--color-brand-primary)" fillOpacity={1} fill="url(#colorHuman)" strokeWidth={3} name="Verified" />
                      <Area type="step" dataKey="mask" stroke="#e06344" fill="#e0634411" strokeWidth={1.5} name="Synthetic Attack" />
                    </AreaChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Hardware Enclave Status Card */}
              <div className="bg-brand-primary rounded-2xl p-10 flex flex-col justify-between text-brand-paper shadow-2xl shadow-brand-primary/20">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-bold tracking-tighter uppercase flex items-center gap-3">
                         <Logo className={hasPasskey ? 'text-brand-accent w-8 h-8' : 'w-8 h-8 opacity-40'} /> Hardware Enclave
                       </h3>
                       <p className="mono text-[10px] uppercase text-brand-accent tracking-widest font-bold">WebAuthn Session Protocol</p>
                    </div>
                    <div className={`px-4 py-1.5 mono text-[10px] uppercase font-bold rounded-full border ${hasPasskey ? 'bg-brand-accent/20 text-brand-accent border-brand-accent/50' : 'bg-white/10 text-white/40 border-white/10'}`}>
                      {hasPasskey ? 'Atomic Binding' : 'Virtual Mode'}
                    </div>
                  </div>
                  <p className="text-lg opacity-70 leading-relaxed max-w-sm">
                    {hasPasskey 
                      ? "Identity proofs are cryptographically bound to this physical device's Secure Enclave. Verification is non-repudiable." 
                      : "Identity is verified via software logic. For institutional-grade security, bind your biological biometric enclave."}
                  </p>
                </div>
                {!hasPasskey && (
                  <button 
                    onClick={handleRegisterHardware}
                    disabled={registeringHardware}
                    className="w-full mt-10 bg-brand-accent text-brand-primary py-5 rounded-xl mono font-bold text-xs uppercase hover:bg-white transition-all flex items-center justify-center gap-3"
                  >
                    {registeringHardware ? <RefreshCw className="animate-spin" size={16} /> : <Logo className="w-5 h-5" color="currentColor" />}
                    Bind Secure Enclave
                  </button>
                )}
                {hasPasskey && (
                   <div className="mt-10 p-6 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3">
                     <div className="flex justify-between items-center text-white/40">
                        <span className="mono text-[9px] uppercase font-bold tracking-widest">Attestation Anchor</span>
                        <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(245,184,64,0.5)]" />
                     </div>
                     <code className="text-[11px] break-all opacity-80 font-mono font-medium">••••••••-••••-••••-••••-••••••••••••</code>
                   </div>
                )}
              </div>
            </div>

            {/* Privacy Compliance Banner */}
            <div className="bg-brand-surface rounded-2xl p-12 border border-brand-primary/5">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <ShieldCheck className="text-brand-primary" size={32} />
                     <h3 className="text-4xl font-bold tracking-tighter uppercase">Privacy Shield: Purge-on-Proof</h3>
                  </div>
                  <p className="text-brand-secondary text-lg max-w-3xl leading-relaxed">
                    GDPR Sovereignty Mode. When active, Anthropol purges raw biological telemetry immediately after ZK-proof generation. Infrastructure only persists final IDs.
                  </p>
                </div>
                <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-2xl border border-brand-primary/5">
                  <span className="mono text-[11px] uppercase font-bold text-brand-primary tracking-widest">Shield Status</span>
                  <button 
                    onClick={togglePurgeTelemetry}
                    disabled={updatingPrivacy}
                    className={`relative w-16 h-8 rounded-full transition-all ${profile?.privacySettings?.purgeTelemetry ? 'bg-brand-success' : 'bg-brand-surface border border-brand-primary/10'}`}
                  >
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 700, damping: 30 }}
                      className={`absolute top-1 w-6 h-6 rounded-full shadow-sm ${profile?.privacySettings?.purgeTelemetry ? 'right-1 bg-white' : 'left-1 bg-brand-primary'}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Verification Feed */}
            <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm overflow-hidden">
              <div className="border-b border-brand-primary/5 p-8 flex justify-between items-center bg-brand-surface/30">
                <span className="mono text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">Telemetry Sync // Cluster-01</span>
                <div className="flex items-center gap-3 px-4 py-1.5 bg-brand-paper rounded-full border border-brand-primary/5">
                  <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                  <span className="mono text-[10px] uppercase font-bold text-brand-success tracking-widest">Online</span>
                </div>
              </div>
              <div className="divide-y divide-brand-primary/5">
                {verifications.length > 0 ? verifications.map((v) => (
                  <div 
                    key={v.id} 
                    onClick={() => setSelectedSession(v.id)}
                    className="p-8 flex justify-between items-center hover:bg-brand-surface transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-14 h-14 rounded-2xl border border-brand-primary/5 flex items-center justify-center bg-brand-surface group-hover:bg-brand-primary group-hover:border-brand-primary transition-all">
                        <ShieldCheck size={24} className="text-brand-primary group-hover:text-brand-accent transition-colors" />
                      </div>
                      <div>
                        <p className="mono font-bold text-2xl tracking-tighter uppercase text-brand-primary">{v.id.substring(0, 12)}</p>
                        <p className="text-[11px] uppercase font-bold text-brand-secondary tracking-widest mt-1 opacity-60">Humanity Certification // {v.status} // {new Date(v.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-12 items-center">
                      <div className="hidden lg:flex gap-8 mono text-[11px] uppercase font-bold tracking-[0.2em] text-brand-secondary">
                        <div className="flex flex-col items-end">
                           <span className="opacity-40 text-[9px]">r-PULSE</span>
                           <span className="text-brand-primary">{v.score.toFixed(3)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="opacity-40 text-[9px]">PROTOCOL</span>
                           <span className="text-brand-primary">Groth16</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="opacity-40 text-[9px]">SYNC</span>
                           <span className="text-brand-success uppercase">OK</span>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-brand-primary/20 group-hover:text-brand-primary group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                )) : (
                  <div className="p-40 text-center space-y-8">
                     <div className="w-24 h-24 bg-brand-surface rounded-full flex items-center justify-center mx-auto">
                        <Activity className="text-brand-primary/10" size={48} />
                     </div>
                     <div className="space-y-2">
                        <p className="mono text-sm uppercase font-bold text-brand-primary tracking-widest">Static Feed detected.</p>
                        <p className="text-base text-brand-secondary max-w-xs mx-auto leading-relaxed">Initiate a biological heartbeat scan to populate the command center logs.</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center">
               <button 
                onClick={() => setSelectedSession(null)}
                className="flex items-center gap-3 bg-brand-primary text-brand-paper px-8 py-4 rounded-xl mono text-[11px] font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all shadow-xl shadow-brand-primary/10"
               >
                 <History size={16} /> Return to Intelligence Feed
               </button>
               <div className="flex items-center gap-4">
                  <div className="px-6 py-4 rounded-xl border border-brand-primary/5 bg-white shadow-sm flex flex-col items-end">
                     <span className="mono text-[9px] uppercase font-bold text-brand-secondary tracking-widest">Payload Anchor</span>
                     <span className="mono text-[11px] font-bold text-brand-primary">{selectedSession}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedSession(null)}
                    className="p-4 rounded-xl hover:bg-brand-surface transition-colors border border-brand-primary/5"
                  >
                    <X size={24} />
                  </button>
               </div>
            </div>
            
            <header className="space-y-6">
               <h2 className="text-7xl font-bold tracking-tighter uppercase leading-[0.9]">High-Fidelity <br/> Stream Audit</h2>
               <p className="text-brand-secondary max-w-3xl text-xl leading-relaxed">
                 Detailed biological analysis for payload anchor. Inspecting cardiovascular pulse consistency and spectral texture variance across the 3.0s capture window.
               </p>
            </header>

            <div className="bg-white rounded-3xl border border-brand-primary/5 shadow-2xl p-4">
              <SignalMonitor sessionData={verifications.find(v => v.id === selectedSession)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
