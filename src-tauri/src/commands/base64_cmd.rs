/// Tauri commands for Base64 encoding/decoding.
use crate::crypto::base64_tool::{process_base64, Base64Mode, Base64Options, Base64Result};

/// Encode or decode Base64.
#[tauri::command]
pub fn cmd_base64(
    input: String,
    mode: String,
) -> Result<Base64Result, String> {
    let m = match mode.to_lowercase().as_str() {
        "encode" => Base64Mode::Encode,
        "decode" => Base64Mode::Decode,
        _ => return Err(format!("Unsupported mode: {}. Use 'encode' or 'decode'.", mode)),
    };

    let opts = Base64Options { input, mode: m };
    process_base64(&opts)
}
