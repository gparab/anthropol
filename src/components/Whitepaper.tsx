import React from 'react';
import { BookOpen, Shield, Cpu, Zap, Lock, Globe, ArrowRight, CheckCircle2, Activity, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export const Whitepaper = () => {
  return (
    <div className="bg-brand-paper min-h-screen pt-32 pb-40 px-8 selection:bg-brand-accent selection:text-brand-primary">
      <div className="max-w-7xl mx-auto space-y-40">
        {/* Premium Academic Header */}
        <header className="space-y-12">
          <div className="flex items-center gap-3">
            <BookOpen className="text-brand-accent" size={24} />
            <span className="mono text-[10px] uppercase font-bold tracking-widest text-brand-primary opacity-60">Technical Protocol // v2.4.0</span>
          </div>
          
          <div className="space-y-10">
             <h1 className="text-8xl md:text-9xl font-bold tracking-tighter uppercase leading-[0.8] text-brand-primary">
              Temporal <br/>
              <span className="text-brand-accent">Biological</span> <br/> Physics
             </h1>
             <p className="text-3xl font-medium tracking-tight text-brand-secondary/70 max-w-2xl leading-snug italic underline decoration-brand-accent/30 underline-offset-8">Formalizing non-custodial liveness via rPPG-ZK attestation protocol architecture.</p>
          </div>
        </header>

        {/* Institutional Executive Summary */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Executive Summary</h2>
            <div className="h-px flex-1 bg-brand-primary/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 text-zinc-900 border-l-4 border-brand-accent pl-12 py-4">
            <div className="space-y-6">
               <h3 className="text-4xl font-bold uppercase tracking-tighter">Economic Resilience</h3>
               <p className="text-xl leading-relaxed text-brand-secondary opacity-70 italic font-medium">
                 Anthropol provides institutional-grade Sybil resistance. By anchoring identity in temporal biological physics, ecosystems can eliminate bot-driven resource exhaustion and synthetic inflation, preserving network value for verified human actors.
               </p>
            </div>
            <div className="space-y-6">
               <h3 className="text-4xl font-bold uppercase tracking-tighter">Regulatory Integrity</h3>
               <p className="text-xl leading-relaxed text-brand-secondary opacity-70 italic font-medium">
                 Our Zero-Knowledge architecture ensures 100% liveness verification with zero PII exposure. This "Privacy-by-Design" approach simplifies global compliance (GDPR/AICPA) while maintaining the highest security posture in identity assurance.
               </p>
            </div>
          </div>
        </section>

        {/* Section 01: The Crisis */}
        <section className="space-y-16">
          <div className="flex items-center gap-4">
            <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">01 // The Crisis</h2>
            <div className="h-px flex-1 bg-brand-primary/10" />
          </div>
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="shrink-0">
               <span className="text-9xl font-bold text-brand-primary opacity-5 tracking-tighter">01</span>
            </div>
            <div className="space-y-12 max-w-3xl">
              <h2 className="text-6xl font-bold uppercase tracking-tighter text-brand-primary leading-none">The Collapse of <br/> the Digital Perimeter</h2>
              <div className="space-y-8 text-2xl leading-relaxed text-brand-secondary font-medium">
                <p>
                  In the early 21st century, digital identity relied on the assumption of <span className="text-brand-primary border-b-2 border-brand-accent pb-0.5 font-bold">asymmetric effort</span>: it was significantly easier for a human to prove they were human than it was for a machine to simulate that proof.
                </p>
                <div className="p-10 bg-brand-surface rounded-[2.5rem] border border-brand-primary/5 space-y-8 shadow-sm">
                  <div className="flex justify-between items-center opacity-40">
                     <span className="mono text-[10px] uppercase font-bold tracking-widest">Network Threat Level</span>
                     <div className="flex gap-1">
                        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />)}
                     </div>
                  </div>
                  <p className="italic">
                    "The ability to simulate human-like interaction at zero cost is the ultimate DDoS attack on civil society."
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-brand-primary/10">
                     <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                        <Activity size={20} />
                     </div>
                     <p className="mono text-[11px] font-bold uppercase tracking-widest">Synthetic Saturation Index: 82%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 02: Biological Proof */}
        <section className="space-y-16">
          <div className="flex items-center gap-4">
            <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">02 // Biological Proof</h2>
            <div className="h-px flex-1 bg-brand-primary/10" />
          </div>
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="shrink-0">
               <span className="text-9xl font-bold text-brand-primary opacity-5 tracking-tighter">02</span>
            </div>
            <div className="space-y-12 max-w-3xl">
              <h2 className="text-6xl font-bold uppercase tracking-tighter text-brand-primary leading-none">Micro-vibration <br/> dSP Telemetry</h2>
              <div className="space-y-12 text-2xl leading-relaxed text-brand-secondary font-medium italic">
                <p>
                  Anthropol leverages <span className="text-brand-accent font-bold not-italic underline decoration-brand-accent/30 underline-offset-8">remote Photoplethysmography (rPPG)</span> to extract sub-perceptual cardiac signals from standard RGB sensors.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-italic">
                   <div className="bg-white p-10 rounded-3xl border border-brand-primary/5 space-y-4">
                      <Zap className="text-brand-accent" size={32} />
                      <h4 className="text-2xl font-bold uppercase tracking-tighter">Temporal Drift</h4>
                      <p className="text-lg opacity-60 leading-tight">Every biological heart exhibits non-linear temporal complexity that synthetic models cannot currently emulate without massive latency penalties.</p>
                   </div>
                   <div className="bg-white p-10 rounded-3xl border border-brand-primary/5 space-y-4">
                      <Cpu className="text-brand-accent" size={32} />
                      <h4 className="text-2xl font-bold uppercase tracking-tighter">Spatial Mapping</h4>
                      <p className="text-lg opacity-60 leading-tight">Micro-fluctuations in skin reflectance are correlated with spatial depth to ensure the signal originates from a three-dimensional biological entity.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 03: Cryptography */}
        <section className="space-y-16">
          <div className="flex items-center gap-4">
            <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">03 // Cryptography</h2>
            <div className="h-px flex-1 bg-brand-primary/10" />
          </div>
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="shrink-0">
               <span className="text-9xl font-bold text-brand-primary opacity-5 tracking-tighter">03</span>
            </div>
            <div className="space-y-12 max-w-3xl">
              <h2 className="text-6xl font-bold uppercase tracking-tighter text-brand-primary leading-none">Cryptographic Attestation</h2>
              <div className="space-y-12 text-2xl leading-relaxed text-brand-secondary font-medium italic">
                <p>
                  Anthropol dissolves the trade-off between identity and privacy using <span className="text-brand-primary font-bold not-italic">Keccak-256 Protocol Attestations</span> with a hardware-bound ZK-SNARK fallback layer.
                </p>
                <div className="bg-brand-surface rounded-[2.5rem] p-12 border border-brand-primary/5 space-y-12 not-italic shadow-sm">
                  <div className="flex justify-between items-center border-b border-brand-primary/10 pb-8">
                    <span className="mono text-[10px] uppercase font-bold tracking-[0.4em] text-brand-primary/40">ZK-SNARK Invariant Proof</span>
                    <div className="px-5 py-2 bg-brand-primary text-brand-accent mono text-[10px] font-bold uppercase rounded-full shadow-lg">ZKP_Core_Groth16</div>
                  </div>
                  <div className="bg-white/50 p-10 rounded-2xl border border-brand-primary/5">
                    <pre className="mono text-lg text-brand-primary leading-loose font-bold text-center">
                      {`P(V) ≡ 1 iff H(Biom) ∈ Σ(H)`}
                    </pre>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-4">
                    <div className="space-y-2 text-center md:text-left">
                       <p className="mono text-[10px] uppercase font-bold text-brand-primary/30 tracking-widest">Signal Digest</p>
                       <p className="mono text-base font-bold text-brand-primary">0xFF_HASH_8B</p>
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                       <p className="mono text-[10px] uppercase font-bold text-brand-primary/30 tracking-widest">BPM Attest</p>
                       <p className="mono text-base font-bold text-brand-primary">74.2_VAL_U16</p>
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                       <p className="mono text-[10px] uppercase font-bold text-brand-primary/30 tracking-widest">Hardware Link</p>
                       <p className="mono text-base font-bold text-brand-primary">SE_ENCLAVE_0x</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 04: Comparison Matrix */}
        <section className="space-y-16">
          <div className="flex items-center gap-4">
            <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">04 // Attestation Matrix</h2>
            <div className="h-px flex-1 bg-brand-primary/10" />
          </div>
          <div className="space-y-10">
            <h3 className="text-5xl font-bold uppercase tracking-tighter text-brand-primary leading-none">Global <br/> Benchmarking</h3>
            <div className="bg-white rounded-[2.5rem] border border-brand-primary/5 shadow-xl overflow-hidden">
               <table className="w-full text-left mono text-[11px] uppercase font-bold tracking-widest border-collapse">
                 <thead>
                   <tr className="bg-brand-surface text-brand-primary/40">
                     <th className="p-12 border-b border-brand-primary/5">Metric Layer</th>
                     <th className="p-12 border-b border-brand-primary/5">Legacy ID</th>
                     <th className="p-12 border-b border-brand-primary/5">Gov-ID Scan</th>
                     <th className="p-12 border-b border-brand-primary/5 bg-brand-accent/10 text-brand-primary">Anthropol Node</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-brand-primary/5 text-brand-primary/80">
                   <tr className="hover:bg-brand-surface transition-colors">
                     <td className="p-12 font-bold opacity-30">Root of Trust</td>
                     <td className="p-12">Session Cookies</td>
                     <td className="p-12">Central DB</td>
                     <td className="p-12 font-black text-brand-primary flex items-center gap-2">
                       <Shield size={12} className="text-brand-accent" />
                       Bio-Physics
                     </td>
                   </tr>
                   <tr className="hover:bg-brand-surface transition-colors">
                     <td className="p-12 font-bold opacity-30">Privacy Grade</td>
                     <td className="p-12">Zero-Trust</td>
                     <td className="p-12">Static Storage</td>
                     <td className="p-12 font-black text-brand-primary flex items-center gap-2">
                       <Lock size={12} className="text-brand-accent" />
                       Zero-Knowledge
                     </td>
                   </tr>
                   <tr className="hover:bg-brand-surface transition-colors">
                     <td className="p-12 font-bold opacity-30">Audit Depth</td>
                     <td className="p-12">1ms Response</td>
                     <td className="p-12">5s Static</td>
                     <td className="p-12 font-black text-brand-primary flex items-center gap-2">
                       <Zap size={12} className="text-brand-accent" />
                       5s Physiological
                     </td>
                   </tr>
                 </tbody>
               </table>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <footer className="space-y-16 pb-20">
           <div className="space-y-4">
              <h3 className="text-8xl font-bold uppercase tracking-tighter text-brand-primary leading-none">The Post-Turing Path</h3>
              <p className="text-4xl font-medium tracking-tight text-brand-secondary/40 max-w-2xl leading-none">We do not verify who you are, only that you are.</p>
           </div>
           
           <div className="bg-brand-accent rounded-[3.5rem] p-16 lg:p-24 flex flex-col lg:flex-row justify-between items-center gap-20 text-brand-primary shadow-2xl shadow-brand-accent/30 relative overflow-hidden">
              <div className="space-y-8 z-10">
                <h4 className="text-7xl font-bold uppercase tracking-tighter leading-[0.9]">Anchor Your<br/>Network.</h4>
                <p className="text-2xl font-medium text-brand-primary/60 max-w-sm leading-tight">Scale humanity-first protocols with our enterprise-grade SDK stack.</p>
              </div>
              <button className="bg-brand-primary text-brand-paper px-16 py-10 rounded-3xl text-2xl font-bold uppercase tracking-tighter hover:bg-black transition-all flex items-center gap-8 group shadow-2xl shadow-brand-primary/40 z-10 shrink-0">
                Initialize Stack 
                <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[120px] -z-0 rounded-full" />
           </div>
           
           <p className="text-center mono text-[10px] font-bold uppercase tracking-[0.8em] text-brand-primary/20 pt-20">
             (C) 2026 Anthropol Protocols // Proof of Humanity Foundation
           </p>
        </footer>
      </div>
    </div>
  );
};


