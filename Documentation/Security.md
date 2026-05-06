# Security & Compliance: Institutional Integrity

## 1. Zero-Knowledge Identity
Anthropol.io is designed on the principle of **Zero PII Exposure**. 
- **Encryption in Transit:** All telemetry data is transmitted via TLS 1.3.
- **Non-Custodial Logic:** We do not store faces or biometrics. We store the *result* of the biological pulse analysis as a 256-bit hash.

## 2. Role-Based Access Control (RBAC)
Database access is governed by the "Master Gate" pattern in Firestore:
- **Owner:** Full access to their own `client/` profile and associated `verifications/`.
- **System:** Permission to write to the `verifications/` log upon successful ZK-proof.
- **Admin:** Infrastructure monitoring across all shards (no PII access).

## 3. Regulatory Compliance
### GDPR / EU-WEST
- **Sovereignty:** EU-based verifications are routed to the `EU-WEST` shard.
- **Right to Erasure:** Automated TTL (Time To Live) policies on verification logs ensure data is purged post-attestation unless explicitly retained by the client.

### AICPA / SOC 2
- **Audit Logs:** Every modification to client infrastructure keys is logged in a secure, immutable audit trail.
- **Availability:** 99.998% uptime guaranteed by distributed hardware shards.

## 4. Hardware Hardening
- **TPM Binding:** Verifications are tied to the hardware "Secure Enclave" to prevent virtualized robot attacks.
- **Rate Limiting:** IP-level and client-level rate limiting prevents "Denial of Wallet" resource exhaustion.
