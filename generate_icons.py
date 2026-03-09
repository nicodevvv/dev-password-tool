"""Generate all required Tauri app icons from the source SVG."""
import cairosvg
import struct
import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SVG = os.path.join(PROJECT_ROOT, "icono.svg")
ICONS_DIR = os.path.join(PROJECT_ROOT, "src-tauri", "icons")

SIZES = {
    "32x32.png": 32,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "icon.png": 512,
}

os.makedirs(ICONS_DIR, exist_ok=True)

# Generate PNGs
for name, size in SIZES.items():
    out = os.path.join(ICONS_DIR, name)
    cairosvg.svg2png(url=SVG, write_to=out, output_width=size, output_height=size)
    print(f"  Created {out} ({size}x{size})")

# Generate ICO (Windows) from multiple PNG sizes
ico_sizes = [16, 24, 32, 48, 64, 256]
ico_images = []
for s in ico_sizes:
    png_data = cairosvg.svg2png(url=SVG, output_width=s, output_height=s)
    ico_images.append(png_data)

header = struct.pack('<HHH', 0, 1, len(ico_images))
entries = b''
data = b''
offset = 6 + len(ico_images) * 16

for i, img in enumerate(ico_images):
    s = ico_sizes[i]
    w = 0 if s >= 256 else s
    h = 0 if s >= 256 else s
    entries += struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, len(img), offset)
    offset += len(img)
    data += img

ico_path = os.path.join(ICONS_DIR, "icon.ico")
with open(ico_path, 'wb') as f:
    f.write(header + entries + data)
print(f"  Created {ico_path}")

# Generate ICNS (macOS) using iconutil
import subprocess, tempfile, shutil

iconset_dir = tempfile.mkdtemp(suffix=".iconset")
icns_sizes = {
    "icon_16x16.png": 16,
    "icon_16x16@2x.png": 32,
    "icon_32x32.png": 32,
    "icon_32x32@2x.png": 64,
    "icon_128x128.png": 128,
    "icon_128x128@2x.png": 256,
    "icon_256x256.png": 256,
    "icon_256x256@2x.png": 512,
    "icon_512x512.png": 512,
}

for name, size in icns_sizes.items():
    out = os.path.join(iconset_dir, name)
    cairosvg.svg2png(url=SVG, write_to=out, output_width=size, output_height=size)

icns_path = os.path.join(ICONS_DIR, "icon.icns")
subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", icns_path], check=True)
shutil.rmtree(iconset_dir)
print(f"  Created {icns_path}")

print("\nAll icons generated successfully!")
