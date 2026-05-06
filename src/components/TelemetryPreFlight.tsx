import React, { useEffect, useRef, useState } from 'react';
import { captureTelemetry } from '../lib/cvHelpers';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TelemetryPreFlightProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStart: () => void;
}

/**
 * TelemetryPreFlight
 * 
 * Implements "Institutional Brutalist" environmental validation.
 * Blocks humanity attestation if lighting or motion is unacceptable.
 */
export const TelemetryPreFlight: React.FC<TelemetryPreFlightProps> = ({ videoRef, onStart }) => {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const consecutiveValidFrames = useRef(0);

  // Environmental Quality Thresholds
  const MIN_LUMINANCE = 40;
  const MAX_LUMINANCE = 240;
  const MOTION_THRESHOLD = 0.4;
  const BACKLIGHT_RATIO = 1.35; // Background cannot be 1.35x brighter than the center (face)

  useEffect(() => {
    let animationFrameId: number;
    let lastCheckTime = 0;

    const checkTelemetry = (time: number) => {
      // Execute CV pipeline at ~10fps (every 100ms)
      if (time - lastCheckTime > 100) {
        lastCheckTime = time;

        if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
            const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                const metrics = captureTelemetry(videoRef.current, canvasRef.current, ctx);
                
                if (metrics) {
                    const currentWarnings: string[] = [];

                    // Evaluate Luminance
                    if (metrics.luminance < MIN_LUMINANCE) {
                        currentWarnings.push("> WARN: Sub-optimal photon count. Increase ambient lighting.");
                    } else if (metrics.luminance > MAX_LUMINANCE) {
                        currentWarnings.push("> WARN: Sensor saturation. Decrease ambient lighting.");
                    }

                    // Evaluate Backlighting (Center must be adequately lit relative to background)
                    if (metrics.backgroundLuminance > metrics.centerLuminance * BACKLIGHT_RATIO && metrics.backgroundLuminance > 100) {
                        currentWarnings.push("> WARN: Subject heavily backlit. Face the light source.");
                    }

                    // Evaluate Motion
                    if (metrics.motion > MOTION_THRESHOLD) {
                        currentWarnings.push("> WARN: Biological signal unstable. Hold still.");
                    }

                    setWarnings(currentWarnings);

                    // Sequence Validation Lock
                    if (currentWarnings.length === 0) {
                        consecutiveValidFrames.current += 1;
                    } else {
                        consecutiveValidFrames.current = 0;
                        if (isReady) setIsReady(false);
                    }

                    // Unlock Gate: 10fps * 2 seconds = 20 consecutive valid frames required
                    if (consecutiveValidFrames.current >= 20 && !isReady) {
                        setIsReady(true);
                    }
                }
            }
        }
      }

      animationFrameId = requestAnimationFrame(checkTelemetry);
    }

    animationFrameId = requestAnimationFrame(checkTelemetry);

    return () => {
      cancelAnimationFrame(animationFrameId);
    }
  }, [videoRef, isReady]);

  return (
    <div className="w-full space-y-4">
        {/* Hidden analytical canvas */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Terminal Feedback Feed */}
        <div className="bg-black/60 backdrop-blur-xl border border-brand-accent/20 rounded-xl p-4 font-mono text-[10px] text-left space-y-2 min-h-[90px] flex flex-col justify-end shadow-xl">
            <AnimatePresence mode="popLayout">
                {warnings.length > 0 ? (
                    warnings.map((warn) => (
                        <motion.div 
                            key={warn} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
                            className="text-[#ff4500] flex items-start gap-2 max-w-full"
                        >
                            <span className="shrink-0 animate-pulse mt-0.5"><AlertTriangle size={12} /></span>
                            <span className="uppercase tracking-tight leading-relaxed break-words">{warn}</span>
                        </motion.div>
                    ))
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="text-brand-success flex items-center gap-2"
                    >
                        <CheckCircle2 size={12} className="shrink-0" />
                        <span className="uppercase tracking-tight">ENVIRONMENT OPTIMAL. READY FOR ATTESTATION.</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Locked Gateway Button */}
        <button
            onClick={onStart}
            disabled={!isReady}
            className={`w-full py-6 transition-all duration-300 rounded-xl mono text-[12px] font-bold uppercase tracking-[0.2em] shadow-2xl ${
                isReady 
                ? 'bg-brand-accent text-brand-primary hover:bg-white hover:scale-[1.02] shadow-brand-accent/30 cursor-pointer' 
                : 'bg-zinc-900 text-white/30 cursor-not-allowed border border-white/5'
            }`}
        >
            {isReady ? 'Initiate Humanity Attestation' : 'Calibrating Sensors...'}
        </button>
    </div>
  );
};
