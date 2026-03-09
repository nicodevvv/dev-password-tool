// ── Type definitions for the Dev Password Tool ──

/** Password generation result from Rust backend. */
export interface PasswordResult {
  password: string;
  entropy: number;
  strength: string;
  crack_time: string;
}

/** SSH key generation result. */
export interface SshKeyResult {
  private_key: string;
  public_key: string;
  key_type: string;
  fingerprint: string;
}

/** Token generation result. */
export interface TokenResult {
  token: string;
  format: string;
  byte_length: number;
  char_length: number;
}

/** Hash generation result. */
export interface HashResult {
  hash: string;
  algorithm: string;
  input_length: number;
}

/** Base64 operation result. */
export interface Base64Result {
  output: string;
  mode: string;
  input_length: number;
  output_length: number;
}

/** Navigation page identifiers. */
export type Page =
  | "password"
  | "ssh"
  | "token"
  | "hash"
  | "base64";

/** Sidebar navigation item. */
export interface NavItem {
  id: Page;
  label: string;
  icon: string;
}
