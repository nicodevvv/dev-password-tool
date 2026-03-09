/// Tauri commands for password generation.
use crate::crypto::password::{generate_password, PasswordOptions, PasswordResult};

/// Generate a secure password with the given options.
#[tauri::command]
pub fn cmd_generate_password(
    length: usize,
    uppercase: bool,
    lowercase: bool,
    numbers: bool,
    special: bool,
    exclude_ambiguous: bool,
) -> Result<PasswordResult, String> {
    let opts = PasswordOptions {
        length,
        uppercase,
        lowercase,
        numbers,
        special,
        exclude_ambiguous,
    };
    generate_password(&opts)
}
