/// SSH key generation module.
///
/// Supports Ed25519 (primary) and RSA key generation.
use serde::{Deserialize, Serialize};
use ssh_key::{rand_core::OsRng, Algorithm, LineEnding, PrivateKey};

/// Supported SSH key types.
#[derive(Debug, Deserialize)]
pub enum SshKeyType {
    Ed25519,
    Rsa2048,
    Rsa4096,
}

/// Options for SSH key generation.
#[derive(Debug, Deserialize)]
pub struct SshKeyOptions {
    pub key_type: SshKeyType,
    pub comment: String,
    pub passphrase: Option<String>,
}

/// Result containing both private and public keys.
#[derive(Debug, Serialize)]
pub struct SshKeyResult {
    pub private_key: String,
    pub public_key: String,
    pub key_type: String,
    pub fingerprint: String,
}

/// Generate an SSH key pair based on the provided options.
pub fn generate_ssh_key(opts: &SshKeyOptions) -> Result<SshKeyResult, String> {
    let private_key = match opts.key_type {
        SshKeyType::Ed25519 => PrivateKey::random(&mut OsRng, Algorithm::Ed25519)
            .map_err(|e| format!("Failed to generate Ed25519 key: {}", e))?,
        SshKeyType::Rsa2048 => {
            let rsa_keygen = ssh_key::private::RsaKeypair::random(&mut OsRng, 2048)
                .map_err(|e| format!("Failed to generate RSA-2048 key: {}", e))?;
            PrivateKey::new(
                ssh_key::private::KeypairData::Rsa(rsa_keygen),
                &opts.comment,
            )
            .map_err(|e| format!("Failed to create RSA private key: {}", e))?
        }
        SshKeyType::Rsa4096 => {
            let rsa_keygen = ssh_key::private::RsaKeypair::random(&mut OsRng, 4096)
                .map_err(|e| format!("Failed to generate RSA-4096 key: {}", e))?;
            PrivateKey::new(
                ssh_key::private::KeypairData::Rsa(rsa_keygen),
                &opts.comment,
            )
            .map_err(|e| format!("Failed to create RSA private key: {}", e))?
        }
    };

    // Serialize the private key, optionally encrypting with passphrase
    let private_key_str = match &opts.passphrase {
        Some(pass) if !pass.is_empty() => private_key
            .encrypt(&mut OsRng, pass)
            .map_err(|e| format!("Failed to encrypt private key: {}", e))?
            .to_openssh(LineEnding::LF)
            .map_err(|e| format!("Failed to serialize encrypted key: {}", e))?
            .to_string(),
        _ => private_key
            .to_openssh(LineEnding::LF)
            .map_err(|e| format!("Failed to serialize private key: {}", e))?
            .to_string(),
    };

    // Generate public key with comment
    let public_key = private_key.public_key();
    let public_key_str = public_key
        .to_openssh()
        .map_err(|e| format!("Failed to serialize public key: {}", e))?;

    let public_key_with_comment = if opts.comment.is_empty() {
        public_key_str.to_string()
    } else {
        format!("{} {}", public_key_str, opts.comment)
    };

    // Compute fingerprint (SHA256)
    let fingerprint = public_key.fingerprint(ssh_key::HashAlg::Sha256).to_string();

    let key_type_str = match opts.key_type {
        SshKeyType::Ed25519 => "Ed25519",
        SshKeyType::Rsa2048 => "RSA-2048",
        SshKeyType::Rsa4096 => "RSA-4096",
    };

    Ok(SshKeyResult {
        private_key: private_key_str,
        public_key: public_key_with_comment,
        key_type: key_type_str.to_string(),
        fingerprint,
    })
}
