# Feature Flags & Release Notes

## 1. Active Feature Flags
Managed via the **Master Oracle Configuration** shard.

- `BLOCK_NON_TPM_CLIENTS`: (Boolean) If true, verifications from devices without a Secure Enclave are rejected.
- `ENHANCED_rPPG_CHROMA`: (Boolean) Enables the v4.2 signal recovery algorithm for low-light environments.
- `REGIONAL_SOVEREIGNTY_ONLY`: (Boolean) Forces all verifications to fail if the user's IP geolocates outside the client's sharded zones.

---

## 2. Release Notes

### v1.0.4 (Current)
- **Core:** Added `Features` matrix and `BusinessCases` dashboard.
- **Identity:** Improved `HumanityOracle` detection of synthetic temporal drift.
- **Docs:** Comprehensive Institutional Documentation Suite release.

### v1.0.0 (Initial Institutional Release)
- **Engine:** First stable release of the Bio-Optic Engine.
- **Crypto:** Stable ZK-SNARK circuit for humanity attestation.
- **Infra:** Support for `US-EAST` and `EU-WEST` sharding.
