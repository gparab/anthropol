# System Architecture: The Anthropol Mesh

## 1. High-Level Overview
Anthropol.io is a distributed identity oracle designed to verify biological humanity. It consists of three primary layers:

### A. The Bio-Optic Engine (Edge Layer)
- **Runtime:** Client-side (Browser/SDK).
- **Function:** Real-time rPPG signal extraction and 3D spatial attestation.
- **Privacy:** Converts raw video frames into mathematical frequency vectors before leaving the client.

### B. The Master Oracle (Inference Layer)
- **Runtime:** Anthropol Global Shards.
- **Function:** Validates the frequency vectors against biological normality models.
- **ZK-Logic:** Generates a Zero-Knowledge Proof of Humanity (PoH) hash.

### C. The Regional Shards (Persistence Layer)
- **Infrastructure:** Multi-region Firestore clusters (US-EAST, EU-WEST, etc.).
- **Function:** Stores verification metadata (not PII) and regional client usage quotas.
- **Sovereignty:** Ensures data never leaves the regulatory jurisdiction of the originating node.

## 2. Data Flow (Authentication Scenario)
1. **Request:** Client App requests a `HumanitySignature`.
2. **Telemetry:** `BioOpticEngine` starts a 5-second capture session.
3. **Signal Recovery:** DSP Worker isolates the Green-channel pulsatile signal.
4. **Transmission:** Signed frequency vectors sent to `verificationService`.
5. **Inference:** Server-side Oracle verifies signal authenticity.
6. **Persistence:** Result logged to Regional Shard.
7. **Webhook:** Signed payload dispatched to Client's endpoint.

## 3. Technology Stack
- **Frontend:** React, Tailwind CSS, Motion (Animations).
- **Signal Processing:** Custom DSP implementation (JS/TS Web Workers).
- **Backend/Database:** Google Firebase (Auth, Firestore).
- **Cryptography:** ZK-SNARK circuit logic for humanity attestation.
