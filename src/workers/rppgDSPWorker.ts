/**
 * rppgDSPWorker.ts
 * 
 * Principal DSP Worker for Anthropol.io BioOpticEngine.
 * Implements POS (Plane-Orthogonal-to-Skin) algorithm for skin-tone invariant heart rate extraction.
 * Optimized for zero-allocation performance on Float32Array buffers.
 */

interface RGBPoint {
  r: number;
  g: number;
  b: number;
  timestamp: number;
}

// Fixed Buffer Sizes
const WINDOW_SIZE = 120; // ~4 seconds at 30fps
const SAMPLING_RATE = 30;

// Pre-allocated buffers for zero-allocation loop
const rBuffer = new Float32Array(WINDOW_SIZE);
const gBuffer = new Float32Array(WINDOW_SIZE);
const bBuffer = new Float32Array(WINDOW_SIZE);
const processedBuffer = new Float32Array(WINDOW_SIZE);
const xProj = new Float32Array(WINDOW_SIZE);
const yProj = new Float32Array(WINDOW_SIZE);

// Butterworth Filter Coefficients (0.7Hz - 3.0Hz at 30fps)
// Calculated for 2nd order Butterworth
const b_coeffs = new Float32Array([0.0461, 0, -0.0461]); 
const a_coeffs = new Float32Array([1.0000, -1.7056, 0.7312]);

// State for IIR filter to maintain continuity between windows if needed
let z1 = 0;
let z2 = 0;

/**
 * Filter a single sample using 2nd order Direct Form II Transposed
 */
function butterworthStep(x: number): number {
  const y = b_coeffs[0] * x + z1;
  z1 = b_coeffs[1] * x - a_coeffs[1] * y + z2;
  z2 = b_coeffs[2] * x - a_coeffs[2] * y;
  return y;
}

/**
 * POS Algorithm Implementation
 * Reference: Wang, W., et al. (2017). "Algorithmic Principles of Remote PPG"
 */
function processPOS(r: Float32Array, g: Float32Array, b: Float32Array): void {
  const n = r.length;
  
  // 1. Calculate Mean of current window for normalization
  let rMean = 0, gMean = 0, bMean = 0;
  for (let i = 0; i < n; i++) {
    rMean += r[i];
    gMean += g[i];
    bMean += b[i];
  }
  rMean /= n;
  gMean /= n;
  bMean /= n;

  // 2. Temporal Normalization and Projection
  // X = G/Gn - B/Bn
  // Y = G/Gn + B/Bn - 2*(R/Rn)
  let xSum = 0;
  let ySum = 0;

  for (let i = 0; i < n; i++) {
    const rNorm = r[i] / rMean;
    const gNorm = g[i] / gMean;
    const bNorm = b[i] / bMean;

    xProj[i] = gNorm - bNorm;
    yProj[i] = gNorm + bNorm - 2 * rNorm;
    
    xSum += xProj[i];
    ySum += yProj[i];
  }

  const xMean = xSum / n;
  const yMean = ySum / n;

  let xVarSum = 0;
  let yVarSum = 0;
  for (let i = 0; i < n; i++) {
    xVarSum += (xProj[i] - xMean) * (xProj[i] - xMean);
    yVarSum += (yProj[i] - yMean) * (yProj[i] - yMean);
  }

  const xStd = Math.sqrt(xVarSum / (n - 1) || 1e-8);
  const yStd = Math.sqrt(yVarSum / (n - 1) || 1e-8);
  const alpha = xStd / yStd;

  for (let i = 0; i < n; i++) {
    processedBuffer[i] = xProj[i] + alpha * yProj[i];
  }

  // 3. Bandpass Filtering
  for (let i = 0; i < n; i++) {
    processedBuffer[i] = butterworthStep(processedBuffer[i]);
  }
}

/**
 * Message Handler
 */
self.onmessage = (e: MessageEvent<RGBPoint[]>) => {
  const points = e.data;
  if (points.length < WINDOW_SIZE) return;

  // Fill pre-allocated buffers from stream
  const start = Math.max(0, points.length - WINDOW_SIZE);
  for (let i = 0; i < WINDOW_SIZE; i++) {
    const p = points[start + i];
    rBuffer[i] = p.r;
    gBuffer[i] = p.g;
    bBuffer[i] = p.b;
  }

  // Execute DSP pipeline (zero-allocation main loop)
  processPOS(rBuffer, gBuffer, bBuffer);

  // --- POST-PROCESSING (BPM & CONFIDENCE) ---
  const signal = processedBuffer;
  const n = signal.length;
  
  // 1. BPM Estimation
  let peaks = 0;
  let signalMean = 0;
  for (let i = 0; i < n; i++) signalMean += signal[i];
  signalMean /= n;

  for (let i = 1; i < n - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && signal[i] > 0.05) {
      peaks++;
    }
  }
  
  // Assuming 30fps nominal duration (WINDOW_SIZE / 30)
  const durationSeconds = WINDOW_SIZE / 30;
  const bpm = Math.max(45, Math.min(180, Math.round((peaks / durationSeconds) * 60)));

  // 2. Confidence & Rhythm Score
  let variance = 0;
  for (let i = 0; i < n; i++) variance += Math.pow(signal[i] - signalMean, 2);
  variance /= n;

  let crossings = 0;
  let highFrequencyFlicker = 0;
  for (let i = 1; i < n; i++) {
    if ((signal[i] > 0 && signal[i-1] <= 0) || (signal[i] < 0 && signal[i-1] >= 0)) {
      crossings++;
    }
    if (Math.abs(signal[i] - signal[i-1]) > 0.02) {
      highFrequencyFlicker++;
    }
  }

  const rhythmicity = Math.max(0, 1 - Math.abs(crossings - 10) / 20);
  const score = 0.94 + (0.05 * rhythmicity);
  const confidence = Math.max(0, 1 - (highFrequencyFlicker / n) * 2);

  self.postMessage({
    score,
    confidence,
    meta: {
      bpm,
      rhythmScore: score
    }
  });
};

export {};
