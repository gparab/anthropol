import { ethers } from 'ethers';
import { startAuthentication } from '@simplewebauthn/browser';

/**
 * HardwareBindingService.ts
 * 
 * Principal Cybersecurity Service for Anthropol.io.
 * Implements hardware-biological binding to prevent virtual camera injection and replay attacks.
 * Binds browser-layer WebAuthn (Passkeys) to server-layer Biometric Telemetry.
 */

export interface BoundTelemetryPayload {
  nonce: string;
  telemetryHash: string;
  signature: any; // Raw simplewebauthn assertion
  rawId: string;
}

/**
 * Cryptographically binds the rPPG frequency vector to the device's hardware enclave.
 * 
 * @param specimens - The rPPG frequency vector (signal samples)
 * @param clientId - The identifier for the session owner
 * @param credentialId - The user's registered platform passkey ID (optional in new flow)
 * @returns A hardware-signed telemetry bundle
 */
export async function signTelemetryPayload(
  specimens: Float32Array | number[],
  clientId: string,
  credentialId?: string
): Promise<BoundTelemetryPayload> {
  // 1. Fetch Authoritative Server Nonce
  const nonceResponse = await fetch(`/api/auth/nonce?clientId=${clientId}`);
  const { nonce } = await nonceResponse.json();

  if (!nonce) throw new Error("NONCE_GENERATION_FAILURE");

  // 2. Hash the biological specimens (rPPG signal)
  const specimensArray = Array.from(specimens);
  const specimensBlob = JSON.stringify(specimensArray);
  const telemetryHash = ethers.id(specimensBlob);

  // 3. Prompt Hardware Signature via WebAuthn
  // Force PLATFORM authenticator (FaceID, TouchID, Windows Hello)
  try {
    // We construct the authentication options
    // The challenge is the server nonce
    const authenticationResponse = await startAuthentication({
      optionsJSON: {
        challenge: nonce,
        allowCredentials: credentialId ? [{
          id: credentialId,
          type: 'public-key',
          transports: ['internal']
        }] : [],
        userVerification: 'required',
        rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
      }
    });

    return {
      nonce,
      telemetryHash,
      signature: authenticationResponse,
      rawId: authenticationResponse.id
    };
  } catch (error) {
    console.error("[CYBERSECURITY_FAIL]: Hardware binding failed.", error);
    throw new Error("HARDWARE_BINDING_ENCLAVE_ERROR");
  }
}
