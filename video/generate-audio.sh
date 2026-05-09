#!/usr/bin/env zsh
setopt +o nomatch

AUDIO_DIR="$(dirname "$0")/audio"
mkdir -p "$AUDIO_DIR"

VOICE_ID="nPczCjzI2devNBz1zQrb"
MODEL="eleven_multilingual_v2"

typeset -A clips
clips=(
  [01-hook]="So this just generated a ZK proof right in the browser, and it's about to verify on HashKey Chain. The person submitting it stays completely anonymous."
  [02-connect]="Here's the problem. HashKey Chain has built-in KYC through soul-bound tokens. But if a DeFi protocol reads your SBT, it sees everything. Your name, your level, when you verified."
  [03-problem]="So anyone watching the chain can connect your trading wallet back to your real identity. You're compliant, but you've lost all privacy."
  [04-kyc]="zkGate separates the two. It reads your KYC credential, builds a Merkle proof of membership, and generates a zero-knowledge proof that you pass the threshold. Your wallet address and exact level never leave the browser."
  [05-proving]="Everything happens client-side. Noir compiles the circuit, Barretenberg generates a 16 kilobyte UltraHonk proof. There's no server involved."
  [06-compliant]="You submit the proof from whatever wallet you want. The on-chain verifier checks it, marks you compliant, and now you can deposit into this gated vault. There's zero connection to your KYC wallet."
  [07-close]="That's zkGate. Try it at the link on screen."
)

for clip in 01-hook 02-connect 03-problem 04-kyc 05-proving 06-compliant 07-close; do
  OUT="$AUDIO_DIR/$clip.mp3"
  if [[ -f "$OUT" ]]; then
    echo "SKIP: $clip (exists)"
    continue
  fi

  TEXT="${clips[$clip]}"
  echo "Generating: $clip"

  curl -s "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"text\": \"$TEXT\",
      \"model_id\": \"$MODEL\",
      \"voice_settings\": {
        \"stability\": 0.82,
        \"similarity_boost\": 0.65,
        \"style\": 0.03
      }
    }" -o "$OUT"

  if file "$OUT" | grep -q "JSON\|text\|XML"; then
    echo "ERROR: $clip returned non-audio"
    cat "$OUT"
    rm "$OUT"
    exit 1
  fi

  echo "OK: $clip ($(wc -c < "$OUT" | tr -d ' ') bytes)"
  sleep 1
done

echo "All audio clips generated."
