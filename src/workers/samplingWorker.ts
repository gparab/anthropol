import { dsp } from '../lib/dsp';

/**
 * samplingWorker.ts
 * 
 * Handles high-frequency pixel extraction and RGB averaging in a background thread.
 * Prevents OS/Browser UI stuttering during the 30Hz biometric sampling phase.
 */

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    const { width, height } = payload;
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  } else if (type === 'SAMPLE') {
    if (!ctx || !canvas) return;

    const { bitmap, timestamp } = payload;
    
    // Draw the full frame to the internal offscreen buffer
    ctx.drawImage(bitmap, 0, 0);
    
    // Crucial: Release the bitmap memory as soon as possible
    bitmap.close();

    // Extract the central region of interest (ROI)
    // We sample a 50x50 patch from the center of the frame
    const roiSize = 50;
    const x = Math.floor(canvas.width / 2 - roiSize / 2);
    const y = Math.floor(canvas.height / 2 - roiSize / 2);
    
    const imageData = ctx.getImageData(x, y, roiSize, roiSize);
    
    // Perform DSP averaging
    const { r, g, b } = dsp.analyzeFrame(imageData);
    
    // Send result back to main thread
    self.postMessage({
      type: 'RESULT',
      payload: { r, g, b, timestamp }
    });
  }
};
