#!/bin/bash

# Anthropol.io ZK-Circuit Build Pipeline
# Requires: circom (https://docs.circom.io/) and snarkjs (npm install -g snarkjs)

set -e

CIRCUIT_NAME="humanity_check"
BUILD_DIR="./build-circuits"
PUBLIC_DIR="./public/circuits"

mkdir -p $BUILD_DIR
mkdir -p $PUBLIC_DIR

echo "[ZK] Compiling circuit..."
# 1. Compile circuit to r1cs and wasm
circom ./circuits/$CIRCUIT_NAME.circom --r1cs --wasm --sym --output $BUILD_DIR

echo "[ZK] Moving WASM to public directory..."
cp $BUILD_DIR/${CIRCUIT_NAME}_js/$CIRCUIT_NAME.wasm $PUBLIC_DIR/

echo "[ZK] Performing Groth16 Trusted Setup (Phase 2)..."
# 2. Generate a new zkey (In production, use a proper ceremony)
# Note: Using powers of tau file (pot12_final.ptau) - assuming it exists or using a small one for demo
# For this script, we'll use a dummy 'contribution' for the final zkey.

# Generate the initial zkey
npx snarkjs groth16 setup $BUILD_DIR/$CIRCUIT_NAME.r1cs ./circuits/pot12_final.ptau $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey

# Contribute to the ceremony (Demo)
npx snarkjs zkey contribute $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey --name="Anthropol Dev" -v -e="some random text"

echo "[ZK] Exporting verification key..."
npx snarkjs zkey export verificationkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey $PUBLIC_DIR/verification_key.json

echo "[ZK] Moving final zkey to public directory..."
cp $BUILD_DIR/${CIRCUIT_NAME}_final.zkey $PUBLIC_DIR/$CIRCUIT_NAME.zkey

echo "[ZK] Cleanup..."
# rm -rf $BUILD_DIR

echo "[SUCCESS] ZK assets generated in $PUBLIC_DIR"
