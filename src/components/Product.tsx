import { motion } from 'motion/react';
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Layers, 
  Globe,
  Lock,
  Activity,
  Box,
  Eye,
  Radar
} from 'lucide-react';

export function Product({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const deepDive = [
    {
      id: '01',
      title: 'Biometric Signal Recovery',
      description: 'Our proprietary rPPG (Remote Photoplethysmography) algorithms isolate sub-perceptual cardiovascular micro-fluctuations from baseline video noise. This captures true biological life without requiring specialized hardware.',
      icon: Activity,
      details: [
        'Frequency Domain Analysis',
        'Ambient Light Compensation',
        'Sub-millimeter Motion Tracking'
      ]
    },
    {
      id: '02',
      title: 'Hardware-Linked ZK-SNARKs',
      description: 'Every humanity attestation is cryptographically bound to a physical TPM or Secure Enclave on the users device. This prevents "bot-farms" from spoofing verified identities using cloud-based emulators.',
      icon: Cpu,
      details: [
        'Secure Enclave Binding',
        'Non-custodial Proofs',
        'Recursive SNARK verification'
      ]
    },
    {
      id: '03',
      title: 'Global Sovereignty Shards',
      description: 'Identity verification is executed across physical hardware shards located in every major geographic region. This ensures 1.2ms inference latency and automatic compliance with regional data laws.',
      icon: Globe,
      details: [
        'Regional Shard Routing',
        'GDPR/AICPA Compliance',
        'Distributed Oracle Consensus'
      ]
    }
  ];

  return (
    <div className="space-y-40 max-w-7xl mx-auto pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <header className="pt-20 lg:pt-32 space-y-8 max-w-4xl px-6">
        <div className="flex items-center gap-3">
          <Box className="text-brand-accent" size={24} />
          <span className="mono text-[10px] uppercase font-bold tracking-widest text-brand-primary opacity-60">System Specification // v2.0.0</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85] text-brand-primary">
          Synthetic <br/> <span className="text-brand-accent">Immunity</span>
        </h1>
        <p className="text-xl md:text-2xl text-brand-secondary leading-relaxed opacity-70">
          The first institutional-grade identity oracle built for the AI era. Deep-learning verified biological reality, secured by temporal physics.
        </p>
      </header>

      {/* Product Architecture Section */}
      <section className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Core Architecture</h2>
            <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none">
              Beyond the <br/> Digital Facade
            </h3>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-brand-secondary opacity-80">
            <p>
              Traditional identity systems rely on "what you know" (passwords) or "what you have" (keys). In an AI-saturated world, both are trivially reproducible. Anthropol is built on "who you are"—not as a legal entity, but as a biological organism.
            </p>
            <p className="font-bold text-brand-primary">
              The Product: A sub-perceptual verification engine that allows you to gate your ecosystem with zero-friction biological liveness checks.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-6">
               <div className="p-6 bg-brand-surface border border-brand-primary/5 rounded-2xl">
                  <Radar className="text-brand-accent mb-4" size={24} />
                  <p className="font-bold uppercase tracking-tighter">Liveness</p>
                  <p className="text-xs opacity-50">Heartbeat-derived temporal consistency.</p>
               </div>
               <div className="p-6 bg-brand-surface border border-brand-primary/5 rounded-2xl">
                  <Eye className="text-brand-accent mb-4" size={24} />
                  <p className="font-bold uppercase tracking-tighter">Depth</p>
                  <p className="text-xs opacity-50">Spatial 3D mesh attestation.</p>
               </div>
            </div>
          </div>
        </div>
        <div className="bg-brand-primary rounded-[3rem] p-16 text-brand-paper shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-brand-accent/40 transition-all duration-700" />
           <div className="relative z-10 space-y-12">
              <div className="space-y-4">
                 <h4 className="text-5xl font-bold uppercase tracking-tighter italic leading-none text-brand-accent">0% PII</h4>
                 <p className="text-xl opacity-60">Identity without exposure.</p>
              </div>
              <div className="space-y-8 pt-8 border-t border-white/10">
                 <p className="text-lg opacity-80 italic leading-relaxed">
                   "Anthropol doesn't store your face. It stores a cryptographic proof that a face exists, belongs to a human, and is attached to a heartbeat."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                       <Lock size={16} />
                    </div>
                    <span className="mono text-[10px] uppercase font-bold tracking-widest">Master Oracle v4.2 Internal</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Deep Dive Steps */}
      <section className="px-6 space-y-20">
        <div className="flex items-center gap-4">
          <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Technical Stack</h2>
          <div className="h-px flex-1 bg-brand-primary/10" />
        </div>

        <div className="grid grid-cols-1 gap-24">
          {deepDive.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col lg:flex-row gap-16 items-start group"
            >
              <div className="flex-shrink-0 lg:w-64 space-y-6">
                 <div className="w-20 h-20 rounded-3xl bg-brand-primary text-brand-accent flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                    <item.icon size={40} />
                 </div>
                 <h3 className="mono text-4xl font-black italic text-brand-primary/10">{item.id}</h3>
              </div>
              <div className="flex-1 space-y-10">
                 <div className="space-y-6">
                    <h4 className="text-5xl font-bold uppercase tracking-tighter">{item.title}</h4>
                    <p className="text-2xl leading-relaxed text-brand-secondary opacity-70 italic font-medium max-w-2xl">
                      {item.description}
                    </p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {item.details.map((detail, idx) => (
                      <div key={idx} className="p-6 bg-white rounded-2xl border border-brand-primary/5 shadow-sm flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-brand-accent" />
                         <span className="font-bold uppercase tracking-tighter text-sm">{detail}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product CTA */}
      <section className="bg-brand-primary text-brand-paper -mx-8 lg:-mx-16 px-8 lg:px-16 py-32 text-center space-y-12">
         <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none">The Future is <br/> <span className="text-brand-accent italic">Biological</span></h2>
            <p className="text-xl opacity-60 leading-relaxed font-medium">Protect your network from the synthetic takeover. Deploy Anthropol immunity today.</p>
         </div>
         <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
               onClick={() => onNavigate && onNavigate('auth')}
               className="bg-brand-accent text-brand-primary px-12 py-5 rounded-full mono text-sm font-bold uppercase hover:bg-white transition-all flex items-center justify-center gap-3">
               Register for SDK Access <ArrowRight size={18} />
            </button>
            <button 
               onClick={() => onNavigate && onNavigate('pricing')}
               className="bg-white/5 border border-white/10 text-white px-12 py-5 rounded-full mono text-sm font-bold uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3">
               View Enterprise Pricing
            </button>
         </div>
      </section>
    </div>
  );
}
