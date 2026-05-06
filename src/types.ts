/**
 * Core User profile for Anthropol.io
 */
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'developer';
  tier?: 'standard' | 'enterprise';
}

/**
 * Biometric telemetry data from DSP analysis
 */
export interface TelemetryData {
  samples: number[] | any[];
  bpm: number;
  rhythmScore?: number;
  hardwareBinding?: {
    nonce: string;
    telemetryHash: string;
    signature: string;
    authenticatorData: string;
    clientDataJSON: string;
  };
}

/**
 * Cryptographic proof structure
 */
export interface ZKProof {
  proofId: string;
  attestation: {
    proof: any;
    publicSignals: string[];
    protocol?: 'signature-fallback' | 'groth16';
    signature?: string;
  };
  timestamp: number;
}

/**
 * Result of a successful verification session
 */
export interface VerificationResult {
  status: 'passed' | 'failed';
  score: number;
  confidence: number;
  signals: {
    texture: string;
    biological: string;
    liveness: string;
    bpm: number;
    telemetry: {
      samples: number[] | any[];
      rhythmScore: number;
    };
  };
  proofId: string;
  attestation: string; // JSON string of ZKProof.attestation
  clientId: string;
  failover: boolean;
}

/**
 * Application view routing states
 */
export enum AppView {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  VERIFICATION_DEMO = 'verification_demo',
  DEVELOPER_ASSETS = 'developer_assets',
  ADMIN = 'admin',
  PRICING = 'pricing',
  ANALYTICS = 'analytics',
  WHITEPAPER = 'whitepaper',
  FEATURES = 'features',
  BUSINESS_CASES = 'business_cases',
  PRODUCT = 'product',
  DEVELOPER_EXPERIENCE = 'developer_experience',
  AUTH = 'auth',
  PROFILE = 'profile'
}

/**
 * Regional data sovereignty zones
 */
export type LegalZone = 'US-EAST' | 'EU-WEST' | 'APAC' | 'LATAM';
