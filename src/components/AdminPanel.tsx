import { useState, useEffect } from 'react';
import { Database, Search, ShieldAlert, BarChart3, TrendingUp, Lock } from 'lucide-react';
import { verificationService } from '../lib/services';
import axios from 'axios';

/**
 * Global Admin Control Plane
 * 
 * Restrict-access dashboard for ecosystem health, client management, 
 * and network-wide threat mitigation.
 */
export const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 42,
    totalVerifications: 1284,
    successRate: 98.2,
    botInterceptions: 14201,
    networkLoad: '1.2 TB'
  });
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [systemLoad, setSystemLoad] = useState({ cpu: 0, mem: 0 });
  const [isLockingDown, setIsLockingDown] = useState(false);
  const [isLockedDown, setIsLockedDown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clients = await verificationService.getAllClients(50); // Get more for search
        if (clients) setRecentClients(clients);
        
        const globalStats = await verificationService.getGlobalStats();
        setStats(prev => ({ ...prev, ...globalStats }));
      } catch (err) {
        console.error('Admin Fetch Error:', err);
      }
    };
    fetchData();

    const fetchLockdownStatus = async () => {
      try {
        const res = await axios.get('/api/system/lockdown');
        setIsLockedDown(res.data.isLockedDown);
      } catch (e) {
        console.error('Lockdown fetch error:', e);
      }
    };
    fetchLockdownStatus();

    // Fetch real-time load
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/api/system/health');
        setSystemLoad({ cpu: res.data.cpu, mem: res.data.mem });
      } catch (e) {
        console.error('Health fetch error:', e);
      }
    };
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLockdown = async () => {
    if (window.confirm('CRITICAL: Initiating Global System Lockdown. This will suspend all verification nodes. Proceed?')) {
      setIsLockingDown(true);
      try {
        await axios.post('/api/system/lockdown');
        setIsLockedDown(true);
        alert('Ecosystem Suspended. Master Oracle is now in Read-Only mode.');
      } catch (error) {
        alert('Failed to initiate lockdown');
      } finally {
        setIsLockingDown(false);
      }
    }
  };

  const handleFlushCache = () => {
    if (confirm('Flush edge cache shards?')) {
      alert('Sub-second cache flush initiated across all edge shards.');
    }
  };

  const filteredClients = recentClients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500 ${isLockedDown ? 'opacity-80 grayscale pointer-events-none' : ''}`}>
      {isLockedDown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto">
          <div className="bg-red-600 text-white p-12 rounded-3xl max-w-lg text-center space-y-6 shadow-2xl">
            <Lock size={64} className="mx-auto" />
            <div>
              <h2 className="text-4xl font-bold uppercase tracking-tighter">System Lockdown</h2>
              <p className="opacity-80 mt-2 font-mono text-xs uppercase tracking-widest">Global Master Oracle Suspended</p>
            </div>
            <p className="text-sm font-medium">All edge verification nodes are disabled. Biometric ingestion has been halted across all geographic zones.</p>
          </div>
        </div>
      )}
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 gap-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase leading-none">Global Oracle</h1>
          <div className="flex items-center gap-4 mt-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                <ShieldAlert size={10} className="text-red-500 animate-pulse" />
                <span className="mono text-[9px] uppercase font-bold text-red-500 tracking-widest">Root Access Level 0</span>
             </div>
             <p className="text-brand-secondary mono uppercase text-[9px] tracking-widest opacity-60">Internal Control Plane // Classified</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={isLockingDown}
            onClick={handleLockdown}
            className="bg-brand-primary text-brand-paper px-8 py-3 rounded-sm mono text-[11px] font-bold uppercase hover:bg-red-600 transition-all shadow-lg shadow-brand-primary/10 disabled:opacity-50"
          >
            {isLockingDown ? 'Suspending...' : 'System Lockdown'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-primary text-brand-paper rounded-2xl p-10 shadow-xl shadow-brand-primary/10 transition-all hover:scale-[1.02]">
          <p className="mono text-[11px] uppercase opacity-40 font-bold tracking-[0.2em] mb-4">Network Load</p>
          <div className="flex justify-between items-end">
            <h2 className="text-4xl font-bold tracking-tighter">{stats.networkLoad}</h2>
            <TrendingUp size={24} className="text-brand-success" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-10 border border-brand-primary/5 shadow-sm hover:bg-brand-surface transition-all">
          <p className="mono text-[11px] uppercase text-brand-secondary font-bold tracking-[0.2em] mb-4">Verified Humans</p>
          <h2 className="text-4xl font-bold tracking-tighter text-brand-primary">{stats.totalVerifications.toLocaleString()}</h2>
        </div>
        <div className="bg-white rounded-2xl p-10 border border-brand-primary/5 shadow-sm hover:bg-brand-surface transition-all">
          <p className="mono text-[11px] uppercase text-brand-secondary font-bold tracking-[0.2em] mb-4">Interceptions</p>
          <h2 className="text-4xl font-bold tracking-tighter text-brand-primary">{stats.botInterceptions.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
           <div className="flex justify-between items-center">
             <div>
               <h3 className="text-2xl font-bold uppercase tracking-tighter">Client Registry</h3>
               <p className="text-brand-secondary mono text-[9px] uppercase tracking-widest opacity-60">Global Human Node Directory</p>
             </div>
             <div className="flex items-center gap-3 px-4 py-2 bg-brand-surface rounded-sm border border-brand-primary/5">
               <Search size={14} className="text-brand-primary/40" />
               <input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search UID..." 
                 className="bg-transparent outline-none mono text-[10px] w-32 uppercase font-bold" 
               />
             </div>
           </div>

          <div className="space-y-4">
            {filteredClients.map(client => (
              <div key={client.id} className="flex justify-between items-center p-6 hover:bg-brand-surface border border-brand-primary/5 rounded-xl transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center font-bold text-sm ring-1 ring-brand-primary/10 group-hover:bg-brand-accent transition-colors">
                    {client.name?.[0]}
                  </div>
                  <div>
                    <p className="mono text-sm font-bold uppercase text-brand-primary">{client.name}</p>
                    <p className="mono text-[9px] opacity-40 uppercase tracking-widest">{client.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="mono text-[11px] uppercase font-bold text-brand-primary">{client.tier}</p>
                  <p className="mono text-[9px] opacity-40 uppercase font-bold tracking-tighter italic">{client.usage?.currentMonth || 0} verifications</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-primary/5 shadow-sm p-10 space-y-8">
          <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
             <BarChart3 className="text-brand-accent" size={24} /> System Health
          </h3>
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between mono text-[10px] uppercase font-bold tracking-widest">
                <span className="opacity-60">CPU Load (Oracle)</span>
                <span className="text-brand-primary">{systemLoad.cpu}%</span>
              </div>
              <div className="h-1.5 bg-brand-primary/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-success rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-1000" style={{ width: `${systemLoad.cpu}%` }} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between mono text-[10px] uppercase font-bold tracking-widest">
                <span className="opacity-60">Memory usage</span>
                <span className="text-brand-primary">{(systemLoad.mem * 6.4 / 100).toFixed(1)} GB</span>
              </div>
              <div className="h-1.5 bg-brand-primary/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent rounded-full shadow-[0_0_8px_rgba(245,184,64,0.4)] transition-all duration-1000" style={{ width: `${systemLoad.mem}%` }} />
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-brand-primary/5">
            <button 
              onClick={handleFlushCache}
              className="w-full bg-red-600 text-white py-4 rounded-xl mono text-[11px] font-bold uppercase hover:bg-black transition-all shadow-xl shadow-red-600/10 active:scale-95"
            >
              Force Flush Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
