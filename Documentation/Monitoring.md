# Monitoring & Logging

## 1. Infrastructure Telemetry
Anthropol utilizes a multi-tier monitoring strategy to ensure 99.998% availability.

### Tier 1: Real-time Analytics (Dashboard)
- **Source:** `subscribeToClientAnalytics()` service.
- **Visibility:** Real-time throughput, success rate, and shard latency.

### Tier 2: System Logs (GCP Cloud Logging)
- All database exceptions are logged via the `[CORE]: Database exception detected` mask in `services.ts`.
- Formatted as machine-readable JSON for ingestion into Datadog/Splunk.

## 3. Key Performance Indicators (KPIs)

| Metric | Target | Alert Threshold |
| :--- | :--- | :--- |
| **Inference Latency** | < 1.2ms | > 5.0ms |
| **ZK-Proof Gen Time** | < 1.0s | > 3.0s |
| **Success Rate** | > 92% | < 80% (System check) |
| **Shard Drift** | < 100ms | > 500ms |

## 4. Log Interpretation
A standard error log includes the following metadata:
```json
{
  "error": "Missing or insufficient permissions.",
  "operationType": "update",
  "path": "verifications/...",
  "authInfo": {
    "userId": "client_abc_123",
    "emailVerified": true
  }
}
```
**Diagnostic Step:** If `emailVerified` is `false`, the client hasn't completed the Institutional Onboarding protocol.
