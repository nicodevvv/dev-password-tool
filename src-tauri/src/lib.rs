/// Dev Password Tool - Tauri application library.
///
/// This is the main library crate that wires together all modules
/// and exposes the Tauri application builder.
pub mod commands;
pub mod crypto;

use commands::{
    base64_cmd::cmd_base64, hash_cmd::cmd_generate_hash, password_cmd::cmd_generate_password,
    ssh_cmd::cmd_generate_ssh_key, token_cmd::cmd_generate_token,
};

/// Build and configure the Tauri application.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            cmd_generate_password,
            cmd_generate_ssh_key,
            cmd_generate_token,
            cmd_generate_hash,
            cmd_base64,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
