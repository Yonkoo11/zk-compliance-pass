use std::hash::pedersen_hash;

// Compute Merkle root from leaf, index bits, and sibling path
// Depth 10 supports up to 1024 leaves (enough for testnet demo)
fn compute_merkle_root(leaf: Field, index: Field, hash_path: [Field; 10]) -> Field {
    let index_bits: [bool; 10] = index.to_be_bits();
    let mut current = leaf;

    for i in 0..10 {
        let path_element = hash_path[i];
        // If bit is false, current is left child; if true, current is right child
        let (left, right) = if !index_bits[9 - i] {
            (current, path_element)
        } else {
            (path_element, current)
        };
        current = pedersen_hash([left, right]);
    }

    current
}

fn main(
    // PUBLIC INPUTS (visible to verifier on-chain)
    merkle_root: pub Field,
    threshold: pub u8,
    nullifier_hash: pub Field,

    // PRIVATE INPUTS (known only to prover)
    address_hash: Field,
    kyc_level: u8,
    salt: Field,
    index: Field,
    hash_path: [Field; 10],
    nullifier_secret: Field,
) {
    // 1. Reconstruct leaf: hash(address_hash, salt, level)
    let leaf = pedersen_hash([address_hash, salt, kyc_level as Field]);

    // 2. Verify Merkle membership (proves address is in the KYC tree)
    let computed_root = compute_merkle_root(leaf, index, hash_path);
    assert(computed_root == merkle_root);

    // 3. KYC level meets threshold (proves compliance without revealing exact level)
    assert(kyc_level >= threshold);

    // 4. Nullifier prevents double-use of same credential
    let computed_nullifier = pedersen_hash([nullifier_secret, address_hash]);
    assert(computed_nullifier == nullifier_hash);
}
