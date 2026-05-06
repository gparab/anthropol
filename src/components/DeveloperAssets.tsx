import { useState, useEffect } from 'react';
import { Lock, Eye, Terminal, RefreshCw, ShieldCheck, Bug, Activity } from 'lucide-react';
import { auth } from '../lib/firebase';
import { verificationService } from '../lib/services';
import { LegalZone } from '../types';
import { StressTest } from './StressTest';

export const DeveloperAssets = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [showPublic, setShowPublic] = useState(false);

  const handleRevealSecret = () => {
    if (showSecret) {
      setShowSecret(false);
      return;
    }
    
    // Simulating a secondary security interaction as recommended by UAT
    if (window.confirm(" [SECURITY PROTOCOL] \n\nWarning: You are attempting to reveal a production-grade secret key (at_live_...). \n\nThis key grants full administrative access to your infrastructure nodes. Ensure complete privacy before proceeding.\n\nContinue with reveal?")) {
      setShowSecret(true);
    }
  };
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showStressTest, setShowStressTest] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [sdkTab, setSdkTab] = useState<'react' | 'node' | 'webhook'>('react');

  useEffect(() => {
    let unsubLogs: (() => void) | undefined;
    let isMounted = true;
    
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          let data = await verificationService.getClientProfile(user.uid);
          if (!isMounted) return;

          if (!data) {
            await verificationService.initializeClientProfile(user.uid, user.displayName || 'New Organization');
            data = await verificationService.getClientProfile(user.uid);
          }
          
          if (!isMounted) return;
          setProfile(data);
          setNewName(data?.name || '');

          // Subscribe to real logs
          unsubLogs = verificationService.subscribeToWebhookLogs(user.uid, setWebhookLogs);
        } catch (error) {
          console.error('Failed to load profile/logs:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
      if (unsubLogs) unsubLogs();
    };
  }, []);

  const handleUpdateZone = async (zone: LegalZone) => {
    const user = auth.currentUser;
    if (user) {
      await verificationService.updateClientProfile(user.uid, { legalZone: zone });
      setProfile({ ...profile, legalZone: zone });
      // Implicit feedback through select value change, but let's add a quick toast-like effect if needed
    }
  };

  const handleUpdateName = async () => {
    const user = auth.currentUser;
    if (user && newName.trim()) {
      await verificationService.updateClientProfile(user.uid, { name: newName.trim() });
      setProfile({ ...profile, name: newName.trim() });
      setIsEditingName(false);
    }
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <RefreshCw size={24} className="animate-spin opacity-20" />
    </div>
  );

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase leading-none">Organization Assets</h1>
          <div className="flex items-center gap-4 mt-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/5 rounded-full border border-brand-primary/10">
                <Terminal size={10} className="text-brand-primary" />
                <span className="mono text-[9px] uppercase font-bold text-brand-primary tracking-widest">Client Identity</span>
             </div>
             {isEditingName ? (
               <div className="flex gap-2">
                 <input 
                   value={newName}
                   onChange={(e) => setNewName(e.target.value)}
                   className="mono text-[9px] p-1 border border-brand-primary/20 outline-none focus:bg-brand-accent/10 rounded"
                 />
                 <button onClick={handleUpdateName} className="mono text-[9px] bg-brand-primary text-white px-2 rounded uppercase font-bold">Save</button>
                 <button onClick={() => setIsEditingName(false)} className="mono text-[9px] opacity-50 underline uppercase font-bold">Cancel</button>
               </div>
             ) : (
               <p className="text-brand-secondary mono text-[9px] uppercase tracking-widest opacity-60 group flex items-center gap-2">
                 Entity: {profile?.name || 'Loading...'}
                 <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <RefreshCw size={10} />
                 </button>
               </p>
             )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
           <div className="flex items-center gap-4 justify-end">
             <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest">Regional Shard</p>
             <select 
              value={profile?.legalZone || 'US-EAST'}
              onChange={(e) => handleUpdateZone(e.target.value as LegalZone)}
              className="bg-brand-primary text-brand-paper mono text-[9px] border border-brand-primary/10 px-3 py-1 outline-none uppercase font-bold rounded-sm"
             >
               <option value="US-EAST">US-EAST (Virginia)</option>
               <option value="EU-WEST">EU-WEST (Frankfurt)</option>
               <option value="APAC">APAC (Singapore)</option>
               <option value="LATAM">LATAM (Sao Paulo)</option>
             </select>
           </div>
           <div className="flex flex-col items-end gap-1">
             <div className="flex justify-between w-48 text-[8px] mono uppercase font-bold opacity-40 mb-1">
               <span>Quota Utilization</span>
               <span>{Math.round((profile?.usage?.currentMonth / profile?.usage?.limit) * 100) || 0}%</span>
             </div>
             <div className="w-48 h-1.5 bg-brand-primary/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-accent transition-all duration-1000" 
                  style={{ width: `${(profile?.usage?.currentMonth / profile?.usage?.limit) * 100 || 5}%` }} 
                />
             </div>
           </div>
        </div>
      </header>

      {/* Mode Switcher */}
      <div className="flex gap-4 border-b border-brand-primary pb-4">
        <button 
          onClick={() => setShowStressTest(false)}
          className={`flex items-center gap-2 mono text-xs uppercase px-4 py-2 border ${!showStressTest ? 'bg-brand-primary text-white' : 'hover:bg-brand-accent transition-colors'}`}
        >
          <ShieldCheck size={14} /> Infrastructure Assets
        </button>
        <button 
          onClick={() => setShowStressTest(true)}
          className={`flex items-center gap-2 mono text-xs uppercase px-4 py-2 border ${showStressTest ? 'bg-red-500 text-white' : 'hover:bg-red-500 hover:text-white transition-colors'}`}
        >
          <Bug size={14} /> Adversarial Red-Team
        </button>
      </div>

      {showStressTest ? (
        <StressTest />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
                  <Lock className="text-brand-accent" size={24} /> Infrastructure Access
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-brand-surface border border-brand-primary/5 p-6 rounded-xl flex justify-between items-center group hover:bg-brand-primary hover:text-brand-paper transition-all">
                  <div className="space-y-1">
                    <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest">Secret Key</p>
                    <code className="text-xs font-bold font-mono">
                      {showSecret ? profile?.apiKeys?.secretKey : 'at_live_••••••••••••••••••••••••'}
                    </code>
                  </div>
                  <button 
                    onClick={handleRevealSecret}
                    className="p-3 bg-white/10 rounded-lg hover:bg-brand-accent transition-colors border border-brand-primary/10"
                    title={showSecret ? "Hide Secret" : "Reveal Secret"}
                  >
                    <Eye size={14} className={showSecret ? "text-brand-accent" : ""} />
                  </button>
                </div>
                <div className="bg-brand-surface border border-brand-primary/5 p-6 rounded-xl flex justify-between items-center group hover:bg-brand-primary hover:text-brand-paper transition-all">
                  <div className="space-y-1">
                    <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest">Public Key (Client)</p>
                    <code className="text-xs font-bold font-mono">
                      {showPublic ? (profile?.apiKeys?.publicKey || 'not_found') : 'pk_live_••••••••••••••••••••••••'}
                    </code>
                  </div>
                  <button 
                    onClick={() => setShowPublic(!showPublic)}
                    className="p-3 bg-white/10 rounded-lg hover:bg-brand-accent transition-colors border border-brand-primary/10"
                    title={showPublic ? "Hide Public Key" : "Reveal Public Key"}
                  >
                    <Eye size={14} className={showPublic ? "text-brand-accent" : ""} />
                  </button>
                </div>
                <p className="mono text-[9px] text-right opacity-40 font-bold uppercase tracking-tighter italic">
                  Last Rotation: {profile?.apiKeys?.lastRotated ? new Date(profile.apiKeys.lastRotated).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
                  <Terminal className="text-brand-accent" size={24} /> Webhook Control
                </h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                   <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest">Callback Endpoint</p>
                   <div className="flex flex-col gap-3">
                     <input 
                      placeholder="https://your-api.com/webhooks/anthropol"
                      value={profile?.apiKeys?.webhookUrl || ''}
                      onChange={(e) => setProfile({ ...profile, apiKeys: { ...profile.apiKeys, webhookUrl: e.target.value } })}
                      className="flex-1 mono text-xs p-4 bg-brand-surface border border-brand-primary/5 rounded-xl outline-none focus:bg-white focus:border-brand-accent transition-all font-bold"
                     />
                     <div className="flex justify-between items-center bg-brand-primary text-brand-paper p-3 rounded-lg">
                       <div className="flex items-center gap-3">
                         <ShieldCheck size={14} className="text-brand-success" />
                         <span className="mono text-[9px] uppercase font-bold tracking-widest">HMAC-SHA256 Sig v1</span>
                       </div>
                       <button 
                        onClick={async () => {
                          if (auth.currentUser && profile) {
                             const apiKeys = { 
                               ...profile.apiKeys, 
                               webhookUrl: profile.apiKeys?.webhookUrl || '' 
                             };
                             await verificationService.updateClientProfile(auth.currentUser.uid, { apiKeys });
                             alert('✓ Webhook Endpoint Updated');
                          }
                        }}
                        className="bg-brand-accent text-brand-primary px-4 py-1.5 mono text-[9px] font-bold uppercase hover:bg-white transition-all rounded-sm"
                       >
                         Update
                       </button>
                     </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={async () => {
                      const res: any = await verificationService.testWebhook(profile?.apiKeys?.webhookUrl, profile?.apiKeys?.secretKey);
                      if (res.status === 200) alert('✓ Webhook Delivered (200 OK)');
                      else alert(`✕ Delivery Failed: ${res.error || 'N/A'}`);
                    }}
                    className="bg-brand-surface border border-brand-primary/5 p-4 rounded-xl mono text-[10px] font-bold uppercase hover:bg-brand-accent transition-all flex items-center justify-center gap-2"
                   >
                     <RefreshCw size={12} /> Test Ping
                   </button>
                   <div className="flex items-center justify-center gap-3 bg-brand-surface border border-brand-primary/5 p-4 rounded-xl">
                     <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                     <p className="mono text-[10px] font-bold uppercase tracking-widest">Active State</p>
                   </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
               <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
                   <Activity size={24} className="text-brand-accent" /> Recent Activities
                 </h3>
               </div>
               <div className="space-y-3">
                 {webhookLogs.length === 0 ? (
                   <div className="p-12 text-center bg-brand-surface rounded-xl border border-brand-primary/5">
                     <p className="mono text-[10px] uppercase font-bold opacity-40 tracking-widest">No webhook events recorded</p>
                   </div>
                 ) : (
                   webhookLogs.map((log, i) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-brand-surface border border-brand-primary/5 rounded-xl text-[10px] mono font-bold group hover:bg-brand-primary hover:text-brand-paper transition-all">
                       <span className="opacity-80 uppercase tracking-widest group-hover:opacity-100">POST {log.type || 'EVENT'}</span>
                       <div className="flex gap-6">
                         <span className="text-brand-success">{log.status || 200} OK</span>
                         <span className="opacity-40 uppercase tracking-tighter">{log.time || 'JUST NOW'}</span>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </section>

            <section className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
              <h4 className="text-xl font-bold uppercase tracking-tighter flex items-center gap-3">Advanced Parameters</h4>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-brand-surface rounded-xl border border-brand-primary/5">
                    <span className="mono text-[10px] uppercase font-bold tracking-widest">Enforce Passport Audit</span>
                    <input type="checkbox" checked readOnly className="accent-brand-primary w-4 h-4 cursor-not-allowed" />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-brand-surface rounded-xl border border-brand-primary/5">
                    <span className="mono text-[10px] uppercase font-bold tracking-widest">Webhook Retries (3x)</span>
                    <input type="checkbox" checked readOnly className="accent-brand-primary w-4 h-4 cursor-not-allowed" />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-brand-surface rounded-xl border border-brand-primary/5">
                    <span className="mono text-[10px] uppercase font-bold tracking-widest">IP Whitelisting</span>
                    <span className="mono text-[8px] uppercase bg-brand-accent px-2 py-0.5 rounded-full font-bold">PRO</span>
                 </div>
               </div>
            </section>
          </div>

          <section className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-tighter">SDK Integration</h3>
                <p className="text-brand-secondary mono text-[10px] uppercase tracking-widest opacity-60">Multi-Node Implementation Playground</p>
              </div>
              <div className="flex gap-6 pb-2">
                {['react', 'node', 'webhook'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setSdkTab(tab as any)}
                    className={`mono text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${sdkTab === tab ? 'text-brand-primary border-b-2 border-brand-accent' : 'opacity-30 hover:opacity-100'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div 
                className="bg-brand-primary rounded-2xl p-8 text-brand-accent font-mono text-[11px] space-y-4 overflow-hidden shadow-2xl shadow-brand-primary/20"
                aria-label="SDK Implementation Example"
              >
                {sdkTab === 'react' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center opacity-40 mb-2">
                      <span>humanity_attestation.tsx</span>
                      <span className="cursor-pointer hover:text-white" onClick={() => {
                        const key = profile?.apiKeys?.publicKey || 'pk_live_...';
                        navigator.clipboard.writeText(`import { HumanityOracle } from '@anthropol/sdk';\n\n<HumanityOracle \n  apiKey="${key}"\n  mode="spatial-3d"\n  onAttested={(proof) => console.log(proof)}\n/>`);
                        alert('Copied to clipboard');
                      }}>COPY</span>
                    </div>
                    <div className="text-zinc-500">// Bind hardware identity to physical presence</div>
                    <div className="text-brand-accent font-bold">
                      <span className="text-pink-400">import</span> {'{ HumanityOracle }'} <span className="text-pink-400">from</span> <span className="text-green-400">'@anthropol/sdk'</span>;
                    </div>
                    <div className="mt-4 font-bold">
                      <span className="text-blue-400">{'<HumanityOracle '}</span>
                      <div className="pl-4">
                        <span className="text-zinc-400">apiKey</span>=<span className="text-green-400">"{showPublic ? (profile?.apiKeys?.publicKey || 'pk_live_...') : 'pk_live_••••••••••••••••••••••••'}"</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-zinc-400">mode</span>=<span className="text-green-400">"spatial-3d"</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-zinc-400">onAttested</span>=<span className="text-orange-400">{'(proofId) => {'}</span>
                      </div>
                      <div className="pl-8 text-zinc-400">
                         dispatch(userVerified(proofId));
                      </div>
                      <div className="pl-4 text-orange-400">{'}}'}</div>
                      <span className="text-blue-400">{'/>'}</span>
                    </div>
                  </div>
                )}

                {sdkTab === 'node' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center opacity-40 mb-2">
                      <span>server.ts</span>
                      <span className="cursor-pointer hover:text-white" onClick={() => {
                         navigator.clipboard.writeText(`const anthropol = require('@anthropol/sdk');\n\napp.post('/verify', async (req, res) => {\n  const result = await anthropol.verify(req.body.proofId, process.env.ANTHROPOL_SECRET);\n  return res.json(result);\n});`);
                         alert('Copied');
                      }}>COPY</span>
                    </div>
                    <div className="text-zinc-500">// Verify proofs server-side</div>
                    <div className="text-brand-accent font-bold">
                      <span className="text-pink-400">const</span> anthropol = <span className="text-pink-400">require</span>(<span className="text-green-400">'@anthropol/sdk'</span>);
                    </div>
                    <div className="mt-4 font-bold">
                      <span className="text-pink-400">app</span>.post(<span className="text-green-400">'/verify'</span>, <span className="text-orange-400">async</span> (req, res) ={">"} {'{'}
                      <div className="pl-4">
                        <span className="text-pink-400">const</span> result = <span className="text-orange-400">await</span> anthropol.verify(req.body.proofId, process.env.ANTHROPOL_SECRET);
                      </div>
                      <div className="pl-4">
                        <span className="text-pink-400">return</span> res.json(result);
                      </div>
                      {'}'});
                    </div>
                  </div>
                )}

                {sdkTab === 'webhook' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex justify-between items-center opacity-40 mb-2">
                      <span>signature_verify.ts</span>
                      <span className="cursor-pointer hover:text-white">COPY</span>
                    </div>
                    <div className="text-zinc-500">// Verify manual webhook HMAC</div>
                    <div className="text-brand-accent font-bold">
                      <span className="text-pink-400">import</span> crypto <span className="text-pink-400">from</span> <span className="text-green-400">'crypto'</span>;
                    </div>
                    <div className="mt-4 font-bold">
                      <span className="text-pink-400">const</span> signature = req.headers[<span className="text-green-400">'x-anthropol-signature'</span>];
                      <div className="text-zinc-500 mt-2">// Re-hash payload with secret</div>
                      <span className="text-pink-400">const</span> expected = crypto.createHmac(<span className="text-green-400">'sha256'</span>, SECRET).update(JSON.stringify(req.body)).digest(<span className="text-green-400">'hex'</span>);
                      <div className="mt-2 text-zinc-400">if (expected === signature) {'{ ... }'}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-brand-surface rounded-2xl border border-brand-primary/5">
                  <h4 className="text-lg font-bold uppercase tracking-tight mb-6">Delivery Diagnostics</h4>
                  <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-primary/20">
                    {webhookLogs.length === 0 ? (
                      <p className="mono text-[9px] opacity-40 uppercase font-bold text-center py-10 border-2 border-dashed border-brand-primary/5 rounded-xl">Waiting for events...</p>
                    ) : (
                      webhookLogs.map(log => (
                        <div key={log.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-brand-primary/5">
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${log.status === 200 ? 'bg-brand-success' : 'bg-red-500'}`} />
                             <div className="flex flex-col">
                               <span className="mono text-[10px] font-bold text-brand-primary tracking-tight">POST {log.status}</span>
                               <span className="mono text-[8px] opacity-50 uppercase font-bold tracking-widest">{log.type}</span>
                             </div>
                          </div>
                          <span className="mono text-[9px] opacity-40 font-bold">{log.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="p-8 bg-brand-primary text-brand-paper rounded-2xl shadow-xl shadow-brand-primary/10">
                   <h4 className="text-lg font-bold uppercase tracking-tight mb-4 text-brand-accent">Implementation Note</h4>
                   <p className="text-xs leading-relaxed opacity-60 font-medium">
                     The Humanity Oracle SDK requires hardware-level access to depth sensors. Always ensure your application is served over HTTPS and requests appropriate camera permissions. For local development, use our CLI tunnel to proxy events.
                   </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
