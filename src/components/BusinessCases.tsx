import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Globe, 
  Zap, 
  ArrowRight, 
  Layers, 
  Database, 
  Users,
  Gamepad2,
  TrendingUp,
  ShoppingCart,
  Coins,
  Scale
} from 'lucide-react';

export function BusinessCases() {
  const cases = [
    {
      title: "DeFi Governance",
      problem: "Governance manipulation via Sybil attacks and flash-loan voting.",
      solution: "Bind voting power to verified biological identities. Ensure 'One Person, One Vote' without compromising member privacy.",
      metrics: "94% more resilient voting outcomes",
      icon: Coins
    },
    {
      title: "Tactical Gaming",
      problem: "Synthetic bots and AI-driven cheat clients ruining player retention.",
      solution: "Deploy sub-perceptual liveness checks during competitive matches. Ensure zero-bot environments in high-stakes tournaments.",
      metrics: "3.5x Increase in User LTV",
      icon: Gamepad2
    },
    {
      title: "Institutional E-com",
      problem: "Scalper bots depleting high-demand inventory in milliseconds.",
      solution: "Gate flash-sales with non-custodial humanity attestation. Ensure limited-run assets reach legitimate biological consumers.",
      metrics: "100% Bot-Free Checkout",
      icon: ShoppingCart
    },
    {
      title: "Social Platforms",
      problem: "Synthetic disinformation campaigns driven by million-node AI botnets.",
      solution: "Verify the 'Humanity Signal' at account creation. Restore trust in the digital town square with zero PII storage.",
      metrics: "99.2% Mitigation of Fake Personas",
      icon: Users
    }
  ];

  return (
    <div className="space-y-40 max-w-7xl mx-auto pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <header className="pt-20 lg:pt-32 space-y-8 max-w-4xl px-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-brand-accent" size={24} />
          <span className="mono text-[10px] uppercase font-bold tracking-widest text-brand-primary opacity-60">Value Proposition // v1.2.0</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.85] text-brand-primary">
          Strategic <br/> <span className="text-brand-accent">Outcomes</span>
        </h1>
        <p className="text-xl md:text-2xl text-brand-secondary leading-relaxed opacity-70">
          How world-class organizations are leveraging biological physics to solve the internet's most expensive engineering problems.
        </p>
      </header>

      {/* Case Grid */}
      <section className="px-6 space-y-24">
        <div className="flex items-center gap-4">
          <h2 className="mono text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">Implementation Matrix</h2>
          <div className="h-px flex-1 bg-brand-primary/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {cases.map((useCase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-12 rounded-[3.5rem] border border-brand-primary/5 shadow-sm group hover:shadow-2xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-10">
                <div className="flex justify-between items-start">
                   <div className="w-16 h-16 rounded-2xl bg-brand-primary text-brand-accent flex items-center justify-center">
                      <useCase.icon size={32} />
                   </div>
                   <div className="p-4 bg-brand-surface rounded-xl border border-brand-primary/5">
                      <p className="mono text-[9px] font-black uppercase text-brand-primary opacity-40">Impact Meta</p>
                      <p className="text-xl font-bold italic tracking-tighter text-brand-primary">{useCase.metrics}</p>
                   </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-4xl font-bold uppercase tracking-tighter">{useCase.title}</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <p className="mono text-[10px] font-bold uppercase text-red-500 opacity-60">The Friction</p>
                       <p className="text-lg text-brand-secondary leading-relaxed opacity-80">{useCase.problem}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="mono text-[10px] font-bold uppercase text-brand-accent">The Solution</p>
                       <p className="text-lg text-brand-primary leading-relaxed font-bold italic">{useCase.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-10 mt-10 border-t border-brand-primary/5">
                 <button className="flex items-center gap-3 font-bold uppercase tracking-widest text-xs hover:text-brand-accent transition-colors">
                    Read Institutional Review <ArrowRight size={14} />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Institutional Review CTA */}
      <section className="bg-brand-surface -mx-8 lg:-mx-16 px-8 lg:px-16 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
         <div className="space-y-10">
            <div className="p-4 bg-white self-start rounded-xl border border-brand-primary/5 flex items-center gap-4 w-fit">
               <Scale className="text-brand-accent" size={24} />
               <span className="mono text-[10px] font-bold uppercase tracking-widest">Global Standards</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">Institutional <br/> Compliance</h2>
            <p className="text-xl text-brand-secondary opacity-70 italic leading-relaxed max-w-xl">
               Anthropol is engineered to meet the highest regulatory hurdles in decentralized finance, healthcare, and public infrastructure.
            </p>
            <div className="flex gap-4">
               {['GDPR', 'AICPA', 'SOC2', 'ISO27001'].map(tag => (
                 <div key={tag} className="px-5 py-2 bg-white rounded-full border border-brand-primary/5 mono text-[10px] font-bold uppercase tracking-widest opacity-40">
                    {tag}
                 </div>
               ))}
            </div>
         </div>
         <div className="space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border border-brand-primary/5 shadow-xl space-y-8">
               <h4 className="text-2xl font-bold uppercase tracking-tighter">Request Business Valuation</h4>
               <p className="opacity-60 leading-relaxed italic border-l-2 border-brand-accent pl-6">
                 "Our team of identity architects can process your network requirements to provide a detailed ROI projection using Anthropol humanity attestation."
               </p>
               <div className="space-y-4 pt-4">
                  <input type="text" placeholder="Organizational Domain" className="w-full px-6 py-4 bg-brand-surface rounded-xl border border-brand-primary/5 mono text-xs uppercase" />
                  <button className="w-full bg-brand-primary text-brand-paper py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-accent hover:text-brand-primary transition-all">
                    Initiate Consultation
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 text-center space-y-12">
         <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none">Restore Integrity to Your <br/> <span className="text-brand-accent italic">Ecosystem</span></h2>
         <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="bg-brand-primary text-brand-paper px-12 py-5 rounded-full mono text-sm font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all flex items-center justify-center gap-3">
               Register for Enterprise Node <ArrowRight size={18} />
            </button>
            <button className="bg-brand-surface border border-brand-primary/10 text-brand-primary px-12 py-5 rounded-full mono text-sm font-bold uppercase hover:bg-white transition-all flex items-center justify-center gap-3">
               Review Case Library
            </button>
         </div>
      </section>
    </div>
  );
}
