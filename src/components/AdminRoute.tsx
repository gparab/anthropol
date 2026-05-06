import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock } from 'lucide-react';
import { auth } from '../lib/firebase';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminRoute Component
 * 
 * Protects sensitive administrative views. 
 * Only allows access if the authenticated user matches the hardcoded 
 * master administrator identity (Gautam Parab).
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children, fallback }) => {
  const user = auth.currentUser;
  const isAdmin = user?.email === 'parabgautam@gmail.com';

  if (!isAdmin) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20"
        >
          <Lock className="text-red-500" size={32} />
        </motion.div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold uppercase tracking-tight text-brand-primary">Access Forbidden</h3>
          <p className="text-brand-secondary max-w-xs mx-auto opacity-70">
            This module is restricted to Level-1 Protocol Administrators. Your biometric signature does not match the master key.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg border border-white/5">
          <ShieldAlert size={14} className="text-brand-accent" />
          <span className="mono text-[10px] uppercase font-bold tracking-widest">Incident Logged: Unauthorized Access Attempt</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
