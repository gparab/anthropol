import { 
  LayoutDashboard, 
  Eye, 
  Terminal, 
  Settings, 
  ShieldCheck,
  CreditCard,
  BarChart3,
  BookOpen,
  Sparkles,
  Code2,
  TrendingUp
} from 'lucide-react';
import { Logo } from './Logo';
import { motion } from 'framer-motion';
import { AppView } from '../types';
import { auth } from '../lib/firebase';

interface NavRailProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

/**
 * Vertical Navigation Rail
 * 
 * Implements the core application routing shell with integrated 
 * system health telemetry and admin-gated access.
 */
export const NavRail = ({ currentView, setView }: NavRailProps) => {
  const isAdmin = auth.currentUser?.email === 'parabgautam@gmail.com';

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics Hub' },
    { id: 'verification_demo', icon: Eye, label: 'SDK Live' },
    { id: 'developer_assets', icon: Terminal, label: 'Infrastructure' },
    { id: 'pricing', icon: CreditCard, label: 'Pricing' },
    ...(isAdmin ? [{ id: 'admin', icon: ShieldCheck, label: 'Admin' }] : []),
  ];

  return (
    <nav className="w-20 border-r border-brand-primary/5 flex flex-col items-center py-10 gap-10 bg-white min-h-screen sticky top-0 flex-shrink-0 z-50">
      <div 
        className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-brand-paper mb-4 cursor-pointer hover:bg-brand-accent hover:text-brand-primary transition-all shadow-lg shadow-brand-primary/10" 
        onClick={() => setView(AppView.LANDING)}
        title="Return to Landing"
        aria-label="Return to Landing Page"
      >
        <Logo className="w-8 h-8" color="currentColor" />
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as AppView)}
            className={`p-4 transition-all duration-300 rounded-2xl relative group ${
              currentView === item.id 
                ? 'bg-brand-paper text-brand-primary' 
                : 'hover:bg-brand-surface text-brand-secondary'
            }`}
            title={item.label}
            aria-label={item.label}
          >
            <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
            {currentView === item.id && (
              <motion.div 
                layoutId="nav-pill"
                className="absolute inset-0 bg-brand-accent/10 rounded-2xl -z-10"
              />
            )}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-6 py-6 mt-auto border-t border-brand-primary/5 w-full">
        <div className="flex flex-col items-center gap-1 group relative cursor-help">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-success animate-pulse shadow-[0_0_8px_rgba(61,90,58,0.5)]" />
          <span className="mono text-[8px] uppercase font-bold text-brand-secondary">Status</span>
          
          {/* Tooltip-style Health Dashboard */}
          <div className="absolute left-20 bottom-0 w-56 bg-white border border-brand-primary/10 p-6 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-2xl z-50 transform translate-x-2 group-hover:translate-x-0">
            <h4 className="mono text-[11px] font-bold uppercase mb-4 text-brand-primary tracking-widest border-b border-brand-primary/5 pb-2">Node Consensus</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="mono text-[9px] uppercase text-brand-secondary">US-EAST-1</span>
                <span className="text-[9px] text-brand-success font-bold mono">99.98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="mono text-[9px] uppercase text-brand-secondary">EU-WEST-3</span>
                <span className="text-[9px] text-brand-success font-bold mono">100.00%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="mono text-[9px] uppercase text-brand-secondary">AP-SN-1</span>
                <span className="text-[9px] text-brand-success font-bold mono">99.99%</span>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-primary/5 flex justify-between items-center">
                <span className="mono text-[9px] uppercase text-brand-secondary opacity-60">Global Load</span>
                <span className="mono text-[10px] font-bold text-brand-primary">14.2%</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setView(AppView.PROFILE)}
          className={`p-4 transition-all duration-300 rounded-2xl relative group ${
            currentView === AppView.PROFILE
              ? 'bg-brand-paper text-brand-primary' 
              : 'hover:bg-brand-surface text-brand-secondary'
          }`}
          title="Account Settings"
          aria-label="Account and Infrastructure Settings"
        >
          <Settings size={22} strokeWidth={currentView === AppView.PROFILE ? 2.5 : 2} />
          {currentView === AppView.PROFILE && (
            <motion.div 
              layoutId="nav-pill"
              className="absolute inset-0 bg-brand-accent/10 rounded-2xl -z-10"
            />
          )}
        </button>
      </div>
    </nav>
  );
};
