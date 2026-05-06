# Infrastructure & Deployment: The Global Mesh

## 1. Cloud Infrastructure
Anthropol.io utilizes **Google Cloud Platform (GCP)** as its primary backbone, leveraging global fiber networks for sub-millisecond inter-shard communication.

### Core Components:
- **Compute:** [Cloud Run](https://cloud.google.com/run) for stateless, auto-scaling API services.
- **Persistence:** [Cloud Firestore](https://cloud.google.com/firestore) in Enterprise Sharded mode.
- **Edge:** [Cloud CDN](https://cloud.google.com/cdn) for global delivery of the Bio-Optic Engine JS assets.
- **Networking:** [Cloud DNS](https://cloud.google.com/dns) with Latency-Based Routing to steer users to the nearest regional shard.

## 2. Containerization
The master oracle is packaged as a lightweight OCI-compliant container.
- **Base Image:** Alpine Linux (Minimal attack surface).
- **Runtime:** Node.js 20 (LTS).
- **Binary:** Custom C++ bindings for high-performance FFT (Fast Fourier Transform) logic.

## 3. CI/CD Pipeline
We utilize a GitOps workflow for all infrastructure changes.

### Stages:
1. **Validation:** Static analysis and `npm run lint`.
2. **Security Scan:** Container image scanning for CVEs.
3. **Staging:** Deployment to `ais-pre-...` for internal QA and bio-telemetry verification.
4. **Institutional Rollout:** Canary release to regional shards (10% -> 50% -> 100%).

## 4. Environment Configuration
Secrets are managed via **Secret Manager** and never committed to source.
- `SHARD_ID`: Unique regional identifier.
- `MASTER_KEY`: Root of trust for the ZK-Oracle.
- `DATABASE_URL`: Regional Firestore connection string.
