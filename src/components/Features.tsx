import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Globe, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Users, 
  Activity,
  Cpu,
  BarChart3,
  Server,
  Sparkles
} from 'lucide-react';

export function Features() {
  const businessBenefits = [
    {
      title: "Eliminate Synthetic Fraud",
      description: "Stop bot-driven account creation and resource drain. Anthropol's sub-perceptual telemetry distinguishes biological reality from synthetic AI avatars with 99.8% precision.",
      icon: ShieldCheck,
      metric: "99.8%",
      metricLabel: "Fraud Suppression"
    },
    {
      title: "Zero PII Risk",
      description: "Ensure global compliance (GDPR/AICPA) without storing sensitive data. Our Zero-Knowledge architecture verifies humanity without ever touching personal identifiable information.",
      icon: Lock,
      metric: "0.0%",
      metricLabel: "PII Exposure"
    },
    {
      title: "Seamless Integration",
      description: "Deploy in minutes with our high-performance SDKs and webhooks. Our master oracle provides sub-second inference latency, ensuring zero friction for legitimate users.",
      icon: Zap,
      metric: "1.2ms",
      metricLabel: "Inference Latency"
    }
  ];

  const enterpriseFeatures = [
    {
      title: "Regional Data Sovereignty",
      description: "Deploy infrastructure nodes in specific geographic zones (US-EAST, EU-WEST, etc.) to meet local regulatory requirements automatically.",
      icon: Globe
    },
    {
      title: "Hardware-Bound Attestation",
      description: "Bind every human verification to a unique hardware enclave (TPM/Secure Enclave), creating a non-malleable link between identity and physical device.",
      icon: Cpu
    },
    {
      title: "Institutional-Grade Analytics",
      description: "Access deep tactical intelligence on network health, retention patterns, and mitigated Sybil attempts through our master developer portal.",
      icon: BarChart3
    },
    {
      title: "Air-Gapped Deployment",
      description: "For extreme security requirements, Anthropol supports fully air-gapped infrastructure nodes with hardware-bound ZK-circuit logic.",
      icon: Server
    }
  ];

  return (
    <div className="space-y-40 max-w-7xl mx-auto pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <header className="pt-20 lg:pt-32 space-y-8 max-w-4xl px-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-brand-accent" size={24} />
          <span className="mono text-[10px] uppercase font-bold tracking-widest text-brand-primary opacity-60">Capabilities Matrix // v1.0.4</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85] text-brand-primary">
          Institutional <br/> <span className="text-brand-accent">Intelligence</span>
        </h1>
        <p className="text-xl md:text-2xl text-brand-secondary leading-relaxed opacity-70">
          The infrastructure layer for a human-centric internet. Powering the world's most resilient digital ecosystems with biological physics and hardware-bound ZK proofs.
        </p>
      </header>

      {/* Strategic Summary */}
      <section className="px-6 space-y-12">
        <div className="flex items-center gap-4">
          <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Strategic Summary</h2>
          <div className="h-px flex-1 bg-brand-primary/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <h3 className="text-4xl font-bold uppercase tracking-tighter">Economic Resilience</h3>
            <p className="text-lg leading-relaxed text-brand-secondary opacity-70 italic">
              Anthropol provides sovereign-grade Sybil resistance. By anchoring identity in temporal biological physics, networks can eliminate bot-driven resource exhaustion and synthetic inflation.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-4xl font-bold uppercase tracking-tighter">Latency Optimization</h3>
            <p className="text-lg leading-relaxed text-brand-secondary opacity-70 italic">
              Our master oracle delivers sub-second inference latency at the edge. Verification happens natively within the user's browser, offloading 90% of processing costs from your central nodes.
            </p>
          </div>
        </div>
      </section>

      {/* Core Benefits Grid */}
      <section className="px-6 space-y-16">
        <div className="flex items-center gap-4">
          <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Operational Pillars</h2>
          <div className="h-px flex-1 bg-brand-primary/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {businessBenefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-12 rounded-[2.5rem] border border-brand-primary/5 shadow-sm space-y-8 group hover:bg-brand-surface transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:bg-brand-accent group-hover:text-brand-primary transition-colors">
                <benefit.icon size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold uppercase tracking-tighter">{benefit.title}</h3>
                <p className="text-brand-secondary leading-relaxed opacity-60 font-medium italic">{benefit.description}</p>
              </div>
              <div className="pt-6 border-t border-brand-primary/5">
                <p className="text-4xl font-bold italic tracking-tighter text-brand-primary">{benefit.metric}</p>
                <p className="mono text-[10px] uppercase opacity-40 font-bold tracking-widest">{benefit.metricLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Detailed Capabilities */}
      <section className="bg-brand-primary text-brand-paper py-32 -mx-8 lg:-mx-16 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
                Hardened <br/> Infrastructure
              </h2>
              <p className="text-xl opacity-60 leading-relaxed italic">
                From sub-perceptual signal processing to hardware-bound ZK-SNARKs, every layer of the Anthropol stack is engineered for institutional resilience.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-xl">
               <Activity className="text-brand-accent" size={24} />
               <div>
                  <p className="mono text-[10px] uppercase font-bold tracking-widest">Network Uptime</p>
                  <p className="text-2xl font-bold">99.998%</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {enterpriseFeatures.map((feature, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-accent group-hover:text-brand-primary transition-all">
                  <feature.icon size={20} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-bold uppercase tracking-tighter">{feature.title}</h4>
                  <p className="text-lg opacity-50 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signal */}
      <section className="text-center space-y-16 px-6">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <div className="h-px flex-1 bg-brand-primary/10" />
          <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Compliance & Assurance</h2>
          <div className="h-px flex-1 bg-brand-primary/10" />
        </div>
        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">Ready to Scale Humanity?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
           <div className="flex items-center gap-4 px-8 py-4 bg-brand-surface rounded-2xl border border-brand-primary/5">
              <CheckCircle2 className="text-brand-success" size={24} />
              <span className="text-lg font-bold uppercase tracking-tighter">SLA Guaranteed</span>
           </div>
           <div className="flex items-center gap-4 px-8 py-4 bg-brand-surface rounded-2xl border border-brand-primary/5">
              <CheckCircle2 className="text-brand-success" size={24} />
              <span className="text-lg font-bold uppercase tracking-tighter">GDPR Compliant</span>
           </div>
           <div className="flex items-center gap-4 px-8 py-4 bg-brand-surface rounded-2xl border border-brand-primary/5">
              <CheckCircle2 className="text-brand-success" size={24} />
              <span className="text-lg font-bold uppercase tracking-tighter">SOC 2 Ready</span>
           </div>
        </div>
      </section>
    </div>
  );
}
