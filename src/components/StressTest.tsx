import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Bug, ShieldAlert, CheckCircle, Upload, Play, AlertTriangle, Terminal, Activity, RefreshCw } from 'lucide-react';
import { aiOracle } from '../lib/gemini';
import axios from 'axios';

const THREAT_PACKETS = [
  { 
    id: 'deepfake_01', 
    name: 'Latent Diffusion Injection', 
    description: 'AI-generated facial articulation with mismatched eye-glints.',
    type: 'deepfake',
    severity: 'critical'
  },
  { 
    id: 'print_02', 
    name: '2D Presentation Attack', 
    description: 'High-res photograph of a subject with cut-out eyes.',
    type: 'presentation',
    severity: 'high'
  },
  { 
    id: 'video_03', 
    name: 'Re-broadcast Loop', 
    description: 'recorded video played back on an iPad Pro screen.',
    type: 'rebroadcast',
    severity: 'medium'
  }
];

export const StressTest = () => {
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAudit = async (threatId: string) => {
    setIsTesting(true);
    setSelectedThreat(threatId);
    setResult(null);
    setErrorMsg(null);
    
    try {
      const response = await axios.post('/api/stress-test', { threatId });
      setResult(response.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTesting(true);
    setSelectedThreat('upload');
    setResult(null);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result?.toString().split(',')[1];
        if (base64Data) {
          const response = await axios.post('/api/stress-test', {
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg'
          });
          setResult(response.data);
        }
        setIsTesting(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setErrorMsg(error.message);
      setIsTesting(false);
    }
  };

  return (
    <div id="stress-test-dashboard" className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Threat Selection */}
        <section className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
              <Terminal className="text-brand-accent" size={24} /> Attack Vectors
            </h3>
          </div>
          
          <div className="space-y-4">
            {THREAT_PACKETS.map((threat) => (
              <button
                key={threat.id}
                onClick={() => runAudit(threat.id)}
                disabled={isTesting}
                className={`w-full p-6 text-left transition-all rounded-xl border flex flex-col gap-3 group relative overflow-hidden ${
                  selectedThreat === threat.id 
                    ? 'bg-brand-primary border-brand-primary text-brand-paper shadow-xl shadow-brand-primary/20' 
                    : 'bg-brand-surface border-brand-primary/5 hover:border-brand-accent transition-colors'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`mono text-[10px] font-bold uppercase tracking-widest ${selectedThreat === threat.id ? 'text-brand-accent' : 'opacity-40'}`}>
                    0{THREAT_PACKETS.indexOf(threat) + 1} // {threat.type}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-sm ${threat.severity === 'critical' ? 'bg-red-500 text-white' : 'bg-brand-accent text-brand-primary'}`}>
                    {threat.severity}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold uppercase tracking-tight">{threat.name}</h4>
                  <p className={`text-xs leading-relaxed ${selectedThreat === threat.id ? 'opacity-70' : 'text-brand-secondary opacity-60'}`}>
                    {threat.description}
                  </p>
                </div>
                <div className={`mt-2 flex items-center gap-2 transition-all font-bold mono text-[9px] uppercase tracking-widest ${selectedThreat === threat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 text-brand-accent'}`}>
                  <Play size={10} fill="currentColor" /> Run Simulation
                </div>
              </button>
            ))}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*" 
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isTesting}
              className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center gap-4 transition-all group ${
                selectedThreat === 'upload' ? 'bg-brand-surface border-brand-accent' : 'border-brand-primary/5 hover:bg-brand-surface hover:border-brand-accent'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center group-hover:bg-brand-accent transition-colors">
                <Upload size={20} className="opacity-40 group-hover:opacity-100 group-hover:text-brand-primary transition-all" />
              </div>
              <span className="text-[11px] mono uppercase font-bold tracking-widest opacity-40 group-hover:opacity-100">Upload Adversarial Asset</span>
            </button>
          </div>
        </section>

        {/* Audit Report */}
        <section className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8 flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
              <Activity className="text-brand-accent" size={24} /> Audit Output
            </h3>
          </div>

          <div className="flex-1 min-h-[400px] bg-brand-surface rounded-2xl border border-brand-primary/5 p-10 flex flex-col justify-center items-center relative overflow-hidden">
             {!isTesting && !result && (
               <div className="text-center space-y-6 opacity-20">
                 <ShieldAlert size={64} className="mx-auto" />
                 <div className="space-y-2">
                   <p className="mono text-[11px] uppercase font-bold tracking-widest">Awaiting Vector Selection</p>
                   <p className="mono text-[9px] uppercase">Telemetry Enclave Ready</p>
                 </div>
               </div>
             )}

             {isTesting && (
               <div className="space-y-10 w-full max-w-sm text-center">
                 <div className="relative">
                   <div className="w-32 h-32 rounded-full border border-brand-primary/5 absolute inset-0 animate-ping mx-auto" />
                   <div className="w-32 h-32 rounded-2xl border border-brand-accent flex items-center justify-center bg-white shadow-2xl mx-auto">
                     <RefreshCw className="text-brand-accent animate-spin" size={48} />
                   </div>
                 </div>
                 <div className="space-y-3">
                    <p className="mono text-[12px] uppercase font-bold tracking-[0.3em] text-brand-primary">Analyzing Signal</p>
                    <div className="flex justify-center gap-1">
                      {[0,1,2].map(i => <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }} className="w-1.5 h-1.5 bg-brand-accent rounded-full" />)}
                    </div>
                    <p className="text-[10px] text-brand-secondary mono uppercase tracking-widest opacity-40">Cross-Ref: Anthropol ML Core</p>
                 </div>
               </div>
             )}

             {result && !isTesting && (
               <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col"
               >
                 <div className="flex-1 space-y-10">
                   <div className={`flex items-center gap-6 p-8 rounded-2xl text-white shadow-2xl ${result.outcome === 'PASSED' ? 'bg-brand-success shadow-brand-success/20' : 'bg-red-500 shadow-red-500/20'}`}>
                     <div className="p-4 bg-white/20 rounded-xl">
                       {result.outcome === 'PASSED' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                     </div>
                     <div className="space-y-1">
                       <p className="mono text-[10px] uppercase font-bold opacity-70 tracking-widest">Protocol Response</p>
                       <p className="text-4xl font-black uppercase tracking-tighter leading-none italic">{result.outcome}</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-white rounded-xl border border-brand-primary/5 space-y-1 overflow-hidden">
                        <p className="text-[9px] mono text-brand-secondary uppercase font-bold tracking-widest opacity-40 truncate">Confidence Score</p>
                        <p className="text-3xl sm:text-4xl font-bold tracking-tighter text-brand-primary truncate">{(result.confidence * 100).toFixed(2)}%</p>
                      </div>
                      <div className="p-6 bg-white rounded-xl border border-brand-primary/5 space-y-1 overflow-hidden">
                        <p className="text-[9px] mono text-brand-secondary uppercase font-bold tracking-widest opacity-40 truncate">Attack Vector</p>
                        <p className="text-sm font-bold uppercase tracking-tight leading-tight line-clamp-2">{result.vector}</p>
                      </div>
                   </div>

                   <div className="p-8 bg-brand-primary text-brand-accent rounded-2xl border border-brand-accent/20 space-y-4">
                     <div className="flex items-center gap-3">
                       <CheckCircle size={18} className="text-brand-accent" />
                       <h4 className="mono text-[11px] font-bold uppercase tracking-widest">Heuristic Forensics</h4>
                     </div>
                     <p className="text-sm font-medium leading-relaxed italic opacity-80">
                        "{result.signal}"
                     </p>
                   </div>
                 </div>
               </motion.div>
             )}

             {errorMsg && !isTesting && (
               <div className="w-full text-center space-y-4 text-red-500 bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                 <AlertTriangle size={32} className="mx-auto" />
                 <p className="mono text-[11px] font-bold uppercase tracking-widest">Oracle Error</p>
                 <p className="text-xs">{errorMsg}</p>
               </div>
             )}
          </div>
        </section>
      </div>

      <section className="bg-brand-primary text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-brand-primary/20">
          <div className="w-20 h-20 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
            <ShieldAlert className="text-brand-accent" size={40} />
          </div>
          <div className="space-y-3 flex-1 text-center md:text-left">
             <h4 className="text-2xl font-bold uppercase tracking-tighter">Production Grade Resilience</h4>
             <p className="text-sm text-white/60 leading-relaxed font-medium">This sandbox environment utilizes the exact same biosensor parameters as the production verification engine. Rejection criteria are mathematically derived from sub-perceptual pulse variance thresholds.</p>
          </div>
      </section>
    </div>
  );
};
