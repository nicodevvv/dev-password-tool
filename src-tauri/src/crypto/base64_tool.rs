/// Base64 encoding/decoding module.
///
/// Provides two-way conversion between text and Base64 with validation.
use base64::{engine::general_purpose, Engine};
use serde::{Deserialize, Serialize};

/// Mode of Base64 operation.
#[derive(Debug, Deserialize)]
pub enum Base64Mode {
    Encode,
    Decode,
}

/// Options for Base64 operation.
#[derive(Debug, Deserialize)]
pub struct Base64Options {
    pub input: String,
    pub mode: Base64Mode,
}

/// Result of Base64 operation.
#[derive(Debug, Serialize)]
pub struct Base64Result {
    pub output: String,
    pub mode: String,
    pub input_length: usize,
    pub output_length: usize,
}

/// Perform Base64 encode or decode operation.
pub fn process_base64(opts: &Base64Options) -> Result<Base64Result, String> {
    let (output, mode_name) = match opts.mode {
        Base64Mode::Encode => {
            let encoded = general_purpose::STANDARD.encode(opts.input.as_bytes());
            (encoded, "encode")
        }
        Base64Mode::Decode => {
            let decoded_bytes = general_purpose::STANDARD
                .decode(opts.input.trim())
                .map_err(|e| format!("Invalid Base64 input: {}", e))?;
            let decoded = String::from_utf8(decoded_bytes)
                .map_err(|e| format!("Decoded bytes are not valid UTF-8: {}", e))?;
            (decoded, "decode")
        }
    };

    let output_length = output.len();

    Ok(Base64Result {
        output,
        mode: mode_name.to_string(),
        input_length: opts.input.len(),
        output_length,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode() {
        let opts = Base64Options {
            input: "Hello, World!".into(),
            mode: Base64Mode::Encode,
        };
        let result = process_base64(&opts).unwrap();
        assert_eq!(result.output, "SGVsbG8sIFdvcmxkIQ==");
    }

    #[test]
    fn test_decode() {
        let opts = Base64Options {
            input: "SGVsbG8sIFdvcmxkIQ==".into(),
            mode: Base64Mode::Decode,
        };
        let result = process_base64(&opts).unwrap();
        assert_eq!(result.output, "Hello, World!");
    }

    #[test]
    fn test_roundtrip() {
        let original = "The quick brown fox 🦊";
        let encoded = process_base64(&Base64Options {
            input: original.into(),
            mode: Base64Mode::Encode,
        })
        .unwrap();
        let decoded = process_base64(&Base64Options {
            input: encoded.output,
            mode: Base64Mode::Decode,
        })
        .unwrap();
        assert_eq!(decoded.output, original);
    }

    #[test]
    fn test_invalid_base64() {
        let opts = Base64Options {
            input: "not-valid-base64!!!".into(),
            mode: Base64Mode::Decode,
        };
        assert!(process_base64(&opts).is_err());
    }
}
