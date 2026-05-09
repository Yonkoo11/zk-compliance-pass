#!/usr/bin/env python3
"""Composite subtitle text onto video frames."""
import os
from PIL import Image, ImageDraw, ImageFont

FRAMES_DIR = os.path.join(os.path.dirname(__file__), "frames")
COMPOSITES_DIR = os.path.join(os.path.dirname(__file__), "composites")
os.makedirs(COMPOSITES_DIR, exist_ok=True)

# Must match VOICEOVER_CLIPS.md v2 and generate-audio.sh EXACTLY
clips = {
    "01-hook": "So this just generated a ZK proof right in the browser,\nand it's about to verify on HashKey Chain.\nThe person submitting it stays completely anonymous.",
    "02-connect": "Here's the problem. HashKey Chain has built-in KYC\nthrough soul-bound tokens. But if a DeFi protocol reads\nyour SBT, it sees everything.",
    "03-problem": "So anyone watching the chain can connect your trading\nwallet back to your real identity. You're compliant,\nbut you've lost all privacy.",
    "04-kyc": "zkGate separates the two. It reads your KYC credential,\nbuilds a Merkle proof, and generates a zero-knowledge proof\nthat you pass the threshold.",
    "05-proving": "Everything happens client-side. Noir compiles the circuit,\nBarretenberg generates a 16 kilobyte UltraHonk proof.\nThere's no server involved.",
    "06-compliant": "You submit the proof from whatever wallet you want.\nThe on-chain verifier checks it, marks you compliant,\nand now you can deposit into this gated vault.",
    "07-close": "That's zkGate. Try it at the link on screen.",
}

FONT_CANDIDATES = [
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/SFNS.ttf",
    "/Library/Fonts/Arial.ttf",
]
font_path = None
for fp in FONT_CANDIDATES:
    if os.path.exists(fp):
        font_path = fp
        break

font = ImageFont.truetype(font_path, 32) if font_path else ImageFont.load_default()

for clip_name, text in clips.items():
    frame_path = os.path.join(FRAMES_DIR, f"{clip_name}.png")
    if not os.path.exists(frame_path):
        print(f"SKIP: {clip_name} (no frame)")
        continue

    img = Image.open(frame_path).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    lines = text.split("\n")
    line_height = 42
    total_text_height = len(lines) * line_height
    padding = 20
    margin_x = 160

    box_w = img.width - 2 * margin_x
    box_h = total_text_height + 2 * padding
    box_x = margin_x
    box_y = img.height - box_h - 60

    draw.rounded_rectangle(
        [box_x, box_y, box_x + box_w, box_y + box_h],
        radius=12,
        fill=(0, 0, 0, 140)
    )

    y = box_y + padding
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        text_w = bbox[2] - bbox[0]
        x = box_x + (box_w - text_w) // 2
        draw.text((x, y), line, fill=(255, 255, 255, 240), font=font)
        y += line_height

    result = Image.alpha_composite(img, overlay).convert("RGB")
    out_path = os.path.join(COMPOSITES_DIR, f"{clip_name}.png")
    result.save(out_path)
    print(f"OK: {clip_name}")

print("All composites generated.")
