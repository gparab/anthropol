import { Check, Shield, Zap, Globe } from 'lucide-react';
import { verificationService } from '../lib/services';
import { auth } from '../lib/firebase';
import { useState, useEffect } from 'react';

/**
 * Infrastructure Pricing & Node Scaling
 * 
 * Commercial tiers for institutional partners. Implements lazy-upgrade 
 * logic for scaling verification nodes.
 */
export const Pricing = () => {
  const [currentTier, setCurrentTier] = useState<string>('standard');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      verificationService.getClientProfile(user.uid).then(profile => {
        if (profile) setCurrentTier(profile.tier);
      });
    }
  }, []);

  const handleUpgrade = async (tier: string, limitVal: number) => {
    const user = auth.currentUser;
    if (!user) return alert('Please login first');
    
    if (tier === 'enterprise') {
      const confirmRedirect = window.confirm("Redirecting to Stripe Billing Portal to provision Enterprise Infrastructure. Proceed?");
      if (!confirmRedirect) return;
      
      // Simulate Stripe checkout delay and then trigger Firebase backend upgrade
      setTimeout(async () => {
        try {
          const { success } = await verificationService.upgradeTier(user.uid, tier, limitVal) as any;
          if (success) {
            setCurrentTier(tier);
            window.dispatchEvent(new CustomEvent('tier-upgraded', { detail: { tier } }));
            alert(`✓ Enterprise Infrastructure Node Scaled & Attached to Billing Account.`);
          }
        } catch (e) {
             console.error("Upgrade failed:", e);
             alert("Failed to scale infrastructure node. Check console for details.");
        }
      }, 1500);
      return;
    }

    try {
      const { success } = await verificationService.upgradeTier(user.uid, tier, limitVal) as any;
      if (success) {
        setCurrentTier(tier);
        // Dispatch custom event for UI feedback across components if needed
        window.dispatchEvent(new CustomEvent('tier-upgraded', { detail: { tier } }));
        alert(`✓ Infrastructure Node Scaled. Account upgraded to ${tier.toUpperCase()}.`);
      }
    } catch (e) {
      console.error("Upgrade failed:", e);
      alert("Failed to scale infrastructure node. Check console for details.");
    }
  };

  const tiers = [
    {
      id: 'standard',
      name: 'Growth',
      price: '$499',
      unit: '/mo',
      limit: 1000,
      features: ['1,000 Human Attestations', 'Basic Sybil Filter', 'Enterprise Support', 'Webhook Relay'],
      icon: Zap,
      accent: 'zinc-100'
    },
    {
      id: 'professional',
      name: 'Scale',
      price: '$1,999',
      unit: '/mo',
      limit: 10000,
      features: ['10,000 Human Attestations', 'Hardware-Bound Defense', 'Priority Engineering Support', 'Custom Claim Metadata', 'Cross-Region Analytics'],
      icon: Shield,
      accent: 'brand-accent'
    },
    {
      id: 'enterprise',
      name: 'Infrastructure',
      price: 'Custom',
      unit: '',
      limit: 999999,
      features: ['Unlimited Attestations', '99.99% Uptime SLA', 'Dedicated Infrastructure Node', 'Air-Gapped Deployment', 'Hardware Enclave Isolation'],
      icon: Globe,
      accent: 'zinc-900',
      text: 'white'
    }
  ];

  return (
    <div className="space-y-16 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase leading-none">Global Infrastructure</h1>
          <div className="flex items-center gap-4 mt-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20">
                <Globe size={10} className="text-brand-accent" />
                <span className="mono text-[9px] uppercase font-bold text-brand-primary tracking-widest">Enterprise Access</span>
             </div>
             <p className="text-brand-secondary mono uppercase text-[9px] tracking-widest opacity-60">Commercial Nodes // Institutional Grade</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-brand-primary text-brand-paper px-8 py-3 rounded-sm mono text-[11px] font-bold uppercase hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/10">
            Institutional Quote
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, i) => {
          const isCurrent = currentTier === tier.id;
          return (
            <div 
              key={i} 
              className={`rounded-2xl border border-brand-primary/5 p-10 space-y-10 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl
                ${isCurrent ? 'bg-brand-accent ring-8 ring-brand-primary/5' : tier.accent === 'zinc-900' ? 'bg-brand-primary text-brand-paper' : 'bg-white'}`}
            >
              <div className="space-y-8">
                <header className="space-y-4">
                  <tier.icon size={48} className={tier.text === 'white' ? 'text-brand-accent' : 'text-brand-primary'} />
                  <div>
                    <h3 className="mono text-[11px] font-bold uppercase tracking-[0.3em] opacity-60">{tier.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-bold tracking-tighter">{tier.price}</span>
                      <span className="mono text-[10px] uppercase font-bold opacity-40">{tier.unit}</span>
                    </div>
                  </div>
                </header>

                <ul className="space-y-4 pt-8 border-t border-brand-primary/5">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-4">
                      <Check size={16} className={`mt-0.5 flex-shrink-0 ${tier.text === 'white' ? 'text-brand-accent' : 'text-brand-primary'}`} />
                      <span className="mono text-[10px] uppercase font-bold tracking-tight opacity-80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => handleUpgrade(tier.id, tier.limit)}
                disabled={isCurrent}
                className={`w-full py-5 rounded-xl mono text-[11px] font-bold uppercase transition-all active:scale-95 shadow-lg
                ${tier.accent === 'zinc-900' ? 'bg-brand-accent text-brand-primary' : 'bg-brand-primary text-white hover:bg-black'} ${isCurrent ? 'opacity-50 cursor-not-allowed shadow-none' : 'shadow-brand-primary/10'}`}>
                {isCurrent ? 'Current Active Node' : tier.name === 'Enterprise' ? 'Contact Sales' : 'Provision Node'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-brand-primary/5 p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-brand-surface rounded-2xl border border-brand-primary/5 flex items-center justify-center shrink-0">
            <Shield className="text-brand-accent" size={32} />
          </div>
          <div>
            <h4 className="text-2xl font-bold uppercase tracking-tighter">Volume Scale Discounts</h4>
            <p className="text-brand-secondary mono text-[10px] uppercase tracking-widest opacity-60 mt-1">Institutional nodes processing &gt;10,000,000 verifications/yr</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = 'mailto:partners@anthropol.io?subject=Infrastructure Partnership'}
          className="bg-brand-primary text-brand-paper px-10 py-4 rounded-full mono text-[11px] font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all shadow-xl shadow-brand-primary/10"
        >
          Request Quote
        </button>
      </div>
    </div>
  );
};
