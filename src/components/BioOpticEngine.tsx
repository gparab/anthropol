import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, ShieldAlert, Activity, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { useAnthropol } from '../hooks/useAnthropol';
import { useActiveIllumination } from '../hooks/useActiveIllumination';
import { IlluminationOverlay } from './IlluminationOverlay';
import { TelemetryPreFlight } from './TelemetryPreFlight';

interface BioOpticEngineProps {
  /** Callback triggered when verification sequence completes successfully */
  onCaptureComplete: (verificationData: any) => void;
  /** Callback to clear verification state in the parent component */
  onReset: () => void;
  /** Optional callback for real-time telemetry updates */
  onMetricUpdate?: (metrics: any) => void;
  /** Optional callback for real-time log updates */
  onLogUpdate?: (logs: any[]) => void;
}

/**
 * Bio-Optic Capture Engine
 * 
 * Orchestrates the hardware-software handshake for biometric verification.
 * It manages:
 * 1. MediaStream initialization (Camera Access)
 * 2. Visual feedback for dSP and AI scan phases
 * 3. Synchronization with the Anthropol hook for ZK-proof generation
 */
export const BioOpticEngine = ({ onCaptureComplete, onReset, onMetricUpdate, onLogUpdate }: BioOpticEngineProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [internalStatus, setInternalStatus] = useState<'idle' | 'initializing' | 'ready'>('idle');
  
  const { isVerifying, status, error, progress, startVerification, hardwareBound, logs, metrics } = useAnthropol();
  const [showLogs, setShowLogs] = useState(false);
  const { currentStep, sequence } = useActiveIllumination(isVerifying);

  // Sync metrics & logs to parent
  useEffect(() => {
    if (onMetricUpdate) onMetricUpdate(metrics);
  }, [metrics, onMetricUpdate]);

  useEffect(() => {
    if (onLogUpdate) onLogUpdate(logs);
  }, [logs, onLogUpdate]);

  /**
   * Hardware Initialization
   * Provisions the user's camera module with optimized constraints for dSP rPPG analysis.
   */
  const startCamera = async () => {
    setInternalStatus('initializing');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: 'user',
          frameRate: { min: 30, ideal: 30 } // Required for stable dSP frequency analysis
        },
        audio: false
      });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setInternalStatus('ready');
    } catch (err) {
      console.error('[HARDWARE]: Camera access denied or hardware busy.', err);
      // Let the parent know if camera initialization fails (implemented via error/status in hook)
    }
  };

  /**
   * Verification Orchestration
   * Initiates the multi-phase biological verification pipeline (dSP -> AI -> ZK).
   */
  const handleVerify = async () => {
    if (!videoRef.current) return;
    try {
      // Orchestrate the verification (dSP + AI + ZK)
      // Pass the sequence to the verification hook for liveness validation
      const result = await startVerification(videoRef.current, sequence);
      
      // Cleanup visual state but maintain persistence context
      if (result) {
        onCaptureComplete(result);
      }
    } catch (e: any) {
      console.error('[PROTOCOL-ERROR]: Verification flow interrupted.', e);
      // The hook already updates state.error which is rendered below.
    }
  };

  /**
   * Resource Cleanup Lifecycle
   * Prevents system-level resource leaks by terminating camera tracks on unmount.
   */
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden group rounded-2xl shadow-3xl border border-brand-primary/5">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-all duration-1000 
          ${isVerifying ? 'grayscale-0 scale-105' : 'grayscale opacity-30 blur-[4px]'}`}
      />

      <IlluminationOverlay step={currentStep} />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Interaction Entry: Idle State */}
        {internalStatus === 'idle' && !isVerifying && !error && (
          <button 
            onClick={startCamera} 
            className="group flex flex-col items-center gap-8 transition-all hover:scale-105"
          >
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl group-hover:bg-brand-accent/20 group-hover:border-brand-accent/50 transition-all">
              <Camera className="text-white group-hover:text-brand-accent transition-colors" size={40} />
            </div>
            <div className="space-y-2 text-center">
              <span className="mono text-[12px] text-white uppercase tracking-[0.4em] font-bold">Initialize Biosensors</span>
              <p className="text-[10px] text-white/40 uppercase mono tracking-[0.2em] opacity-60">Anthropol Biological Protocol v1.4</p>
            </div>
          </button>
        )}

        {/* Handshake Phase */}
        {internalStatus === 'initializing' && !error && (
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-white/10 absolute inset-0 animate-ping" />
              <div className="w-20 h-20 rounded-2xl border border-brand-accent flex items-center justify-center bg-black/40 backdrop-blur-xl">
                <RefreshCw className="text-brand-accent animate-spin" size={32} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <span className="mono text-[11px] text-brand-accent uppercase tracking-[0.3em] font-bold">Authenticating Enclave...</span>
              <p className="mono text-[9px] text-white/20 uppercase">TPM Handshake Active</p>
            </div>
          </div>
        )}

        {/* Readiness Phase: Waiting for User Trigger */}
        {internalStatus === 'ready' && !isVerifying && !error && (
          <div className="flex flex-col items-center gap-12">
            <div className="relative">
              <div className="w-64 h-64 border border-brand-accent/30 rounded-full flex items-center justify-center animate-pulse">
                 <div className="w-56 h-56 border border-white/5 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-brand-accent rounded-full shadow-[0_0_30px_rgba(245,184,64,0.6)]" />
                 </div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 mono text-[10px] text-brand-accent font-bold uppercase tracking-widest whitespace-nowrap">
                Biological Lock Found
              </div>
            </div>
            <div className="flex flex-col items-center gap-6 z-10 max-w-sm w-full">
              <TelemetryPreFlight videoRef={videoRef} onStart={handleVerify} />
              
              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-white/10" />
                <p className="text-[10px] text-white/40 uppercase mono tracking-[0.2em]">3 Second Capture Window</p>
                <div className="h-px w-8 bg-white/10" />
              </div>
            </div>
          </div>
        )}

        {/* Execution Phase: Verification Pipeline Active */}
        {isVerifying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-brand-accent/5 pointer-events-none animate-pulse" />
            
            <div className="absolute bottom-16 w-full px-16 space-y-6 max-w-3xl">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="mono text-[9px] text-brand-accent uppercase font-bold tracking-[0.3em] opacity-60">Status</span>
                  <p className="mono text-sm text-white uppercase font-bold tracking-widest">{status}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                   <div className="flex items-center gap-2 text-brand-accent">
                      <Activity size={14} className="animate-pulse" />
                      <span className="mono text-[9px] uppercase font-bold tracking-[0.2em]">Capturing Spectrum</span>
                   </div>
                   <span className="mono text-[11px] text-white/40 font-bold">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                <motion.div 
                   className="h-full bg-brand-accent shadow-[0_0_10px_rgba(245,184,64,0.5)]" 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ ease: "linear" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Failure Phase: Exception Handling */}
        {error && (
          <div className="flex flex-col items-center gap-8 text-white bg-zinc-950/95 p-12 w-full h-full justify-center animate-in fade-in zoom-in-95 backdrop-blur-2xl overflow-y-auto">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert size={40} className="text-red-500 animate-pulse" />
            </div>
            <div className="text-center space-y-3">
               <h4 className="text-3xl font-bold uppercase tracking-tighter">Handshake Failure</h4>
               <p className="mono text-[11px] uppercase font-bold text-red-400 bg-red-400/10 px-4 py-2 rounded border border-red-400/20 max-w-sm mx-auto leading-relaxed">
                 {error}
               </p>
               <p className="text-[10px] text-white/40 uppercase mono tracking-[0.1em] italic">Protocol synchronization terminated abnormally.</p>
            </div>
            
            <div className="w-full max-w-md space-y-4">
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-all text-white/60 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <Terminal size={12} />
                  <span className="mono text-[9px] uppercase font-bold tracking-widest">Diagnostic Logs</span>
                </div>
                {showLogs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              <AnimatePresence>
                {showLogs && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-black/60 border border-white/5 p-4 rounded mono text-[9px] space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                      {logs.map((log, i) => (
                        <div key={i} className={`flex gap-3 ${
                          log.type === 'error' ? 'text-red-400' : 
                          log.type === 'warn' ? 'text-brand-accent' : 
                          'text-white/60'
                        }`}>
                          <span className="opacity-30 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                          <span className="break-all">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={() => { onReset(); }} 
                className="w-full bg-white text-brand-primary py-4 rounded-sm text-[11px] mono font-bold uppercase hover:bg-brand-accent transition-all shadow-xl shadow-white/5"
              >
                Reset Biological Protocol
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Metadata Layer */}
      <div className="absolute top-8 left-8 flex flex-col gap-3 pointer-events-none">
        <div className="mono text-[9px] text-white bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg uppercase flex items-center gap-3 tracking-widest font-bold">
          <div className="w-2 h-2 bg-brand-success rounded-full shadow-[0_0_8px_rgba(61,90,58,0.6)]" />
          Protocol: ACTIVE_SESSION
        </div>
        {hardwareBound && (
          <div className="mono text-[9px] text-brand-primary bg-brand-accent px-4 py-2 rounded-lg uppercase flex items-center gap-3 tracking-widest font-bold shadow-lg shadow-brand-accent/20">
            Hardware Enclave Bound
          </div>
        )}
      </div>

      {/* Grid Overlay for Visual Depth */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 0)', backgroundSize: '32px 32px' }} />
    </div>
  );
};
