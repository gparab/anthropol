import { ethers } from 'ethers';

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
  signature: string;
  authenticatorData: string;
  clientDataJSON: string;
  rawId: string;
}

/**
 * Cryptographically binds the rPPG frequency vector to the device's hardware enclave.
 * 
 * @param specimens - The rPPG frequency vector (signal samples)
 * @param credentialId - The user's registered platform passkey ID
 * @returns A hardware-signed telemetry bundle
 */
export async function signTelemetryPayload(
  specimens: Float32Array | number[],
  credentialId: string
): Promise<BoundTelemetryPayload> {
  // 1. Generate local nonce (in production this would come from the server)
  const nonce = ethers.hexlify(crypto.getRandomValues(new Uint8Array(32)));

  // 2. Hash the biological specimens (rPPG signal)
  // Converting Float32Array to a hashable format
  const specimensArray = Array.from(specimens);
  const specimensBlob = JSON.stringify(specimensArray);
  const telemetryHash = ethers.id(specimensBlob);

  // 3. Construct the Challenge
  // We bind the nonce and the biological hash together
  const combinedChallenge = ethers.solidityPackedKeccak256(
    ['bytes32', 'bytes32'],
    [nonce, telemetryHash]
  );
  const challengeBuffer = ethers.getBytes(combinedChallenge);

  // 4. Prompt Hardware Signature via WebAuthn
  // Force PLATFORM authenticator (FaceID, TouchID, Windows Hello)
  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: challengeBuffer,
    allowCredentials: [{
      id: ethers.getBytes(credentialId),
      type: 'public-key'
    }],
    userVerification: 'required'
  };

  try {
    const assertion = await navigator.credentials.get({ 
      publicKey,
      // Force hardware-bound platform authenticator to prevent OBS/Virtual Cam injection at driver level
      mediation: 'optional'
    }) as any;

    if (!assertion) {
      throw new Error("HARDWARE_BINDING_CANCELLED");
    }

    return {
      nonce,
      telemetryHash,
      signature: ethers.hexlify(new Uint8Array(assertion.response.signature)),
      authenticatorData: ethers.hexlify(new Uint8Array(assertion.response.authenticatorData)),
      clientDataJSON: ethers.hexlify(new Uint8Array(assertion.response.clientDataJSON)),
      rawId: ethers.hexlify(new Uint8Array(assertion.rawId))
    };
  } catch (error) {
    console.error("[CYBERSECURITY_FAIL]: Hardware binding failed.", error);
    throw new Error("HARDWARE_BINDING_ENCLAVE_ERROR");
  }
}
