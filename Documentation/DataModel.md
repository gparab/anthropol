# Database Schema & Data Model

## 1. Overview
Anthropol utilizes a **Partitioned Regional Document Store** (Google Firestore) for high-availability and regulatory compliance.

## 2. Collections & Schema

### A. `clients/{clientId}`
The root identity of a business customer/node.
- `name`: (string) Organization Name.
- `tier`: (enum) `PRO`, `ENTERPRISE`, `INSTITUTIONAL`.
- `publicKey`: (string) Public shard identifier.
- `secretKey`: (string) HMAC-SHA256 secret for webhooks (server-side only).
- `shards`: (array) List of active regional shards.
- `quota`: (object) `{ daily: number, limit: number }`.

### B. `verifications/{verificationId}`
Chronological log of humanity attestations.
- **Partitioning:** Sharded by `shardId` (e.g., `US-EAST`, `EU-WEST`).
- `clientId`: (string) Reference to owner.
- `status`: (enum) `VERIFIED`, `FAILED`, `PENDING_ZK`.
- `livenessHash`: (string) Non-custodial 256-bit frequency hash.
- `spatialMeta`: (object) `{ depthCheck: boolean, hardwareId: string }`.
- `timestamp`: (serverTimestamp) Atomic clock reference.
- `revoked`: (boolean) Flag for hardware-enclave compromise.

## 3. Relationships
- **1-to-Many:** One `client` owns many `verifications`.
- **Relational Integrity:** Every verification must be initialized against a valid `clientId` existing in the shard registry.

## 4. Multi-Tenant Partitioning
Security rules (`firestore.rules`) enforce that:
1. Clients can only `read` their own verification logs.
2. Verified signals can only `write` a new log entry.
3. Database `list` queries must include a `where('clientId', '==', auth.uid)` clause to be valid.
