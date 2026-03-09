/// Secure token generation module.
///
/// Generates cryptographically random tokens in various output formats.
use base64::{engine::general_purpose, Engine};
use rand::RngCore;
use serde::{Deserialize, Serialize};

/// Supported output formats for tokens.
#[derive(Debug, Deserialize)]
pub enum TokenFormat {
    Hex,
    Base64,
    UrlSafe,
}

/// Options for token generation.
#[derive(Debug, Deserialize)]
pub struct TokenOptions {
    /// Token length in bytes (output string will be longer due to encoding).
    pub byte_length: usize,
    pub format: TokenFormat,
}

/// Result of token generation.
#[derive(Debug, Serialize)]
pub struct TokenResult {
    pub token: String,
    pub format: String,
    pub byte_length: usize,
    pub char_length: usize,
}

/// Generate a cryptographically secure random token.
pub fn generate_token(opts: &TokenOptions) -> Result<TokenResult, String> {
    if opts.byte_length == 0 || opts.byte_length > 1024 {
        return Err("Byte length must be between 1 and 1024".into());
    }

    let mut bytes = vec![0u8; opts.byte_length];
    rand::thread_rng().fill_bytes(&mut bytes);

    let (token, format_name) = match opts.format {
        TokenFormat::Hex => (hex::encode(&bytes), "hex"),
        TokenFormat::Base64 => (general_purpose::STANDARD.encode(&bytes), "base64"),
        TokenFormat::UrlSafe => (general_purpose::URL_SAFE_NO_PAD.encode(&bytes), "url-safe"),
    };

    let char_length = token.len();

    Ok(TokenResult {
        token,
        format: format_name.to_string(),
        byte_length: opts.byte_length,
        char_length,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_token() {
        let opts = TokenOptions {
            byte_length: 32,
            format: TokenFormat::Hex,
        };
        let result = generate_token(&opts).unwrap();
        assert_eq!(result.char_length, 64); // 32 bytes = 64 hex chars
    }

    #[test]
    fn test_base64_token() {
        let opts = TokenOptions {
            byte_length: 32,
            format: TokenFormat::Base64,
        };
        let result = generate_token(&opts).unwrap();
        assert!(!result.token.is_empty());
    }

    #[test]
    fn test_url_safe_token() {
        let opts = TokenOptions {
            byte_length: 32,
            format: TokenFormat::UrlSafe,
        };
        let result = generate_token(&opts).unwrap();
        // URL-safe base64 should not contain + or /
        assert!(!result.token.contains('+'));
        assert!(!result.token.contains('/'));
    }
}
