# ADR 001: Bio-Telemetry via rPPG (Remote Photoplethysmography)

## Status
Accepted (Institutional Grade)

## Context
Traditional digital identity relies on "what you know" or "what you have." In an AI-saturated environment, both are reproducible. We needed a "who you are" signal that:
1. Requires zero specialized hardware.
2. Is non-custodial (never stores actual biological images).
3. Is non-malleable (cannot be easily spoofed by generative AI).

## Decision
We have chosen **Remote Photoplethysmography (rPPG)** as the primary humanity attestation signal. 

### Implementation Details:
- **Sensor:** Commodity RGB cameras (webcams/mobile).
- **Target:** Sub-perceptual pulse wave patterns detected through skin chroma variance (Green channel, 525nm).
- **Verification:** Temporal drift analysis to distinguish biological heartbeats from synthetic video loops.

## Options Considered
- **3D Depth Mapping:** Rejected as primary due to high variance in commodity hardware quality. (Retained as secondary "Spatial Meta" signal).
- **Voice Biometrics:** Rejected due to extreme vulnerability to LLM-based voice cloning.
- **Physical ID Scans:** Rejected due to massive PII storage liability and poor UX.

## Trade-offs
- **Pros:** Zero-friction UX; No PII storage requirement; High resistance to synthetic video (Generative AI currently lacks temporal micro-vibration accuracy).
- **Cons:** Sensitive to extreme ambient lighting conditions; Requires CPU-intensive real-time signal processing (mitigated via Web Workers/DSP Worker API).
