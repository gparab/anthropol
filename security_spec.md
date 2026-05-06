# Security Specification - anthropol.io

## Data Invariants
1. **Identity Isolation**: A user (Client) can only access their own profile, verifications, and webhook logs.
2. **Path Integrity**: Every verification must be linked to a valid `clientId` that matches the authenticated user.
3. **Immutable Audits**: Verification records and webhook logs are immutable once created.
4. **Global Visibility**: Aggregated system metrics are read-only for authenticated users.
5. **Admin Override**: The system administrator (`parabgautam@gmail.com`) has full read/write access for support and maintenance.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

| ID | Goal | Target Collection | Payload | Predicted Result |
|----|----|----|----|----|
| 1 | Profile Spoofing | `clients/other_uid` | `{ "name": "Hacker Corp" }` | PERMISSION_DENIED |
| 2 | Privilege Escalation | `clients/my_uid` | `{ "tier": "enterprise", "usage": { "limit": 999999 } }` | PERMISSION_DENIED (Unless upgrade action) |
| 3 | Identity Theft | `verifications/new_id` | `{ "clientId": "victim_uid", "status": "passed" }` | PERMISSION_DENIED |
| 4 | Verification Injection | `verifications/new_id` | `{ "clientId": "my_uid", "status": "passed", "score": 100 }` (Invalid types) | PERMISSION_DENIED |
| 5 | ID Poisoning | `clients/...lots of junk...` | `{ "name": "Junk" }` | PERMISSION_DENIED (isValidId fails) |
| 6 | Ghost Field Write | `verifications/new_id` | `{ "clientId": "my_uid", "status": "passed", "score": 100, "isVerified": true }` | PERMISSION_DENIED (hasOnly fails) |
| 7 | Resource Exhaustion | `verifications/new_id` | `{ "clientId": "my_uid", "rawSamples": [ ... 1MB of data ... ] }` | PERMISSION_DENIED (size check) |
| 8 | Unauthorized List | `verifications` | Querying `clientId == victim_uid` | PERMISSION_DENIED (rule-side enforce) |
| 9 | Metadata Erasure | `clients/my_uid` | `{ "createdAt": "2000-01-01T00:00:00Z" }` | PERMISSION_DENIED (Immutability check) |
| 10 | Global Stat Sabotage | `system/global` | `{ "totalVerifications": 0 }` | PERMISSION_DENIED |
| 11 | Webhook Log Scraping | `webhook_logs` | Querying without `clientId` filter | PERMISSION_DENIED |
| 12 | Failover Injection | `verifications_recovery/id` | `{ "clientId": "victim_uid" }` | PERMISSION_DENIED |

## Admin User
- Email: `parabgautam@gmail.com`
