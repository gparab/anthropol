import { useState, useEffect, useCallback, useRef } from 'react';
import { cryptoOracle } from '../lib/crypto';

export interface IlluminationStep {
  color: string;
  duration: number;
  startTime: number;
}

export interface ChallengeSequence {
  id: string;
  steps: IlluminationStep[];
  totalDuration: number;
}

/**
 * useActiveIllumination
 * 
 * Generates and manages a randomized sequence of sub-perceptual color flashes 
 * used to detect biometric replay attacks via ambient light reflection analysis.
 */
export const useActiveIllumination = (isActive: boolean) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [sequence, setSequence] = useState<ChallengeSequence | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateSequence = useCallback(() => {
    const stepCount = 3 + Math.floor(Math.random() * 3); // 3-5 steps
    const steps: IlluminationStep[] = [];
    let totalDuration = 0;

    // Sub-perceptual colors targeting specific sensor response bands
    const palette = [
      '#00FFFF', // Cyan (Blue/Green peak)
      '#FFD700', // Gold (Red/Green peak)
      '#FF00FF', // Magenta (Red/Blue peak)
      '#7FFF00', // Chartreuse (Green peak)
      '#FF4500'  // OrangeRed (Red peak)
    ];

    for (let i = 0; i < stepCount; i++) {
      const duration = 800 + Math.floor(Math.random() * 1200); // 800-2000ms
      steps.push({
        color: palette[Math.floor(Math.random() * palette.length)],
        duration,
        startTime: totalDuration
      });
      totalDuration += duration;
    }

    return {
      id: crypto.randomUUID(),
      steps,
      totalDuration
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      const newSequence = generateSequence();
      setSequence(newSequence);
      setCurrentStepIndex(0);

      let index = 0;
      const runStep = () => {
        if (index < newSequence.steps.length - 1) {
          timeoutRef.current = setTimeout(() => {
            index++;
            setCurrentStepIndex(index);
            runStep();
          }, newSequence.steps[index].duration);
        } else {
          timeoutRef.current = setTimeout(() => {
            setCurrentStepIndex(-1);
          }, newSequence.steps[index].duration);
        }
      };

      runStep();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setCurrentStepIndex(-1);
      setSequence(null);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isActive, generateSequence]);

  return {
    currentStep: currentStepIndex >= 0 && sequence ? sequence.steps[currentStepIndex] : null,
    sequence,
    isComplete: sequence && currentStepIndex === -1
  };
};
