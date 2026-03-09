/// Tauri commands for token generation.
use crate::crypto::token::{generate_token, TokenFormat, TokenOptions, TokenResult};

/// Generate a cryptographically secure random token.
#[tauri::command]
pub fn cmd_generate_token(
    byte_length: usize,
    format: String,
) -> Result<TokenResult, String> {
    let fmt = match format.to_lowercase().as_str() {
        "hex" => TokenFormat::Hex,
        "base64" => TokenFormat::Base64,
        "url-safe" | "urlsafe" => TokenFormat::UrlSafe,
        _ => return Err(format!("Unsupported format: {}", format)),
    };

    let opts = TokenOptions {
        byte_length,
        format: fmt,
    };
    generate_token(&opts)
}
