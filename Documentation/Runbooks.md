# Runbook: 2 AM Troubleshooting Guide

## 1. System Health Checklist
Before manual intervention, check the **Anthropol Analytics Hub**:
- **Verification Velocity:** If 0, check the `verificationService` connection.
- **Success Rate:** If < 80%, investigate ambient lighting alerts in the bio-telemetry logs.

## 2. Common Scenarios

### A. "Quota Exceeded" (403)
- **Cause:** Client node has hit its daily tier limit for verified identities.
- **Resolution:** 
  1. Login to **Admin Panel**.
  2. Increase usage quota for the affected `clientId`.
  3. Quotas reset automatically at 00:00 UTC.

### B. "Liveness Failure" (422)
- **Cause:** Biological signal could not be recovered from the video stream.
- **Resolution:**
  1. Instruct human participant to move into a well-lit area.
  2. Ensure no artificial light flickering (60Hz/50Hz interference).
  3. Refresh the `BioOpticEngine` component.

### C. Shard Desynchronization
- **Issue:** Webhooks delivering out-of-order proof IDs.
- **Resolution:**
  1. Anthropol utilizes chronological sequence IDs. 
  2. Check the `shardIndex` in the webhook payload. 
  3. If shard reporting latency > 5s, escalate to the Infrastructure Mesh team.

## 3. Service Restart
1. **Dev Server:** `npm run dev`
2. **Production:** Automated via Cloud Run container orchestration. No manual restart required unless container registry is compromised.
