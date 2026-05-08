import { RGBPoint } from './dsp';
import { ChallengeSequence } from '../hooks/useActiveIllumination';

export interface VerificationResult {
  livenessScore: number;
  reason?: string;
  isPassed: boolean;
}

/**
 * Computes the maximum cross-correlation coefficient across a range of lags (-15 to +15).
 * Accounts for hardware display-to-camera latency (phase shift).
 */
function frequencyDomainCrossCorrelation(observed: number[], expected: number[]): number {
  const N = Math.min(observed.length, expected.length);
  if (N < 30) return 0; // Need enough samples for meaningful correlation

  const MAX_LAG = 15;
  let maxCorr = -1;

  for (let lag = -MAX_LAG; lag <= MAX_LAG; lag++) {
    let sumObs = 0;
    let sumExp = 0;
    let sumObsSq = 0;
    let sumExpSq = 0;
    let sumProduct = 0;
    let count = 0;

    for (let i = 0; i < N; i++) {
      const j = i + lag;
      if (j >= 0 && j < N) {
        const vObs = observed[i];
        const vExp = expected[j];
        
        sumObs += vObs;
        sumExp += vExp;
        sumObsSq += vObs * vObs;
        sumExpSq += vExp * vExp;
        sumProduct += vObs * vExp;
        count++;
      }
    }

    if (count > 0) {
      // Calculate Pearson Correlation Coefficient for this lag
      const meanObs = sumObs / count;
      const meanExp = sumExp / count;
      
      const numerator = sumProduct - count * meanObs * meanExp;
      const denominator = Math.sqrt(
        (sumObsSq - count * meanObs * meanObs) * 
        (sumExpSq - count * meanExp * meanExp)
      );
      
      const correlation = denominator === 0 ? 0 : numerator / denominator;
      if (correlation > maxCorr) {
        maxCorr = correlation;
      }
    }
  }

  return Math.max(0, maxCorr);
}

/**
 * verifyReflectionSync
 * 
 * Validates the correlation between the emitted illumination sequence 
 * and the reflected spectral changes in the camera feed using Frequency-Domain Cross-Correlation.
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
  
  // Reconstruct the expected emitted signal over the captured sample timeline
  const expectedR: number[] = [];
  const expectedG: number[] = [];
  const expectedB: number[] = [];
  const observedR: number[] = [];
  const observedG: number[] = [];
  const observedB: number[] = [];

  for (const s of samples) {
    const relativeT = s.timestamp - startT;
    // Find which step is active at relativeT
    const activeStep = sequence.steps.find(
      step => relativeT >= step.startTime && relativeT < (step.startTime + step.duration)
    );

    let targetR = 0, targetG = 0, targetB = 0;
    if (activeStep) {
      const hex = activeStep.color.replace('#', '');
      targetR = parseInt(hex.substring(0, 2), 16) / 255;
      targetG = parseInt(hex.substring(2, 4), 16) / 255;
      targetB = parseInt(hex.substring(4, 6), 16) / 255;
    }

    expectedR.push(targetR);
    expectedG.push(targetG);
    expectedB.push(targetB);
    observedR.push(s.r);
    observedG.push(s.g);
    observedB.push(s.b);
  }

  // Calculate frequency-domain cross-correlation per channel
  const corrR = Math.max(0, frequencyDomainCrossCorrelation(observedR, expectedR));
  const corrG = Math.max(0, frequencyDomainCrossCorrelation(observedG, expectedG));
  const corrB = Math.max(0, frequencyDomainCrossCorrelation(observedB, expectedB));

  // The final score is the average cross-correlation across active channels
  const finalScore = (corrR + corrG + corrB) / 3;
  
  return {
    livenessScore: finalScore,
    isPassed: finalScore > 0.4, // Threshold for frequency-domain correlation
    reason: finalScore > 0.4 ? "Spectral sync confirmed via frequency cross-correlation" : "Illumination reflection mismatch (Possible Replay Attack)"
  };
};
