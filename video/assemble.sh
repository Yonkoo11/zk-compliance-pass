#!/usr/bin/env zsh
setopt +o nomatch

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSITES_DIR="$SCRIPT_DIR/composites"
AUDIO_DIR="$SCRIPT_DIR/audio"
MUSIC="$SCRIPT_DIR/music/bg.mp3"
SEGMENTS_DIR="$SCRIPT_DIR/segments"
OUTPUT="$SCRIPT_DIR/zkgate-demo.mp4"

mkdir -p "$SEGMENTS_DIR"
rm -f "$SEGMENTS_DIR"/*.mp4

# Timing constants
VFADE_IN=0.2
AUDIO_DELAY=0.5
BREATH=0.3
VFADE_OUT=0.2
GAP=0.3

CLIPS=(01-hook 02-connect 03-problem 04-kyc 05-proving 06-compliant 07-close)

echo "=== Building segments ==="

for clip in "${CLIPS[@]}"; do
  FRAME="$COMPOSITES_DIR/$clip.png"
  AUDIO="$AUDIO_DIR/$clip.mp3"
  SEG="$SEGMENTS_DIR/$clip.mp4"

  if [[ ! -f "$FRAME" ]] || [[ ! -f "$AUDIO" ]]; then
    echo "SKIP: $clip (missing frame or audio)"
    continue
  fi

  # Get audio duration
  ADUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO")

  # Total segment duration
  TOTAL=$(echo "$AUDIO_DELAY + $ADUR + $BREATH + $VFADE_OUT" | bc)
  FO_START=$(echo "$TOTAL - $VFADE_OUT" | bc)
  AFO_START=$(echo "$AUDIO_DELAY + $ADUR - 0.25" | bc)

  echo "Building $clip: audio=${ADUR}s total=${TOTAL}s"

  ffmpeg -y \
    -loop 1 -i "$FRAME" \
    -i "$AUDIO" \
    -filter_complex "
      anullsrc=r=44100:cl=stereo,atrim=0:${AUDIO_DELAY}[silence];
      [silence][1:a]concat=n=2:v=0:a=1[joined];
      [joined]afade=t=in:st=${AUDIO_DELAY}:d=0.15,afade=t=out:st=${AFO_START}:d=0.25,apad=whole_dur=${TOTAL}[a];
      [0:v]scale=1920:1080,fade=t=in:st=0:d=${VFADE_IN},fade=t=out:st=${FO_START}:d=${VFADE_OUT}[v]
    " \
    -map "[v]" -map "[a]" \
    -t "$TOTAL" \
    -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p \
    -c:a aac -b:a 128k \
    -r 30 "$SEG" 2>/dev/null

  if [[ $? -eq 0 ]]; then
    echo "OK: $clip"
  else
    echo "FAIL: $clip"
    exit 1
  fi
done

# Create black gap segment
echo "Creating gap segment..."
ffmpeg -y -f lavfi -i "color=black:s=1920x1080:d=${GAP}:r=30" \
  -f lavfi -i "anullsrc=r=44100:cl=stereo" \
  -t "$GAP" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p \
  -c:a aac -b:a 128k "$SEGMENTS_DIR/gap.mp4" 2>/dev/null

# Build concat list
echo "=== Assembling final video ==="
CONCAT_FILE="$SEGMENTS_DIR/concat.txt"
rm -f "$CONCAT_FILE"

for i in {1..${#CLIPS}}; do
  clip="${CLIPS[$i]}"
  echo "file '${SEGMENTS_DIR}/$clip.mp4'" >> "$CONCAT_FILE"
  if [[ $i -lt ${#CLIPS} ]]; then
    echo "file '${SEGMENTS_DIR}/gap.mp4'" >> "$CONCAT_FILE"
  fi
done

# Concat with re-encode (not -c copy, prevents drift)
NOMUSIC="$SCRIPT_DIR/zkgate-nomusic.mp4"
ffmpeg -y -f concat -safe 0 -i "$CONCAT_FILE" \
  -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p \
  -c:a aac -b:a 128k "$NOMUSIC" 2>/dev/null

echo "Assembled without music: $NOMUSIC"

# Mix with background music
if [[ -f "$MUSIC" ]]; then
  echo "Mixing background music..."
  VID_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$NOMUSIC")

  ffmpeg -y -i "$NOMUSIC" -i "$MUSIC" \
    -filter_complex "
      [1:a]atrim=0:${VID_DUR},afade=t=in:st=0:d=1,afade=t=out:st=$(echo "$VID_DUR - 2" | bc):d=2,volume=0.12[music];
      [0:a][music]amix=inputs=2:duration=first:dropout_transition=2[a]
    " \
    -map "0:v" -map "[a]" \
    -c:v copy -c:a aac -b:a 128k "$OUTPUT" 2>/dev/null

  echo "Final video with music: $OUTPUT"
  rm -f "$NOMUSIC"
else
  mv "$NOMUSIC" "$OUTPUT"
  echo "Final video (no music): $OUTPUT"
fi

# Color grade
echo "Applying color grade..."
GRADED="$SCRIPT_DIR/zkgate-demo-graded.mp4"
ffmpeg -y -i "$OUTPUT" \
  -vf "eq=contrast=1.05:saturation=1.08:brightness=0.02" \
  -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p \
  -c:a copy "$GRADED" 2>/dev/null

if [[ -f "$GRADED" ]]; then
  mv "$GRADED" "$OUTPUT"
  echo "Color grading applied."
fi

# Final stats
FINAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT")
FINAL_SIZE=$(du -h "$OUTPUT" | cut -f1)
echo ""
echo "=== DONE ==="
echo "Output: $OUTPUT"
echo "Duration: ${FINAL_DUR}s"
echo "Size: $FINAL_SIZE"
