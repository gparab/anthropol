import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Globe, 
  LogOut, 
  RefreshCw, 
  Key, 
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  Camera,
  Trash2,
  Lock,
  History,
  AlertCircle
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { verificationService } from '../lib/services';
import { User, LegalZone } from '../types';
import { motion } from 'framer-motion';

/**
 * User Profile & Infrastructure Configuration Page
 * 
 * Provides centralized management for identity, organization context, 
 * data sovereignty zones, and security credentials.
 */
export const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSignoutLoading, setIsSignoutLoading] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          email: currentUser.email || '',
          role: currentUser.email === 'parabgautam@gmail.com' ? 'admin' : 'developer'
        });
        setPhotoUrl(currentUser.photoURL);

        try {
          const data = await verificationService.getClientProfile(currentUser.uid);
          setProfile(data);
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    if (!window.confirm(" [SECURITY PROTOCOL] \n\nYou are about to terminate the current session. All dynamic telemetry subscriptions will be severed. \n\nContinue?")) return;
    
    setIsSignoutLoading(true);
    try {
      await auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsSignoutLoading(false);
    }
  };

  const handleUpdateZone = async (zone: LegalZone) => {
    if (user) {
      const confirmed = window.confirm(` [INFRASTRUCTURE UPDATE] \n\nChanging the legal shard to ${zone} will initiate a data migration for future verifications. \n\nConfirm shard migration?`);
      if (confirmed) {
        await verificationService.updateClientProfile(user.id, { legalZone: zone });
        setProfile({ ...profile, legalZone: zone });
      }
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setIsUpdatingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updateProfile(auth.currentUser!, { photoURL: base64 });
        if (user) {
          await verificationService.updateClientProfile(user.id, { photoURL: base64 });
        }
        setPhotoUrl(base64);
        setIsUpdatingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo update failed:', error);
      setIsUpdatingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!auth.currentUser || !window.confirm("Reset profile avatar to system default?")) return;
    
    setIsUpdatingPhoto(true);
    try {
      await updateProfile(auth.currentUser!, { photoURL: '' });
      if (user) {
        await verificationService.updateClientProfile(user.id, { photoURL: '' });
      }
      setPhotoUrl(null);
    } catch (error) {
      console.error('Photo deletion failed:', error);
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-brand-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Pattern matches Command Center */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 gap-6 border-b border-brand-primary/5">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-brand-accent">
            <UserIcon size={20} />
            <span className="mono text-[10px] font-bold uppercase tracking-[0.3em]">Identity Hub</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase leading-none">Account Profile</h1>
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-success/10 rounded-full border border-brand-success/10">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                <span className="mono text-[9px] uppercase font-bold text-brand-success tracking-widest">Shard Connected</span>
             </div>
             <p className="mono text-[11px] text-brand-secondary opacity-60 uppercase tracking-widest">
              ID: <span className="text-brand-primary font-bold">{user?.id.substring(0, 16)}</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={handleLogout}
            disabled={isSignoutLoading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-primary text-brand-paper px-8 py-3 rounded-sm mono text-[11px] font-bold uppercase hover:bg-red-500 transition-all group disabled:opacity-50 shadow-lg shadow-brand-primary/10"
          >
            {isSignoutLoading ? 'Severing...' : 'Terminate Session'}
            <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Configuration Column */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Identity & Visual Panel */}
          <section className="bg-white border border-brand-primary/5 rounded-2xl p-8 space-y-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
              <UserIcon size={160} />
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="relative group/avatar">
                <div className="w-32 h-32 bg-brand-surface rounded-full flex items-center justify-center border-2 border-brand-primary/10 overflow-hidden shadow-inner bg-gradient-to-br from-brand-surface to-brand-primary/5">
                   {isUpdatingPhoto ? (
                     <RefreshCw size={32} className="animate-spin text-brand-accent" />
                   ) : photoUrl ? (
                     <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <UserIcon size={48} className="text-brand-primary/10" />
                   )}
                </div>
                
                <div className="absolute -bottom-2 -right-2 flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-brand-primary text-brand-paper rounded-full shadow-xl hover:bg-brand-accent hover:text-brand-primary transition-all scale-90 hover:scale-100"
                    title="Change Photo"
                  >
                    <Camera size={16} />
                  </button>
                  {photoUrl && (
                    <button 
                      onClick={handleDeletePhoto}
                      className="p-3 bg-white text-red-500 border border-brand-primary/5 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all scale-90 hover:scale-100"
                      title="Remove Photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                />
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-1">
                   <h3 className="mono text-[11px] font-bold uppercase tracking-widest text-brand-accent">Identity Signature</h3>
                   <p className="text-3xl font-bold tracking-tight">{auth.currentUser?.displayName || 'Anonymous Developer'}</p>
                   <div className="flex items-center gap-2 text-brand-secondary/60">
                     <Mail size={14} />
                     <span className="mono text-[11px] font-medium">{user?.email}</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-brand-surface border border-brand-primary/5 rounded-xl space-y-2 group/card hover:border-brand-accent/30 transition-colors">
                    <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest">Protocol Auth Tier</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-accent/10 rounded-lg">
                        <Shield size={16} className="text-brand-accent" />
                      </div>
                      <span className="font-bold uppercase text-sm tracking-tight">{user?.role}</span>
                    </div>
                  </div>
                  <div className="p-5 bg-brand-surface border border-brand-primary/5 rounded-xl space-y-2 group/card hover:border-brand-success/30 transition-colors">
                    <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest">Compliance Status</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-success/10 rounded-lg">
                        <ShieldCheck size={16} className="text-brand-success" />
                      </div>
                      <span className="font-bold uppercase text-sm tracking-tight">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Infrastructure Sharding Panel */}
          <section className="bg-white border border-brand-primary/5 rounded-2xl p-8 space-y-8 shadow-sm">
            <div className="flex justify-between items-center border-b border-brand-primary/5 pb-6">
              <div className="space-y-1">
                <h3 className="mono text-[11px] font-bold uppercase tracking-widest text-brand-secondary">Infrastructure Sharding</h3>
                <p className="text-[10px] text-brand-secondary opacity-50 uppercase font-bold tracking-tighter">GDPR / CCPA Sovereignty Management</p>
              </div>
              <div className="flex items-center gap-2 text-brand-success px-4 py-1.5 bg-brand-success/5 rounded-full border border-brand-success/10">
                <Globe size={14} />
                <span className="mono text-[10px] font-bold uppercase tracking-widest">Residency Active</span>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(['US-EAST', 'EU-WEST', 'APAC', 'LATAM'] as LegalZone[]).map((zone) => (
                  <button
                    key={zone}
                    onClick={() => handleUpdateZone(zone)}
                    className={`group relative overflow-hidden py-4 px-4 rounded-xl mono text-[11px] font-bold uppercase border transition-all ${
                      profile?.legalZone === zone 
                        ? 'bg-brand-primary text-brand-paper border-brand-primary shadow-xl shadow-brand-primary/10' 
                        : 'bg-brand-surface text-brand-secondary border-brand-primary/5 hover:border-brand-accent hover:text-brand-accent'
                    }`}
                  >
                    <span className="relative z-10">{zone}</span>
                  </button>
                ))}
              </div>

              <div className="p-8 bg-brand-primary text-brand-paper rounded-2xl space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={80} />
                 </div>
                 <div className="flex items-center gap-3 relative z-10">
                   <div className="p-2 bg-brand-accent text-brand-primary rounded-lg shadow-lg">
                    <Zap size={18} />
                   </div>
                   <p className="font-bold uppercase text-base tracking-tight">Organization Cluster</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 relative z-10 border-t border-white/10 pt-6">
                   <div className="space-y-1">
                     <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest">Entity Signature</p>
                     <p className="text-xl font-bold tracking-tight">{profile?.name || 'Infrastucture Node Beta'}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="mono text-[9px] uppercase opacity-40 font-bold tracking-widest">Provisioned On</p>
                     <p className="text-xl font-bold tracking-tight">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '01/01/2026'}</p>
                   </div>
                 </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Operational Stats */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-brand-primary rounded-2xl p-8 border border-white/5 shadow-2xl shadow-brand-primary/20">
             <div className="flex items-center gap-3 mb-8">
               <Activity size={18} className="text-brand-accent" />
               <h4 className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">Resource Quota</h4>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="mono text-[10px] uppercase font-bold text-white/40">Verified Requests</span>
                    <span className="text-2xl font-bold font-mono text-brand-accent leading-none">
                      {Math.round((profile?.usage?.currentMonth / profile?.usage?.limit) * 100) || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(profile?.usage?.currentMonth / profile?.usage?.limit) * 100}%` }}
                      className="h-full bg-brand-accent shadow-[0_0_12px_rgba(245,184,64,0.5)]" 
                    />
                  </div>
                  <p className="mono text-[9px] uppercase text-white/30 text-right font-bold">
                    {profile?.usage?.currentMonth || 0} / {profile?.usage?.limit || 1000} monthly limit
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <button className="w-full flex items-center justify-between group p-3 hover:bg-white/5 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <Key size={16} className="text-brand-secondary opacity-40 group-hover:text-brand-accent transition-colors" />
                      <span className="mono text-[10px] font-bold uppercase text-white/60 group-hover:text-white transition-colors">Access Credentials</span>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between group p-3 hover:bg-white/5 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <History size={16} className="text-brand-secondary opacity-40 group-hover:text-brand-accent transition-colors" />
                      <span className="mono text-[10px] font-bold uppercase text-white/60 group-hover:text-white transition-colors">Audit Event Log</span>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
             </div>
           </section>

           <div className="p-8 bg-brand-surface rounded-2xl border border-brand-primary/5 space-y-6 relative overflow-hidden">
              <div className="flex items-center gap-3 text-brand-accent">
                <Lock size={16} />
                <span className="mono text-[10px] uppercase font-bold tracking-[0.2em]">Encryption Standard</span>
              </div>
              <p className="text-[11px] leading-relaxed text-brand-secondary opacity-70 font-medium font-sans">
                Identity payloads are encrypted using <span className="text-brand-primary font-bold">AES-256-GCM</span> at the regional shard boundary. Biometric hashes never transit public subnets in plaintext.
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-1 bg-brand-accent/20 rounded-full" />
                <div className="w-4 h-1 bg-brand-accent/20 rounded-full" />
                <div className="w-12 h-1 bg-brand-accent/20 rounded-full" />
              </div>
           </div>

           <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex items-start gap-4">
              <AlertCircle size={18} className="text-red-500 mt-1 shrink-0" />
              <div className="space-y-1">
                <p className="mono text-[10px] font-bold uppercase text-red-500">Infrastructure Alert</p>
                <p className="text-[10px] text-red-900/60 font-medium">Session termination is immediate. All downstream verification pipelines will pause until re-authentication.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
