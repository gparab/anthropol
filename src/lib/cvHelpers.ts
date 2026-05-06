/**
 * cvHelpers.ts
 * Core computer vision helpers for environmental telemetry
 */

export interface TelemetryMetrics {
  luminance: number; // 0 to 255
  backgroundLuminance: number;
  centerLuminance: number;
  motion: number; // 0 to 1 scale
}

// Keep a reference to the previous frame to calculate frame-difference motion
let prevFrame: Uint8ClampedArray | null = null;

export const captureTelemetry = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): TelemetryMetrics | null => {
  if (video.videoWidth === 0 || video.videoHeight === 0) return null;

  // Downsample heavily for fast real-time analysis (10fps target)
  const targetWidth = 64;
  const targetHeight = 64;

  if (canvas.width !== targetWidth) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;

  let totalLuminance = 0;
  let centerLuminance = 0;
  let bgLuminance = 0;
  let centerPixels = 0;
  let bgPixels = 0;
  let motionScore = 0;

  const centerX = targetWidth / 2;
  const centerY = targetHeight / 2;
  const radiusSq = (targetWidth / 4) * (targetHeight / 4); // Inner 50% diameter represents the face

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Perceived relative luminance
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    totalLuminance += lum;

    const pixelIndex = i / 4;
    const x = pixelIndex % targetWidth;
    const y = Math.floor(pixelIndex / targetWidth);

    const distSq = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
    if (distSq < radiusSq) {
      centerLuminance += lum;
      centerPixels++;
    } else {
      bgLuminance += lum;
      bgPixels++;
    }

    if (prevFrame) {
        const prevLum = 0.2126 * prevFrame[i] + 0.7152 * prevFrame[i+1] + 0.0722 * prevFrame[i+2];
        motionScore += Math.abs(lum - prevLum);
    }
  }

  const numPixels = targetWidth * targetHeight;
  
  // Normalize motion score
  // If every pixel changed by 255, it would be 1.0. We scale it up (x10) because normal motion is subtle
  const normalizedMotion = (motionScore / (numPixels * 255)) * 10;

  // Stash current frame for next iteration
  prevFrame = new Uint8ClampedArray(data);

  return {
    luminance: totalLuminance / numPixels,
    centerLuminance: centerPixels > 0 ? centerLuminance / centerPixels : 0,
    backgroundLuminance: bgPixels > 0 ? bgLuminance / bgPixels : 0,
    motion: normalizedMotion
  };
};
