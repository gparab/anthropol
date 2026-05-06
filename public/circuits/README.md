# Anthropol ZK-Circuit Repository

This directory contains the compiled assets for the Anthropol.io biometric verification circuit.

## Current Circuit: `humanity_check.circom`
The circuit validates biological signal sovereignty through the following constraints:
1. **BPM Range**: Enforces $40 \le \text{bpm} \le 180$.
2. **Cryptographic Binding**: Binds telemetry, user identity, and credentials to a unique proof using Poseidon hashing.

## Required Assets
- `humanity_check.wasm`: The WebAssembly witness generator.
- `humanity_check.zkey`: The Proving Key (Groth16).
- `verification_key.json`: The public verification key used by the server.

## Building
Run the provided `build-circuits.sh` in the root directory.
```bash
chmod +x build-circuits.sh
./build-circuits.sh
```

The app's crypto layer (`src/lib/crypto.ts`) automatically detects these assets to enable Zero-Knowledge mode.
