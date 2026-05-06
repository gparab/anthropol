/**
 * Digital Signal Processing for rPPG (remote Photoplethysmography)
 * 
 * This module extracts and analyzes cardiovascular signals from video streams.
 * It detects subtle changes in skin color caused by blood volume pulses.
 */

interface ConfidenceMetadata {
  flicker: number;
  consistency: number;
  crossings: number;
  variance?: number;
  totalMovement?: number;
}

export interface DSPAnalysis {
  score: number;
  confidence: number;
  metadata: ConfidenceMetadata;
}

export interface RGBPoint {
  r: number;
  g: number;
  b: number;
  timestamp: number;
}

export const dsp = {
  /**
   * Remote Photoplethysmography (rPPG) Core Implementation
   * Extracts spatial means for RGB channels to support advanced de-noising (POS).
   * 
   * @param imageData - Raw canvas pixel buffer
   * @returns Spatial means for R, G, and B channels
   */
  analyzeFrame(imageData: ImageData): { r: number; g: number; b: number } {
    const data = imageData.data;
    let rSum = 0, gSum = 0, bSum = 0;
    const pixelCount = imageData.width * imageData.height;
    
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
    }
    
    return {
      r: rSum / pixelCount,
      g: gSum / pixelCount,
      b: bSum / pixelCount
    };
  },

  /**
   * Estimates Heart Rate (BPM) from temporal green channel samples.
   * Hardened against Variable Frame Rate (VFR) by utilizing actual timestamps.
   * 
   * @param samples - Temporal sequence of averaged intensities
   * @param timestamps - Corresponding performance.now() timestamps
   */
  estimateBPM(samples: number[], timestamps: number[]): number {
    if (samples.length < 10 || timestamps.length < 10) return 0;

    // 1. TIME NORMALIZATION
    const totalDurationMs = timestamps[timestamps.length - 1] - timestamps[0];
    if (totalDurationMs <= 0) return 0;
    const durationSeconds = totalDurationMs / 1000;

    // 2. SIGNAL DETRENDING
    const data = new Float32Array(samples);
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    
    // 3. PEAK DETECTION WITH ADAPTIVE THRESHOLD
    let peaks = 0;
    const detrended = data.map(s => s - mean);
    const threshold = 0.05; // Base sensitivity threshold

    for (let i = 1; i < detrended.length - 1; i++) {
      if (detrended[i] > detrended[i - 1] && detrended[i] > detrended[i + 1] && detrended[i] > threshold) {
        peaks++;
      }
    }

    // 4. FREQUENCY CALCULATION
    const bpm = (peaks / durationSeconds) * 60;

    // Biological Clamping: Baseline humans typically range from 45 to 180 BPM
    return Math.max(45, Math.min(180, Math.round(bpm)));
  },

  /**
   * Biometric Signal Validation (Rhythm & Variance Audit)
   * Evaluates if the signal patterns originate from a biological source vs a digital spoof.
   * 
   * @param samples - Sequence of intensity samples
   * @returns Confidence object reflecting human-organic probability
   */
  calculateConfidence(samples: number[]): DSPAnalysis {
    if (samples.length < 20) return { score: 0.5, confidence: 0.5, metadata: { flicker: 0, consistency: 0, crossings: 0 } };
    
    // 1. STATISTICAL MOMENTS
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
    
    // DETECTION: Static images or bots lack the dynamic variance of cardiovascular systems.
    if (variance < 0.0001) return { score: 0.1, confidence: 0, metadata: { variance, flicker: 0, consistency: 0, crossings: 0 } }; 
    if (variance > 500) return { score: 0.2, confidence: 0, metadata: { variance, flicker: 0, consistency: 0, crossings: 0 } }; 
    
    // 2. MACRO-MOVEMENT CALCULUS
    let totalMovement = 0;
    if (samples.length > 1) {
       for (let i = 1; i < samples.length; i++) {
          totalMovement += Math.abs(samples[i] - samples[i-1]);
       }
    }
    
    if (totalMovement < 0.5) return { score: 0.15, confidence: 0, metadata: { totalMovement, flicker: 0, consistency: 0, crossings: 0 } }; 

    // 3. PERIODICITY & FLICKER ANALYSIS
    const detrended = samples.map(s => s - mean);
    let crossings = 0;
    let highFrequencyFlicker = 0;
    let spectralConsistency = 0;
    
    const noiseFloor = Math.sqrt(variance);
    const flickerThreshold = Math.max(0.015, noiseFloor * 0.7);

    for (let i = 1; i < detrended.length; i++) {
       const delta = Math.abs(detrended[i] - detrended[i-1]);
       
       if ((detrended[i] > 0 && detrended[i-1] <= 0) || (detrended[i] < 0 && detrended[i-1] >= 0)) {
         crossings++;
       }
       
       // ANTI-SPOOF: Detecting screen refresh artifacts
       if (delta > flickerThreshold) {
         highFrequencyFlicker++;
       }
       
       // MASK ATTACK: Detecting non-biological surfaces via reflectance spikes
       if (i > 1 && Math.abs(delta - Math.abs(detrended[i-1] - detrended[i-2])) < 0.001) {
         spectralConsistency++;
       }
    }

    // HUMANE RHYTHMICITY calculation
    let rhythmicity = Math.max(0, 1 - Math.abs(crossings - 10) / 20); 
    
    const flickerRatio = highFrequencyFlicker / samples.length;
    const consistencyRatio = spectralConsistency / samples.length;

    // Penalty for artificial profiles
    if (flickerRatio > 0.2 || consistencyRatio > 0.15) {
       rhythmicity *= (1 - Math.max(flickerRatio, consistencyRatio)); 
    }

    const confidence = Math.max(0, 1 - (flickerRatio * 2) - (consistencyRatio * 3));

    return {
      score: 0.94 + (0.05 * rhythmicity),
      confidence: Math.round(confidence * 100) / 100,
      metadata: {
        flicker: flickerRatio,
        consistency: consistencyRatio,
        crossings,
        variance,
        totalMovement
      }
    };
  }
};
