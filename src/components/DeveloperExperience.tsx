import { motion } from 'motion/react';
import { 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Code2, 
  Layers, 
  Database, 
  Globe,
  Lock,
  MessageSquare,
  Activity
} from 'lucide-react';

export function DeveloperExperience() {
  const steps = [
    {
      id: '01',
      title: 'Infrastructure Link',
      description: 'Initialize the Anthropol SDK with your organization public key. This establishes a secure, hardware-bound connection between your client application and our global identity shards.',
      icon: Database,
      code: `import { Anthropol } from '@anthropol/sdk';

const client = new Anthropol({
  publicKey: 'pk_live_your_key_here',
  shard: 'US-EAST'
});`
    },
    {
      id: '02',
      title: 'Spatial Attestation',
      description: 'Deploy the <HumanityOracle /> component. This triggers the sub-perceptual bio-telemetry engine, capturing cardiovascular micro-vibrations and spatial depth markers to yield a unique Zero-Knowledge proof.',
      icon: Cpu,
      code: `<HumanityOracle 
  mode="spatial-3d"
  onAttested={(proofId) => {
    // Dispatch to your secure backend
    submitProof(proofId);
  }}
/>`
    },
    {
      id: '03',
      title: 'Identity Verification',
      description: 'Validate the proofId server-side using your secret key. Our master oracle confirms the ZK-attestation validity without revealing any biological or personal data.',
      icon: ShieldCheck,
      code: `// Server-side (Node.js/Go/Python)
const isValid = await anthropol.verify(proofId, 
  process.env.ANTHROPOL_SECRET
);

if (isValid) {
  grantAccess(user);
}`
    },
    {
      id: '04',
      title: 'Webhook Life-cycle',
      description: 'Configure webhooks to listen for asynchronous state changes, such as regional compliance updates or hardware enclave revocations, ensuring your ecosystem remains resilient in real-time.',
      icon: Terminal,
      code: `app.post('/anthropol-webhook', (req, res) => {
  const event = req.body;
  if (event.type === 'identity.revoked') {
    lockUserSession(event.data.userId);
  }
  res.sendStatus(200);
});`
    }
  ];

  return (
    <div className="space-y-32 max-w-7xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <header className="pt-20 lg:pt-32 space-y-8 max-w-4xl px-6">
        <div className="flex items-center gap-3">
          <Terminal className="text-brand-accent" size={24} />
          <span className="mono text-[10px] uppercase font-bold tracking-widest text-brand-primary opacity-60">Developer Protocol // v1.0.4</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85] text-brand-primary">
          Code the <br/> <span className="text-brand-accent">Human</span> Layer
        </h1>
        <p className="text-xl md:text-2xl text-brand-secondary leading-relaxed opacity-70">
          The comprehensive guide to integrating institutional-grade Sybil resistance into your software stack. From problem statement to production-ready identity assurance.
        </p>
      </header>

      {/* Problem Statement Section */}
      <section className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">The Engineering Problem</h2>
            <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none">
              The Synthetic <br/> Identity Paradox
            </h3>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-brand-secondary opacity-80">
            <p>
              Modern digital ecosystems are facing an existential threat: the marginal cost of creating a "convincing" digital persona has dropped to zero. Traditional CAPTCHAs are obsolete, and SMS-based verification is vulnerable to SIM-swapping and synthetic voice AI.
            </p>
            <p className="font-bold text-brand-primary">
              The Problem: How do you verify biological reality in a remote-first, privacy-conscious world without reverting to intrusive surveillance or custodial biometric storage?
            </p>
            <div className="flex flex-col gap-4 pt-6">
               <div className="flex gap-4 items-center p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="mono text-[11px] font-bold uppercase">92% of CAPTCHAs solved by LLMs</span>
               </div>
               <div className="flex gap-4 items-center p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="mono text-[11px] font-bold uppercase">Sybils draining 40% of L1 network incentives</span>
               </div>
            </div>
          </div>
        </div>
        <div className="bg-brand-primary rounded-[3rem] p-12 text-brand-paper shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-brand-accent/40 transition-all duration-700" />
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary">
                    <Activity size={24} />
                 </div>
                 <h4 className="text-xl font-bold uppercase tracking-tighter italic">Anthropol Solution</h4>
              </div>
              <div className="space-y-6">
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <h5 className="font-bold uppercase tracking-tight text-brand-accent mb-2">rPPG Telemetry</h5>
                    <p className="text-sm opacity-60">Sub-perceptual pulse wave analysis using commodity cameras.</p>
                 </div>
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <h5 className="font-bold uppercase tracking-tight text-brand-accent mb-2">Hardware-Bound ZK</h5>
                    <p className="text-sm opacity-60">Proofs tied to TPM/Secure Enclave for non-malleability.</p>
                 </div>
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <h5 className="font-bold uppercase tracking-tight text-brand-accent mb-2">Privacy-First Oracle</h5>
                    <p className="text-sm opacity-60">Zero PII storage. Verification happens at the hardware edge.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* The Journey Steps */}
      <section className="px-6 space-y-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
                Implementation <br/> Lifecycle
              </h2>
              <p className="text-xl text-brand-secondary opacity-60 max-w-xl">
                 A step-by-step developer guide to deploying Anthropol infrastructure in under 10 minutes.
              </p>
           </div>
           <button className="bg-brand-primary text-brand-paper px-10 py-4 rounded-full mono text-xs font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all flex items-center gap-3">
              Explore SDK Documentation <ArrowRight size={16} />
           </button>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {steps.map((step, i) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col lg:flex-row gap-12 group"
            >
              <div className="flex-shrink-0 lg:w-48">
                 <div className="sticky top-40 space-y-4">
                    <h3 className="mono text-5xl font-black italic text-brand-accent/20 group-hover:text-brand-accent transition-colors duration-500">{step.id}</h3>
                    <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                       <step.icon size={24} />
                    </div>
                 </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-12 rounded-[2.5rem] border border-brand-primary/5 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-primary/5 transition-all">
                 <div className="space-y-6">
                    <h4 className="text-3xl font-bold uppercase tracking-tighter">{step.title}</h4>
                    <p className="text-lg leading-relaxed text-brand-secondary opacity-70 italic">
                      {step.description}
                    </p>
                    <div className="flex gap-4">
                       <div className="px-3 py-1 bg-brand-surface rounded-full border border-brand-primary/5 mono text-[8px] uppercase font-bold tracking-widest">v1.2.0 stable</div>
                       <div className="px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20 mono text-[8px] uppercase font-bold tracking-widest text-brand-accent">Production Ready</div>
                    </div>
                 </div>
                 <div className="bg-brand-primary rounded-2xl p-8 font-mono text-[11px] text-brand-accent overflow-x-auto shadow-inner">
                    <div className="flex justify-between items-center opacity-30 mb-4 border-b border-white/10 pb-4">
                       <span className="uppercase text-[9px] font-bold tracking-widest">Example Snippet</span>
                       <span className="uppercase text-[9px] font-bold tracking-widest">TypeScript</span>
                    </div>
                    <pre className="leading-relaxed">
                       {step.code}
                    </pre>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Advanced Capabilities */}
      <section className="bg-brand-surface -mx-8 lg:-mx-16 px-8 lg:px-16 py-32">
         <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
               <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter">Advanced Modules</h2>
               <p className="text-xl text-brand-secondary opacity-70 italic">
                  Anthropol provides specialized modules for high-throughput environments and extreme security requirements.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: 'DSP Worker API', icon: Zap, desc: 'Offload heavy biometric signal processing to web workers or hardware acceleration.' },
                 { title: 'Regional Sharding', icon: Globe, desc: 'Configure automatic data routing across US, EU, and APAC clusters for low-latency compliance.' },
                 { title: 'Audit Trail Export', icon: Layers, desc: 'Generate machine-signed proof packages for institutional compliance audits (SOC2/SOC3).' }
               ].map((mod, i) => (
                 <div key={i} className="p-10 bg-white rounded-3xl border border-brand-primary/5 space-y-6 hover:-translate-y-2 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-accent flex items-center justify-center">
                       <mod.icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-tighter">{mod.title}</h3>
                    <p className="opacity-60 leading-relaxed font-medium">{mod.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 text-center space-y-12">
         <div className="space-y-6">
            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none">Execute Your First <br/> <span className="text-brand-accent italic">Verification</span></h2>
            <p className="text-xl text-brand-secondary opacity-60">Join 1,200+ organizations building human-centric ecosystems.</p>
         </div>
         <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="bg-brand-primary text-brand-paper px-12 py-5 rounded-full mono text-sm font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all flex items-center justify-center gap-3">
               Register Node <ArrowRight size={18} />
            </button>
            <button className="bg-brand-surface border border-brand-primary/10 text-brand-primary px-12 py-5 rounded-full mono text-sm font-bold uppercase hover:bg-white transition-all flex items-center justify-center gap-3">
               <MessageSquare size={18} /> Join Developer Discord
            </button>
         </div>
      </section>
    </div>
  );
}
