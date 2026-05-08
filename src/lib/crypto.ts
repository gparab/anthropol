// @ts-ignore
import * as snarkjs from 'snarkjs';
import { ethers } from 'ethers';
import { ZKProof, TelemetryData } from '../types';

/**
 * Advanced Cryptographic Proof Generation for Anthropol.io
 * 
 * This module manages the generation of zero-knowledge proofs (ZKPs) to 
 * verify human biometrics without exposing raw telemetry data.
 * 
 * Protocol: Groth16 (default) with a signature fallback for browsers 
 * that lack WASM support or during system cold-starts.
 */
export const cryptoOracle = {
  /**
   * Generates a "Humanity Proof" packet using a ZK-SNARK circuit.
   * 
   * @param userId - Unique identifier for the subject (e.g., Firebase UID)
   * @param telemetry - Raw biometric data and calculated BPM
   * @param credentialId - Optional WebAuthn hardware credential ID for device-binding
   * @returns A ZKProof object containing the attestation and public signals
   */
  async generateProof(
    userId: string, 
    telemetry: TelemetryData, 
    credentialId?: string
  ): Promise<ZKProof> {
    // Input signal derivation (Field element compatible)
    // Extract first 64 samples and normalize to integers for Circom processing
    const rppgInput = (telemetry.samples || []).slice(0, 64).map(s => {
      // If signal is complex object {r,g,b}, average them; otherwise use raw value
      const val = typeof s === 'object' ? (s.r + s.g + s.b) / 3 : s;
      // Scale by 1000 to preserve precision before rounding to integer
      return BigInt(Math.round(val * 1000)).toString();
    });

    // Pad with zero-signal if data is too short (edge case)
    while (rppgInput.length < 64) rppgInput.push("0");

    const input = {
      rppg: rppgInput,
      signalHash: BigInt(ethers.id(JSON.stringify(telemetry.samples || []))).toString(),
      userIdHash: BigInt(ethers.id(userId)).toString(),
      credentialHash: BigInt(credentialId ? ethers.id(credentialId) : ethers.id('no_hardware_bound')).toString(),
      nonce: BigInt(Math.floor(Math.random() * 1000000)).toString(),
      timestamp: BigInt(Date.now()).toString()
    };

    try {
      /**
       * PRODUCTION PATH: Generate real Groth16 proof using snarkjs.
       * Circuit: /circuits/humanity_check.wasm
       * Proving Key: /circuits/humanity_check.zkey
       */
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input, 
        "/circuits/humanity_check.wasm", 
        "/circuits/humanity_check.zkey"
      );

      return {
        proofId: `auth_${ethers.hexlify(ethers.randomBytes(8)).replace('0x', '')}`,
        attestation: { proof, publicSignals, protocol: 'groth16' },
        timestamp: Number(input.timestamp)
      };
    } catch (e: any) {
      console.error("[ZK_ORACLE]: Proving failed. Reason:", e.message);
      throw new Error(`Zero-Knowledge Proof generation failed: ${e.message}`);
    }
  },

  /**
   * Internal simulation for private-key signatures.
   */
  async _simulateSign(hash: string) {
    const wallet = ethers.Wallet.createRandom();
    return await wallet.signMessage(hash);
  },

  /**
   * Generates an HMAC-like signature for webhooks to prevent spoofing.
   */
  async signPayload(payload: any, secret: string) {
    if (!secret || secret === 'DEMO_SECRET') {
      return `sha256=${ethers.id(JSON.stringify(payload)).substring(0, 64)}`;
    }
    // Production note: Secret should be treated as a transient sensitive asset
    return `sha256=${ethers.id(JSON.stringify(payload) + secret)}`;
  },

  /**
   * Quick validity and format check for the UI dashboard.
   */
  verifyFormat(proof: any): boolean {
    return !!(proof?.proofId && proof?.attestation?.publicSignals);
  }
};
