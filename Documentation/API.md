# API Documentation: v1.0.4

## Authentication
All API requests to regional shards must be authenticated via the Anthropol SDK using a valid **Client Public Key**.

### Security Model:
- **Identity:** `request.auth.uid`
- **Validation:** `isValidId()` and `isValidVerification()` helpers enforced at the database level.
- **Immutable Tags:** `clientId` and `shardId` cannot be modified post-creation.

---

## Core Endpoints (Services API)

### 1. `initializeClientProfile(clientId, name)`
Provisions a new infrastructure node for your organization.
- **Input:** `clientId` (string), `name` (string)
- **Effect:** Creates entry in `clients/` collection with randomized infrastructure keys.

### 2. `logVerification(data, zone)`
Persists a cryptographic verification result to a regional shard.
- **Input:** `VerificationResult` (object), `LegalZone` (string)
- **Constraint:** Must pass ZK-attestation checks.

### 3. `subscribeToClientAnalytics(clientId, callback)`
Real-time stream of network health and verification velocity.
- **Usage:** Used by the Anthropol Dashboard for tactical intelligence.

---

## Webhook Specification
Configure your backend to listen for:
`POST /anthropol/verify`

**Header:** `x-anthropol-signature` (HMAC-SHA256)

**Payload:**
```json
{
  "type": "identity.verified",
  "proofId": "zk_827364...",
  "timestamp": "2026-05-06T01:00Z",
  "data": {
    "livenessScore": 0.998,
    "spatialMatch": true,
    "shard": "US-EAST"
  }
}
```
