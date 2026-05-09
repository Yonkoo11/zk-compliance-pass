#!/usr/bin/env python3
"""Generate a terminal-style frame showing the KYC privacy problem."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1920, 1080
BG = (10, 10, 15)
SURFACE = (20, 20, 32)
GREEN = (0, 212, 170)
RED = (239, 68, 68)
PURPLE = (124, 110, 240)
WHITE = (232, 232, 237)
GRAY = (139, 139, 158)
MUTED = (85, 85, 106)

# Find a monospace font
FONT_CANDIDATES = [
    "/System/Library/Fonts/SFNSMono.ttf",
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Monaco.dfont",
    "/Library/Fonts/SF-Mono-Regular.otf",
]
font_path = None
for fp in FONT_CANDIDATES:
    if os.path.exists(fp):
        font_path = fp
        break

def get_font(size):
    if font_path:
        return ImageFont.truetype(font_path, size)
    return ImageFont.load_default()

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Draw a "terminal" window
term_x, term_y = 200, 80
term_w, term_h = 1520, 920
# Terminal background
draw.rounded_rectangle(
    [term_x, term_y, term_x + term_w, term_y + term_h],
    radius=12, fill=SURFACE, outline=(255, 255, 255, 20)
)
# Title bar
draw.rounded_rectangle(
    [term_x, term_y, term_x + term_w, term_y + 40],
    radius=12, fill=(30, 30, 48)
)
draw.rectangle([term_x, term_y + 28, term_x + term_w, term_y + 40], fill=(30, 30, 48))
# Traffic lights
for i, color in enumerate([(255, 95, 87), (255, 189, 46), (39, 201, 63)]):
    draw.ellipse([term_x + 16 + i * 24, term_y + 12, term_x + 28 + i * 24, term_y + 24], fill=color)

# Title
title_font = get_font(14)
draw.text((term_x + term_w // 2, term_y + 18), "Block Explorer - KYC SBT Query", fill=GRAY, font=title_font, anchor="mm")

# Terminal content
mono = get_font(20)
mono_sm = get_font(16)
y = term_y + 70
lh = 32

lines = [
    (GRAY, "$ cast call 0x5a62...Bfc5 'getKycInfo(address)' 0x018d...72be"),
    (None, ""),
    (MUTED, "  // Response from KYC SBT contract:"),
    (None, ""),
    (WHITE, "  {"),
    (RED, '    ensName:   "alice.hsk"           <-- EXPOSED'),
    (RED, "    kycLevel:  2 (Advanced)          <-- EXPOSED"),
    (RED, "    isHuman:   true                  <-- EXPOSED"),
    (RED, "    timestamp: 1712345678            <-- EXPOSED"),
    (WHITE, "  }"),
    (None, ""),
    (MUTED, "  // Anyone can read this. Your identity is public."),
    (None, ""),
    (MUTED, "  -----------------------------------------------"),
    (None, ""),
    (GRAY, "$ # With zkGate:"),
    (None, ""),
    (GREEN, "  Proof submitted from 0x7f3a...9e21 (anonymous wallet)"),
    (GREEN, "  Verifier result: COMPLIANT"),
    (GREEN, '  Identity revealed: NONE'),
    (GREEN, '  KYC level revealed: NONE'),
    (GREEN, '  ENS name revealed: NONE'),
]

for color, text in lines:
    if color is None:
        y += lh // 2
        continue
    draw.text((term_x + 30, y), text, fill=color, font=mono)
    y += lh

out = os.path.join(os.path.dirname(__file__), "frames", "03-problem.png")
img.save(out)
print(f"Generated {out}")
