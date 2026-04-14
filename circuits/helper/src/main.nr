use std::hash::pedersen_hash;

// Helper to compute leaf, nullifier, and merkle root for test data
// Run with: nargo execute
// Then read the return values from the output

fn main(
    address_hash: Field,
    kyc_level: u8,
    salt: Field,
    nullifier_secret: Field,
) -> pub (Field, Field, Field) {
    // Compute leaf
    let leaf = pedersen_hash([address_hash, salt, kyc_level as Field]);

    // Compute nullifier
    let nullifier = pedersen_hash([nullifier_secret, address_hash]);

    // Compute merkle root for index 0 with all-zero siblings
    // This means the leaf is the leftmost leaf in the tree
    let zero = 0;
    let mut current = leaf;
    for _ in 0..10 {
        current = pedersen_hash([current, zero]);
    }
    let merkle_root = current;

    (leaf, nullifier, merkle_root)
}
