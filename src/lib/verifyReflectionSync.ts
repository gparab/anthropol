import { RGBPoint } from './dsp';
import { ChallengeSequence } from '../hooks/useActiveIllumination';

export interface VerificationResult {
  livenessScore: number;
  reason?: string;
  isPassed: boolean;
}

/**
 * verifyReflectionSync
 * 
 * Validates the correlation between the emitted illumination sequence 
 * and the reflected spectral changes in the camera feed.
 * 
 * Defeats Replay Attacks where a static monitor or pre-recorded video 
 * is used, as the pre-recorded actor will not show the correct 
 * reflection characteristics of the current challenge.
 */
export const verifyReflectionSync = (
  samples: RGBPoint[], 
  sequence: ChallengeSequence
): VerificationResult => {
  if (!samples.length || !sequence) {
    return { livenessScore: 0, isPassed: false, reason: "Insufficient data" };
  }

  const startT = samples[0].timestamp;
  let correlationScore = 0;
  let validSteps = 0;

  sequence.steps.forEach(step => {
    // Find samples captured during this specific challenge step
    const stepSamples = samples.filter(s => {
      const relativeT = s.timestamp - startT;
      return relativeT >= step.startTime && relativeT < (step.startTime + step.duration);
    });

    if (stepSamples.length < 5) return;

    // Calculate mean RGB shift during the step
    const rMean = stepSamples.reduce((acc, s) => acc + s.r, 0) / stepSamples.length;
    const gMean = stepSamples.reduce((acc, s) => acc + s.g, 0) / stepSamples.length;
    const bMean = stepSamples.reduce((acc, s) => acc + s.b, 0) / stepSamples.length;

    // Simplified spectral matching
    // If the emitted light was Cyan (B+G), we expect shifts in G and B channels
    const hex = step.color.replace('#', '');
    const targetR = parseInt(hex.substring(0, 2), 16) / 255;
    const targetG = parseInt(hex.substring(2, 4), 16) / 255;
    const targetB = parseInt(hex.substring(4, 6), 16) / 255;

    // Check if the dominant reflection channel matches the target color's spectral peak
    const dominantChannel = Math.max(targetR, targetG, targetB);
    const observedDominant = Math.max(rMean, gMean, bMean);

    // This is a simplified heuristic for the prototype
    // In a production system, this would use cross-correlation in the frequency domain
    if (dominantChannel === targetR && rMean > gMean && rMean > bMean) correlationScore++;
    else if (dominantChannel === targetG && gMean > rMean && gMean > bMean) correlationScore++;
    else if (dominantChannel === targetB && bMean > rMean && bMean > gMean) correlationScore++;
    
    validSteps++;
  });

  const finalScore = validSteps > 0 ? correlationScore / validSteps : 0;
  
  return {
    livenessScore: finalScore,
    isPassed: finalScore > 0.6,
    reason: finalScore > 0.6 ? "Spectral sync confirmed" : "Illumination reflection mismatch (Possible Replay Attack)"
  };
};
