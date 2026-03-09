/// Tauri commands for SSH key generation.
use crate::crypto::ssh::{generate_ssh_key, SshKeyOptions, SshKeyResult, SshKeyType};

/// Generate an SSH key pair.
#[tauri::command]
pub fn cmd_generate_ssh_key(
    key_type: String,
    comment: String,
    passphrase: Option<String>,
) -> Result<SshKeyResult, String> {
    let kt = match key_type.to_lowercase().as_str() {
        "ed25519" => SshKeyType::Ed25519,
        "rsa2048" | "rsa-2048" => SshKeyType::Rsa2048,
        "rsa4096" | "rsa-4096" => SshKeyType::Rsa4096,
        _ => return Err(format!("Unsupported key type: {}", key_type)),
    };

    let opts = SshKeyOptions {
        key_type: kt,
        comment,
        passphrase,
    };
    generate_ssh_key(&opts)
}
