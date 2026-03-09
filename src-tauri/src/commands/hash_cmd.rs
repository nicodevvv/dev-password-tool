/// Tauri commands for hash generation.
use crate::crypto::hash::{generate_hash, HashAlgorithm, HashOptions, HashResult};

/// Generate a hash for the given input.
#[tauri::command]
pub fn cmd_generate_hash(
    input: String,
    algorithm: String,
) -> Result<HashResult, String> {
    let algo = match algorithm.to_lowercase().as_str() {
        "sha256" | "sha-256" => HashAlgorithm::Sha256,
        "sha512" | "sha-512" => HashAlgorithm::Sha512,
        "bcrypt" => HashAlgorithm::Bcrypt,
        _ => return Err(format!("Unsupported algorithm: {}", algorithm)),
    };

    let opts = HashOptions { input, algorithm: algo };
    generate_hash(&opts)
}
