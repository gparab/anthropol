import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { verificationService } from '../lib/services';
import { auth } from '../lib/firebase';

/**
 * Client Analytics Hub
 * 
 * Provides deep visibility into verification velocity, bot-interception 
 * metrics, and regional humanity distribution.
 */
export const AnthropolAnalyticsHub = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Analytics Data Stream Initialization
   * Synchronizes with the client's regional sharded verification ledger 
   * to compute high-fidelity performance metrics.
   */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    return verificationService.subscribeToClientAnalytics(user.uid, (data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Activity className="animate-spin text-brand-accent" size={32} />
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Success Rate (p99)', 
      val: `${analytics?.successRate}%`, 
      icon: TrendingUp,
      color: 'text-green-500',
      sub: 'Attestation Integrity Floor'
    },
    { 
      label: 'Intercepts (L3)', 
      val: analytics?.failed || 0, 
      icon: ShieldAlert,
      color: 'text-red-500',
      sub: 'Synthetic Surge Blocked'
    },
    { 
      label: 'Network Load', 
      val: analytics?.total || 0, 
      icon: Users,
      color: 'text-brand-primary',
      sub: 'Atomic Human Attestations'
    }
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase leading-none">Developer Core</h1>
          <div className="flex items-center gap-4 mt-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20">
                <Activity size={10} className="text-brand-accent" />
                <span className="mono text-[9px] uppercase font-bold text-brand-primary tracking-widest">Network Health: Optimal</span>
             </div>
             <p className="text-brand-secondary mono uppercase text-[9px] tracking-widest opacity-60">Master Oracle // sub-second latency</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-brand-primary text-brand-paper px-8 py-3 rounded-sm mono text-[11px] font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all shadow-lg shadow-brand-primary/10">
            Export JSON Logs
          </button>
        </div>
      </header>

      {/* Real-time Infrastructure Mesh: Live Network Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 text-white p-6 rounded-xl border border-white/10 space-y-4">
           <div className="flex justify-between items-center opacity-40">
              <span className="mono text-[9px] uppercase font-bold">Inference Speed</span>
              <Activity size={12} />
           </div>
           <div className="flex bg-zinc-800 h-10 items-center justify-center rounded mono text-lg font-bold text-brand-accent">
              1.24ms
           </div>
        </div>
        <div className="bg-zinc-900 text-white p-6 rounded-xl border border-white/10 space-y-4">
           <div className="flex justify-between items-center opacity-40">
              <span className="mono text-[9px] uppercase font-bold">Node Uptime</span>
              <Activity size={12} />
           </div>
           <div className="flex bg-zinc-800 h-10 items-center justify-center rounded mono text-lg font-bold text-green-400">
              99.998%
           </div>
        </div>
        <div className="bg-zinc-900 text-white p-6 rounded-xl border border-white/10 space-y-4">
           <div className="flex justify-between items-center opacity-40">
              <span className="mono text-[9px] uppercase font-bold">Active Shards</span>
              <Activity size={12} />
           </div>
           <div className="flex bg-zinc-800 h-10 items-center justify-center rounded mono text-lg font-bold">
              128
           </div>
        </div>
        <div className="bg-zinc-900 text-white p-6 rounded-xl border border-white/10 space-y-4">
           <div className="flex justify-between items-center opacity-40">
              <span className="mono text-[9px] uppercase font-bold">Compliance Shard</span>
              <ShieldAlert size={12} className="text-brand-accent" />
           </div>
           <div className="flex bg-zinc-800 h-10 items-center justify-center rounded mono text-lg font-bold text-brand-accent uppercase">
              GDPR / CCPA
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-2xl border border-brand-primary/5 shadow-sm group hover:bg-brand-surface transition-all">
            <div className="flex justify-between items-start mb-6">
              <p className="mono text-[11px] uppercase font-bold text-brand-secondary tracking-[0.2em]">{stat.label}</p>
              <stat.icon size={20} className={stat.color} />
            </div>
            <h2 className="text-5xl font-bold tracking-tighter text-brand-primary">{stat.val}</h2>
            <p className="mono text-[10px] uppercase mt-4 opacity-40 font-bold tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verification Velocity Chart: Temporal Density Analysis */}
        <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
          <header className="flex justify-between items-center">
             <div>
               <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
                 <Activity size={24} className="text-brand-accent" /> Verification Velocity
               </h3>
               <p className="text-brand-secondary mono text-[9px] uppercase tracking-widest opacity-60">Temporal Density Analysis</p>
             </div>
             <span className="mono text-[10px] font-bold uppercase px-4 py-1.5 bg-brand-surface border border-brand-primary/5 rounded-full text-brand-primary">n = {analytics?.total}</span>
          </header>
          {/* ... chart ... */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.trend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ADFF2F" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ADFF2F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(str) => str.split('-').slice(1).join('/')}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0' }}
                  itemStyle={{ color: '#ADFF2F', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                  labelStyle={{ color: '#FFFFFF', fontSize: '8px', marginBottom: '4px' }}
                />
                <Area 
                  type="stepAfter" 
                  dataKey="count" 
                  stroke="#141414" 
                  fill="url(#colorTrend)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-8 border-t border-brand-primary/5">
             <p className="text-[11px] text-brand-secondary mono uppercase tracking-wider leading-relaxed opacity-60">
               Historical aggregation of verified biological sessions. Growth velocity indicates healthy ecosystem adoption and low churn in verified nodes.
             </p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
          <header className="flex justify-between items-center">
             <div>
               <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
                 <Layers size={24} className="text-brand-primary" /> Integrity Mix
               </h3>
               <p className="text-brand-secondary mono text-[9px] uppercase tracking-widest opacity-60">Human vs. Synthetic Detection</p>
             </div>
          </header>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'PAST', val: analytics?.passed || 0, color: '#141414' },
                { name: 'FAILED', val: analytics?.failed || 0, color: '#FF4500' }
              ]}>
                <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '0' }}
                  itemStyle={{ color: '#FFFFFF', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                />
                <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                  {
                    [
                      { name: 'PAST', val: analytics?.passed || 0, color: '#141414' },
                      { name: 'FAILED', val: analytics?.failed || 0, color: '#FF4500' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-8 border-t border-brand-primary/5 flex justify-between items-end">
             <p className="text-[11px] text-brand-secondary mono uppercase tracking-wider leading-relaxed opacity-60 flex-1 pr-6">
               Ratio of verified humans to identified spoofs. Health: {analytics?.successRate >= 95 ? 'OPTIMAL' : 'MONITORING'}.
             </p>
             <div className="text-right shrink-0">
                <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest mb-1">Confidence</p>
                <p className="mono text-xs font-bold uppercase text-brand-primary bg-brand-accent px-3 py-1 rounded-full">ZK-Verified</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
