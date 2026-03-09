/// Hash generation module.
///
/// Supports SHA-256, SHA-512, and bcrypt hashing algorithms.
use bcrypt::{hash, DEFAULT_COST};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256, Sha512};

/// Supported hash algorithms.
#[derive(Debug, Deserialize)]
pub enum HashAlgorithm {
    Sha256,
    Sha512,
    Bcrypt,
}

/// Options for hash generation.
#[derive(Debug, Deserialize)]
pub struct HashOptions {
    pub input: String,
    pub algorithm: HashAlgorithm,
}

/// Result of hash generation.
#[derive(Debug, Serialize)]
pub struct HashResult {
    pub hash: String,
    pub algorithm: String,
    pub input_length: usize,
}

/// Generate a hash of the input string using the specified algorithm.
pub fn generate_hash(opts: &HashOptions) -> Result<HashResult, String> {
    let (hash_str, algo_name) = match opts.algorithm {
        HashAlgorithm::Sha256 => {
            let mut hasher = Sha256::new();
            hasher.update(opts.input.as_bytes());
            let result = hasher.finalize();
            (hex::encode(result), "SHA-256")
        }
        HashAlgorithm::Sha512 => {
            let mut hasher = Sha512::new();
            hasher.update(opts.input.as_bytes());
            let result = hasher.finalize();
            (hex::encode(result), "SHA-512")
        }
        HashAlgorithm::Bcrypt => {
            let hashed =
                hash(&opts.input, DEFAULT_COST).map_err(|e| format!("bcrypt error: {}", e))?;
            (hashed, "bcrypt")
        }
    };

    Ok(HashResult {
        hash: hash_str,
        algorithm: algo_name.to_string(),
        input_length: opts.input.len(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sha256() {
        let opts = HashOptions {
            input: "hello".into(),
            algorithm: HashAlgorithm::Sha256,
        };
        let result = generate_hash(&opts).unwrap();
        assert_eq!(
            result.hash,
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        );
    }

    #[test]
    fn test_sha512() {
        let opts = HashOptions {
            input: "hello".into(),
            algorithm: HashAlgorithm::Sha512,
        };
        let result = generate_hash(&opts).unwrap();
        assert_eq!(result.hash.len(), 128); // SHA-512 = 128 hex chars
    }

    #[test]
    fn test_bcrypt() {
        let opts = HashOptions {
            input: "hello".into(),
            algorithm: HashAlgorithm::Bcrypt,
        };
        let result = generate_hash(&opts).unwrap();
        assert!(result.hash.starts_with("$2b$"));
    }
}
