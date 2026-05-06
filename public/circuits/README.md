# Anthropol ZK-Circuit Repository

Place your compiled Circom assets here to enable mathematical non-repudiability.

## Required Assets
- `humanity_check.wasm`: The WebAssembly witness generator.
- `humanity_check.zkey`: The Proving Key (Groth16).

## Compilation Command (Reference)
```bash
circom humanity_check.circom --wasm --r1cs
snarkjs groth16 setup humanity_check.r1cs powersOfTau28_hez_final_10.ptau humanity_check_0000.zkey
snarkjs zkey contribute humanity_check_0000.zkey humanity_check.zkey --name="Anthropol Prover" -v
```

The system will automatically detect these files and upgrade from "Hifi Signature" to "ZK-Proof" mode.
