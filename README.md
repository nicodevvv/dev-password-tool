# 🛡️ Dev Password Tool

A lightweight, offline-first desktop application for developers providing cryptographic and encoding utilities. Built with **Rust + Tauri** (backend) and **React + TypeScript + TailwindCSS** (frontend).

## Features

| Tool | Description |
|------|-------------|
| **Password Generator** | Secure passwords with configurable length, character sets, ambiguous char exclusion, strength meter & entropy estimation |
| **SSH Key Generator** | Ed25519 and RSA (2048/4096) key pairs with optional passphrase encryption |
| **Token Generator** | Cryptographically secure tokens in hex, base64, or URL-safe formats |
| **Hash Generator** | Live hashing with SHA-256, SHA-512, and bcrypt |
| **Base64 Tool** | Two-way encode/decode with validation and swap functionality |

### Highlights

- 🔒 All cryptography runs in **Rust** — no JS crypto
- ⚡ Fast startup, minimal memory usage
- 🖥️ Cross-platform: macOS, Windows, Linux
- 🌙 Dark mode by default
- ⌨️ Keyboard shortcuts (`Ctrl/Cmd + 1-5` to switch tools)
- 📋 Secure clipboard integration

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/) prerequisites for your OS

### macOS

```bash
xcode-select --install
```

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

### Windows

Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

## Getting Started

```bash
# Install frontend dependencies
npm install

# Run in development mode (hot-reload)
npm run tauri dev
```

## Building for Production

```bash
# Build optimized binary for your current platform
npm run tauri build
```

Binaries are output to `src-tauri/target/release/bundle/`.

### Cross-platform builds

| Platform | Output |
|----------|--------|
| macOS | `.app` bundle, `.dmg` |
| Windows | `.msi`, `.exe` |
| Linux | `.deb`, `.AppImage` |

## Project Structure

```
dev-password-generator/
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   │   ├── CopyButton.tsx      # Clipboard copy with feedback
│   │   ├── OutputBox.tsx       # Read-only output display
│   │   ├── PageHeader.tsx      # Consistent page headers
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── StrengthMeter.tsx   # Password strength visualization
│   ├── hooks/
│   │   └── useClipboard.ts     # Clipboard hook with timeout
│   ├── pages/                  # Tool page components
│   │   ├── PasswordPage.tsx
│   │   ├── SshPage.tsx
│   │   ├── TokenPage.tsx
│   │   ├── HashPage.tsx
│   │   └── Base64Page.tsx
│   ├── utils/
│   │   ├── types.ts            # TypeScript type definitions
│   │   └── constants.ts        # Navigation items & helpers
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # React entry point
│   └── index.css               # TailwindCSS + custom styles
├── src-tauri/                  # Rust backend
│   ├── src/
│   │   ├── main.rs             # Application entry point
│   │   ├── lib.rs              # Tauri builder & command registration
│   │   ├── commands/           # Tauri command handlers
│   │   │   ├── password_cmd.rs
│   │   │   ├── ssh_cmd.rs
│   │   │   ├── token_cmd.rs
│   │   │   ├── hash_cmd.rs
│   │   │   └── base64_cmd.rs
│   │   └── crypto/             # Core crypto implementations
│   │       ├── password.rs     # CSPRNG password generation
│   │       ├── ssh.rs          # SSH key generation (Ed25519/RSA)
│   │       ├── token.rs        # Secure token generation
│   │       ├── hash.rs         # SHA-256/512, bcrypt
│   │       └── base64_tool.rs  # Base64 encode/decode
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Architecture

```
React UI  →  invoke("cmd_name", args)  →  Tauri IPC  →  Rust handler  →  crypto module
    ↑                                                                          |
    └──────────────────────── Result<T, String> ───────────────────────────────┘
```

All cryptographic operations execute in Rust using:
- `rand` (OsRng) — cryptographically secure randomness
- `sha2` — SHA-256/512
- `bcrypt` — bcrypt hashing
- `ssh-key` — SSH key generation (Ed25519, RSA)
- `base64` + `hex` — encoding

## Installing from Release

Download the latest release for your platform from [Releases](https://github.com/nicodevvv/dev-password-tool/releases).

- **Windows:** run the `.msi` installer or the `.exe`
- **Linux:** install the `.deb` with `sudo dpkg -i` or run the `.AppImage` directly
- **macOS:** open the `.dmg` and drag the app to Applications

### macOS: "App is damaged and can't be opened"

Since the app is not signed with an Apple Developer certificate, macOS Gatekeeper may block it. This is expected for unsigned apps distributed outside the App Store.

To fix it, open Terminal and run:

```bash
xattr -cr /Applications/Dev\ Password\ Tool.app
```

Then open the app normally.

## Running Tests

```bash
cd src-tauri
cargo test
```

## Performance

- **Startup**: < 200ms
- **Binary size**: ~5-8 MB (release, with LTO + strip)
- **Memory**: ~20-30 MB at runtime
- **No Electron** — uses system WebView via Tauri

## License

MIT
