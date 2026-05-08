pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

/**
 * HumanityCheck
 * Performs biological liveness verification by analyzing the variance 
 * of a time-series rPPG signal (Remote Photoplethysmography).
 */
template HumanityCheck(L) {
    // --- Public Inputs ---
    signal input signalHash;     // External commitment to the raw signal
    signal input userIdHash;     // Identity binding
    signal input credentialHash; // HardWare binding
    signal input timestamp;      // Temporal validity

    // --- Private Inputs ---
    signal input rppg[L];        // Raw biological frequency vector
    signal input nonce;          // Proof entropy

    // --- Output ---
    signal output out;           // Final Proof Commitment

    // 1. Calculate Signal Mean (Sum first)
    signal rppg_sum;
    signal partialSums[L+1];
    partialSums[0] <== 0;
    for (var i = 0; i < L; i++) {
        partialSums[i+1] <== partialSums[i] + rppg[i];
    }
    rppg_sum <== partialSums[L];

    // 2. Variance Analysis: Sum of Squared Differences
    // We calculate L^2 * Variance = sum((L*x[i] - sum)^2) to avoid field division
    signal diffs[L];
    signal squares[L];
    signal runningSqSum[L+1];
    runningSqSum[0] <== 0;

    for (var i = 0; i < L; i++) {
        diffs[i] <== L * rppg[i] - rppg_sum;
        squares[i] <== diffs[i] * diffs[i];
        runningSqSum[i+1] <== runningSqSum[i] + squares[i];
    }
    
    signal scaled_variance <== runningSqSum[L];

    // 3. Biological Threshold Enforcement
    // MIN_THRESHOLD: Rejects static artifacts or high-quality photos (Variance too low)
    // MAX_THRESHOLD: Rejects chaotic electronic noise or sensor saturation (Variance too high)
    
    // Note: Thresholds are tuned for L=64 and standard rPPG normalization
    component lowerBound = GreaterThan(252);
    lowerBound.in[0] <== scaled_variance;
    lowerBound.in[1] <== 5000; 
    lowerBound.out === 1;

    component upperBound = LessThan(252);
    upperBound.in[0] <== scaled_variance;
    upperBound.in[1] <== 5000000; 
    upperBound.out === 1;

    // 4. Cryptographic Commitment
    // We bind the calculated biological signature to the identity parameters.
    component commitmentHasher = Poseidon(6);
    commitmentHasher.inputs[0] <== signalHash;
    commitmentHasher.inputs[1] <== userIdHash;
    commitmentHasher.inputs[2] <== credentialHash;
    commitmentHasher.inputs[3] <== scaled_variance;
    commitmentHasher.inputs[4] <== nonce;
    commitmentHasher.inputs[5] <== timestamp;

    out <== commitmentHasher.out;
}

// MAIN COMPONENT: 64-sample biological window (approx. 2-3 seconds of data)
component main {public [signalHash, userIdHash, credentialHash, timestamp]} = HumanityCheck(64);
