import { motion, AnimatePresence } from 'framer-motion';
import { IlluminationStep } from '../hooks/useActiveIllumination';

interface IlluminationOverlayProps {
  step: IlluminationStep | null;
}

/**
 * IlluminationOverlay
 * 
 * Renders sub-perceptual color pulses over the camera viewport.
 * Uses mix-blend-mode: soft-light to influence the subject's face 
 * without causing visual discomfort or triggering photosensitivity.
 */
export const IlluminationOverlay = ({ step }: IlluminationOverlayProps) => {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-[inherit]">
      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={step.color + step.startTime}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }} // 12% opacity for sub-perceptual but detectable spectral shift
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: "easeInOut" 
            }}
            style={{ 
              backgroundColor: step.color,
              mixBlendMode: 'soft-light' 
            }}
            className="absolute inset-0"
          />
        )}
      </AnimatePresence>
      
      {/* High-frequency jitter guard to prevent screen-recorded replay sync */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};
