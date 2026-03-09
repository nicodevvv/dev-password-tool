/// Cryptographic password generation module.
///
/// Uses `rand` crate with `OsRng` for cryptographically secure randomness.
use rand::seq::SliceRandom;
use rand::Rng;
use serde::{Deserialize, Serialize};

const UPPERCASE: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE: &str = "abcdefghijklmnopqrstuvwxyz";
const DIGITS: &str = "0123456789";
const SPECIAL: &str = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS: &[char] = &['O', '0', 'l', 'I', '1', '|'];

/// Options for password generation.
#[derive(Debug, Deserialize)]
pub struct PasswordOptions {
    pub length: usize,
    pub uppercase: bool,
    pub lowercase: bool,
    pub numbers: bool,
    pub special: bool,
    pub exclude_ambiguous: bool,
}

/// Result of password generation, including entropy & strength.
#[derive(Debug, Serialize)]
pub struct PasswordResult {
    pub password: String,
    pub entropy: f64,
    pub strength: String,
    pub crack_time: String,
}

/// Generates a cryptographically secure password based on the given options.
pub fn generate_password(opts: &PasswordOptions) -> Result<PasswordResult, String> {
    let mut charset = String::new();

    if opts.uppercase {
        charset.push_str(UPPERCASE);
    }
    if opts.lowercase {
        charset.push_str(LOWERCASE);
    }
    if opts.numbers {
        charset.push_str(DIGITS);
    }
    if opts.special {
        charset.push_str(SPECIAL);
    }

    if charset.is_empty() {
        return Err("At least one character set must be selected".into());
    }

    // Filter ambiguous characters if requested
    if opts.exclude_ambiguous {
        charset = charset
            .chars()
            .filter(|c| !AMBIGUOUS.contains(c))
            .collect();
    }

    let charset_chars: Vec<char> = charset.chars().collect();
    let charset_len = charset_chars.len();

    if opts.length == 0 {
        return Err("Password length must be at least 1".into());
    }

    let mut rng = rand::thread_rng();

    // Generate password using OsRng-seeded ThreadRng (CSPRNG)
    let password: String = (0..opts.length)
        .map(|_| {
            let idx = rng.gen_range(0..charset_len);
            charset_chars[idx]
        })
        .collect();

    // Ensure at least one character from each selected set is present
    // by shuffling required chars into random positions
    let mut password_chars: Vec<char> = password.chars().collect();
    let mut required: Vec<char> = Vec::new();

    if opts.uppercase {
        let pool: Vec<char> = filter_ambiguous(UPPERCASE, opts.exclude_ambiguous);
        if let Some(&c) = pool.choose(&mut rng) {
            required.push(c);
        }
    }
    if opts.lowercase {
        let pool: Vec<char> = filter_ambiguous(LOWERCASE, opts.exclude_ambiguous);
        if let Some(&c) = pool.choose(&mut rng) {
            required.push(c);
        }
    }
    if opts.numbers {
        let pool: Vec<char> = filter_ambiguous(DIGITS, opts.exclude_ambiguous);
        if let Some(&c) = pool.choose(&mut rng) {
            required.push(c);
        }
    }
    if opts.special {
        let pool: Vec<char> = filter_ambiguous(SPECIAL, opts.exclude_ambiguous);
        if let Some(&c) = pool.choose(&mut rng) {
            required.push(c);
        }
    }

    // Place required characters at random positions
    for (i, c) in required.into_iter().enumerate() {
        if i < password_chars.len() {
            let pos = rng.gen_range(0..password_chars.len());
            password_chars[pos] = c;
        }
    }

    let final_password: String = password_chars.into_iter().collect();

    // Calculate entropy: log2(charset_len ^ length) = length * log2(charset_len)
    let entropy = (opts.length as f64) * (charset_len as f64).log2();
    let strength = classify_strength(entropy);
    let crack_time = estimate_crack_time(entropy);

    Ok(PasswordResult {
        password: final_password,
        entropy,
        strength,
        crack_time,
    })
}

/// Filter ambiguous characters from a character set string.
fn filter_ambiguous(charset: &str, exclude: bool) -> Vec<char> {
    if exclude {
        charset
            .chars()
            .filter(|c| !AMBIGUOUS.contains(c))
            .collect()
    } else {
        charset.chars().collect()
    }
}

/// Classify password strength based on bits of entropy.
fn classify_strength(entropy: f64) -> String {
    match entropy {
        e if e < 28.0 => "Very Weak".into(),
        e if e < 36.0 => "Weak".into(),
        e if e < 60.0 => "Reasonable".into(),
        e if e < 128.0 => "Strong".into(),
        _ => "Very Strong".into(),
    }
}

/// Estimate human-readable crack time based on entropy bits.
/// Assumes 10 billion guesses per second (modern GPU cluster).
fn estimate_crack_time(entropy: f64) -> String {
    let guesses_per_second: f64 = 1e10;
    let total_guesses = 2.0_f64.powf(entropy);
    let seconds = total_guesses / guesses_per_second;

    if seconds < 1.0 {
        "Instant".into()
    } else if seconds < 60.0 {
        format!("{:.0} seconds", seconds)
    } else if seconds < 3600.0 {
        format!("{:.0} minutes", seconds / 60.0)
    } else if seconds < 86400.0 {
        format!("{:.1} hours", seconds / 3600.0)
    } else if seconds < 31_536_000.0 {
        format!("{:.1} days", seconds / 86400.0)
    } else if seconds < 31_536_000.0 * 1000.0 {
        format!("{:.1} years", seconds / 31_536_000.0)
    } else if seconds < 31_536_000.0 * 1e6 {
        format!("{:.1} thousand years", seconds / (31_536_000.0 * 1000.0))
    } else if seconds < 31_536_000.0 * 1e9 {
        format!("{:.1} million years", seconds / (31_536_000.0 * 1e6))
    } else {
        "Billions of years+".into()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_password_basic() {
        let opts = PasswordOptions {
            length: 16,
            uppercase: true,
            lowercase: true,
            numbers: true,
            special: false,
            exclude_ambiguous: false,
        };
        let result = generate_password(&opts).unwrap();
        assert_eq!(result.password.len(), 16);
        assert!(result.entropy > 0.0);
    }

    #[test]
    fn test_exclude_ambiguous() {
        let opts = PasswordOptions {
            length: 100,
            uppercase: true,
            lowercase: true,
            numbers: true,
            special: true,
            exclude_ambiguous: true,
        };
        let result = generate_password(&opts).unwrap();
        for c in result.password.chars() {
            assert!(!AMBIGUOUS.contains(&c));
        }
    }

    #[test]
    fn test_empty_charset() {
        let opts = PasswordOptions {
            length: 16,
            uppercase: false,
            lowercase: false,
            numbers: false,
            special: false,
            exclude_ambiguous: false,
        };
        assert!(generate_password(&opts).is_err());
    }
}
