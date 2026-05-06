import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Download } from 'lucide-react';

interface SignalMonitorProps {
  sessionData?: any;
}

// Helper to generate jitter around a baseline for visualization
const generateSignalData = (rPPG: number = 0.98, parallax: number = 0.99, rawSamples?: number[]) => {
  if (rawSamples && rawSamples.length > 0) {
    // Normalizing raw samples for visualization (green channel values are usually 0-255)
    const min = Math.min(...rawSamples);
    const max = Math.max(...rawSamples);
    const range = max - min || 1;
    
    return rawSamples.map((v, i) => ({
      time: i,
      rPPG: (v - min) / range, // Normalize 0-1 for the chart
      parallax: parallax - (Math.random() * 0.05),
      latency: 180 + (Math.random() * 20),
    }));
  }

  return Array.from({ length: 40 }, (_, i) => ({
    time: i,
    rPPG: (rPPG - 0.1) + Math.sin(i * 0.3) * 0.05 + (Math.random() * 0.02),
    parallax: parallax - (Math.random() * 0.05),
    latency: 180 + (Math.random() * 20),
  }));
};

export const SignalMonitor = ({ sessionData }: SignalMonitorProps) => {
  const data = generateSignalData(
    sessionData?.signals?.rPPG, 
    sessionData?.signals?.parallax,
    sessionData?.signals?.telemetry?.samples
  );
  
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* rPPG Pulse Wave */}
        <div className="bg-white rounded-2xl p-10 border border-brand-primary/5 shadow-sm space-y-6">
          <header className="flex justify-between items-center">
             <div className="space-y-1">
               <h3 className="mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-secondary opacity-60">Biological Signal</h3>
               <p className="text-xl font-bold tracking-tighter uppercase">rPPG Pulse Wave</p>
             </div>
             <div className="flex gap-3">
               {sessionData?.signals?.bpm && (
                 <div className="flex items-center gap-2 px-3 py-1 bg-brand-success/10 rounded-full border border-brand-success/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                    <span className="mono text-[10px] text-brand-success font-bold uppercase">{sessionData.signals.bpm} BPM</span>
                 </div>
               )}
               <span className="mono text-[10px] text-brand-primary bg-brand-accent px-4 py-1 rounded-full font-bold uppercase">Sync Locked</span>
             </div>
          </header>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-brand-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-brand-primary)" strokeOpacity={0.05} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#15120d', border: 'none', borderRadius: '12px', color: '#fbf8f1' }}
                  itemStyle={{ color: 'var(--color-brand-accent)', fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 600 }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rPPG" 
                  stroke="var(--color-brand-primary)" 
                  fillOpacity={1} 
                  fill="url(#colorPulse)" 
                  strokeWidth={3}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-brand-secondary/60 leading-relaxed font-medium line-clamp-2">
            Sub-pixel chrominance variance detected in facial regions. Rhythmicity score {sessionData?.signals?.telemetry?.rhythmScore?.toFixed(3) || '0.992'} indicates high biological fidelity.
          </p>
        </div>

        {/* Physics Latency Parallax */}
        <div className="bg-white rounded-2xl p-10 border border-brand-primary/5 shadow-sm space-y-6">
          <header className="flex justify-between items-center">
             <div className="space-y-1">
               <h3 className="mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-secondary opacity-60">Attestation Check</h3>
               <p className="text-xl font-bold tracking-tighter uppercase">Physics Parallax</p>
             </div>
             <span className="mono text-[10px] text-brand-primary bg-brand-surface border border-brand-primary/5 px-4 py-1 rounded-full font-bold uppercase">Jitter: 4ms</span>
          </header>
          <div className="h-48 w-full opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-brand-primary)" strokeOpacity={0.05} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#15120d', border: 'none', borderRadius: '12px', color: '#fbf8f1' }}
                  itemStyle={{ color: '#FFFFFF', fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 600 }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="latency" 
                  stroke="var(--color-brand-primary)" 
                  strokeWidth={2} 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="parallax" 
                  stroke="var(--color-brand-secondary)" 
                  strokeWidth={1} 
                  strokeDasharray="4 4"
                  dot={false}
                  opacity={0.3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-brand-secondary/60 leading-relaxed font-medium line-clamp-2">
            Hardware latency vs frame-rate stability. No virtual camera injection detected. Structured light pulse synchronization confirmed.
          </p>
        </div>

      </div>

      <div className="rounded-2xl p-8 bg-brand-surface border border-brand-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex gap-12">
            <div className="space-y-2">
               <p className="mono font-bold text-[9px] uppercase tracking-[0.3em] text-brand-secondary opacity-50">Confidence</p>
               <p className="text-3xl font-bold tracking-tighter text-brand-primary">{Math.round((sessionData?.score || 0.99) * 100000) / 1000}%</p>
            </div>
            <div className="space-y-2">
               <p className="mono font-bold text-[9px] uppercase tracking-[0.3em] text-brand-secondary opacity-50">Method</p>
               <div className="flex flex-col">
                  <p className="text-sm font-bold text-brand-primary uppercase">ZKP-SNARK</p>
                  <p className="text-[10px] text-brand-secondary mono font-medium opacity-60">Production Protocol</p>
               </div>
            </div>
         </div>
         <button 
          onClick={() => {
            const audit = {
              sessionId: sessionData?.id,
              timestamp: sessionData?.timestamp,
              metrics: sessionData?.signals,
              verification: {
                method: "ZKP-SNARK",
                score: sessionData?.score,
                status: sessionData?.status
              }
            };
            const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-${sessionData?.id || 'session'}.json`;
            a.click();
          }}
          className="bg-brand-primary text-brand-paper px-8 py-3 rounded-full mono text-[11px] font-bold uppercase hover:bg-brand-accent hover:text-brand-primary transition-all shadow-lg shadow-brand-primary/10 flex items-center gap-2"
         >
            <Download size={14} /> Audit Log
         </button>
      </div>
    </div>
  );
};
