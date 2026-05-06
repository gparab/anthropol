import { RGBPoint } from './dsp';
import { ChallengeSequence } from '../hooks/useActiveIllumination';

export interface VerificationResult {
  livenessScore: number;
  reason?: string;
  isPassed: boolean;
}

/**
 * Computes the Discrete Fourier Transform (DFT) for a real signal.
 */
function computeDFT(signal: number[]) {
  const N = signal.length;
  const real = new Float32Array(N);
  const imag = new Float32Array(N);
  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real[k] += signal[n] * Math.cos(angle);
      imag[k] -= signal[n] * Math.sin(angle);
    }
  }
  return { real, imag };
}

/**
 * Computes the zero-lag cross-correlation in the frequency domain using the Cross-Power Spectrum.
 */
function frequencyDomainCrossCorrelation(observed: number[], expected: number[]): number {
  const N = Math.min(observed.length, expected.length);
  if (N === 0) return 0;

  // Detrend
  const meanObs = observed.reduce((a, b) => a + b, 0) / N;
  const meanExp = expected.reduce((a, b) => a + b, 0) / N;
  
  const obsDetrended = observed.slice(0, N).map(v => v - meanObs);
  const expDetrended = expected.slice(0, N).map(v => v - meanExp);
  
  const X = computeDFT(obsDetrended);
  const Y = computeDFT(expDetrended);
  
  let crossPowerRealSum = 0;
  let powerX = 0;
  let powerY = 0;
  
  for (let k = 0; k < N; k++) {
    // S_xy = X(k) * conj(Y(k))
    const realPart = X.real[k] * Y.real[k] + X.imag[k] * Y.imag[k];
    crossPowerRealSum += realPart;
    
    powerX += X.real[k] * X.real[k] + X.imag[k] * X.imag[k];
    powerY += Y.real[k] * Y.real[k] + Y.imag[k] * Y.imag[k];
  }
  
  if (powerX === 0 || powerY === 0) return 0;
  return crossPowerRealSum / Math.sqrt(powerX * powerY);
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
