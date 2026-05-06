pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

template HumanityCheck() {
    // Public inputs (will be visible in publicSignals)
    signal input signalHash;
    signal input userIdHash;
    signal input credentialHash;
    signal input timestamp;

    // Private inputs (hidden from verifier)
    signal input bpm;
    signal input nonce;

    // Output: A combined commitment of the verification
    signal output out;

    // 1. Constraint: BPM must be within biological bounds (40-180)
    component lowerBound = GreaterEqThan(8);
    lowerBound.in[0] <== bpm;
    lowerBound.in[1] <== 40;
    lowerBound.out === 1;

    component upperBound = LessEqThan(8);
    upperBound.in[0] <== bpm;
    upperBound.in[1] <== 180;
    upperBound.out === 1;

    // 2. Cryptographic Binding
    // We use Poseidon to hash state and prove we know the private nonce 
    // that results in this specific proof commitment.
    component hasher = Poseidon(6);
    hasher.inputs[0] <== signalHash;
    hasher.inputs[1] <== userIdHash;
    hasher.inputs[2] <== credentialHash;
    hasher.inputs[3] <== bpm;
    hasher.inputs[4] <== nonce;
    hasher.inputs[5] <== timestamp;

    out <== hasher.out;
}

component main {public [signalHash, userIdHash, credentialHash, timestamp]} = HumanityCheck();
