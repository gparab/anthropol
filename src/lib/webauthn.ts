import { startRegistration } from '@simplewebauthn/browser';
import { auth } from './firebase';

/**
 * Anthropol.io WebAuthn / Passkey Service
 * 
 * Binds non-repudiable ZK-Proofs to physical hardware Enclaves (TPM/Secure Enclave).
 * Implements FIDO2 compliant hardware attestation for identity binding.
 */
export const webAuthnService = {
  /**
   * Generates a hardware-bound credential for the user.
   */
  async registerPasskey(userId: string): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('AUTH_REQUIRED');

      const token = await user.getIdToken();
      
      // 1. Fetch registration options from server
      const optionsRes = await fetch('/api/auth/register/options', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const options = await optionsRes.json();

      if (options.error) throw new Error(options.error);

      // 2. Start WebAuthn registration
      const regResponse = await startRegistration(options);

      // 3. Verify on server
      const verifyRes = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(regResponse)
      });

      const verification = await verifyRes.json();

      if (verification.verified) {
        return regResponse.id;
      } else {
        throw new Error('VERIFICATION_FAILED');
      }
    } catch (e: any) {
      console.error("[WEBAUTHN]: Hardware registration failure.", e);
      throw new Error(`HARDWARE_ENCLAVE_REGISTRATION_ERROR: ${e.message}`);
    }
  },

  /**
   * [LEGACY/UNUSED]: signVerification is now handled by signTelemetryPayload in HardwareBindingService
   */
  async signVerification(_challenge: string, _credentialId: string): Promise<string> {
    throw new Error("DEPRECATED: Use HardwareBindingService for signed telemetry.");
  }
};
