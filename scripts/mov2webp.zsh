#!/usr/bin/env zsh
# mov2webp.zsh — convert a .mov (or any video) into an optimized animated WebP
# deps: ffmpeg (required)
#
# Examples:
#   ./mov2webp.zsh in.mov
#   ./mov2webp.zsh in.mov -o out.webp -r 15 -w 960 -q 70 --method 6 --loop 0
#   ./mov2webp.zsh in.mov -s 2.0 -t 4.5 -r 12 -w 800 --lossless
#   ./mov2webp.zsh in.mov --max-bytes 1500000 -r 12 -w 800 -q 85   # rough size targeting

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  mov2webp.zsh <input> [options]

Output:
  -o, --output <path>        Output .webp (default: <input_basename>.webp)

Trim:
  -s, --start <sec>          Start time (seconds, or ffmpeg time like 00:00:02.5)
  -t, --duration <sec>       Duration (seconds)
  -e, --end <sec>            End time (seconds). Mutually exclusive with --duration.

Animation:
  -r, --fps <n>              Output FPS (default: 15)
      --dedupe               Drop near-duplicate frames (mpdecimate); helps for screen recordings

Scale:
  -w, --width <px>           Target width (keeps aspect; forces even)
  -H, --height <px>          Target height (keeps aspect; forces even)
      --scale <factor>       Scale factor (e.g. 0.5). Ignored if width/height set.

Encoding:
  -q, --quality <0-100>      Lossy quality (default: 75)
      --lossless             Lossless mode
      --preset <name>        default|picture|photo|drawing|icon|text (default: picture)
      --method <0-6>         Compression method / effort (default: 6)
      --loop <n>             Loop count (0 = infinite) (default: 0)

Size targeting (best-effort):
      --max-bytes <n>        Try to fit under N bytes by adapting quality downward (lossy only)

Other:
      --no-metadata          Strip metadata (default: on)
      --keep-metadata        Keep metadata
      --dry-run              Print ffmpeg command only
  -h, --help                 Show help

Notes:
- For best visual quality at small sizes: reduce FPS and dimensions before crushing quality.
- Animated WebP can be CPU-heavy; method 6 is slowest/best compression.
EOF
}

need() { command -v "$1" >/dev/null 2>&1 || { print -u2 "Missing dependency: $1"; exit 127; } }
need ffmpeg

# Defaults
typeset input=""
typeset output=""
typeset start=""
typeset duration=""
typeset end=""
typeset -i fps=15
typeset -i width=0
typeset -i height=0
typeset scale_factor=""
typeset -i quality=75
typeset lossless="0"
typeset preset="picture"
typeset -i method=6
typeset -i loop=0
typeset strip_meta="1"
typeset dry_run="0"
typeset dedupe="0"
typeset -i max_bytes=0

# Parse args
zmodload zsh/zutil

typeset -a OPTS
zparseopts -D -E -F -a OPTS \
  h=help -help=help \
  o:=out -output:=out \
  s:=startopt -start:=startopt \
  t:=duropt -duration:=duropt \
  e:=endopt -end:=endopt \
  r:=fpsopt -fps:=fpsopt \
  w:=wopt -width:=wopt \
  H:=hopt -height:=hopt \
  -scale:=scopt \
  q:=qopt -quality:=qopt \
  -lossless=losslessopt \
  -preset:=presetopt \
  -method:=methodopt \
  -loop:=loopopt \
  -no-metadata=nometaopt \
  -keep-metadata=keepmetaopt \
  -dry-run=dryopt \
  -dedupe=dedupeopt \
  -max-bytes:=maxbytesopt

(( ${#help} )) && { usage; exit 0; }

# Input: first non-option argument (after zparseopts has stripped recognized options)
# Note: zparseopts leaves unknown options in $@; we treat the first non-dash token as input.
for a in "$@"; do
  [[ "$a" == -- ]] && continue
  [[ "$a" == -* ]] && continue
  input="$a"
  break
done

[[ -z "$input" ]] && { print -u2 "No input provided."; usage; exit 2; }
[[ ! -f "$input" ]] && { print -u2 "Input not found: $input"; exit 2; }

# Apply parsed options
(( ${#out} )) && output="${out[-1]}"
(( ${#startopt} )) && start="${startopt[-1]}"
(( ${#duropt} )) && duration="${duropt[-1]}"
(( ${#endopt} )) && end="${endopt[-1]}"
(( ${#fpsopt} )) && fps="${fpsopt[-1]}"
(( ${#wopt} )) && width="${wopt[-1]}"
(( ${#hopt} )) && height="${hopt[-1]}"
(( ${#scopt} )) && scale_factor="${scopt[-1]}"
(( ${#qopt} )) && quality="${qopt[-1]}"
(( ${#losslessopt} )) && lossless="1"
(( ${#presetopt} )) && preset="${presetopt[-1]}"
(( ${#methodopt} )) && method="${methodopt[-1]}"
(( ${#loopopt} )) && loop="${loopopt[-1]}"
(( ${#nometaopt} )) && strip_meta="1"
(( ${#keepmetaopt} )) && strip_meta="0"
(( ${#dryopt} )) && dry_run="1"
(( ${#dedupeopt} )) && dedupe="1"
(( ${#maxbytesopt} )) && max_bytes="${maxbytesopt[-1]}"

# Validate mutual exclusivity
if [[ -n "$duration" && -n "$end" ]]; then
  print -u2 "--duration and --end are mutually exclusive."
  exit 2
fi

# Default output
if [[ -z "$output" ]]; then
  local base="${input:t}"
  base="${base%.*}"
  output="${base}.webp"
fi

# Build filter chain
typeset -a vf
vf+=("fps=${fps}")

# Optional dedupe (drop duplicates)
# Note: mpdecimate needs setpts to keep monotonic timestamps after drops.
if (( dedupe )); then
  vf+=("mpdecimate")
  vf+=("setpts=N/FRAME_RATE/TB")
fi

# Scaling (force even dims for best encoder compatibility)
if (( width > 0 && height > 0 )); then
  vf+=("scale=${width}:${height}:flags=lanczos")
elif (( width > 0 )); then
  vf+=("scale=${width}:-2:flags=lanczos")
elif (( height > 0 )); then
  vf+=("scale=-2:${height}:flags=lanczos")
elif [[ -n "$scale_factor" ]]; then
  vf+=("scale=trunc(iw*${scale_factor}/2)*2:trunc(ih*${scale_factor}/2)*2:flags=lanczos")
fi

typeset vf_arg=""
if (( ${#vf} > 0 )); then
  vf_arg="${(j:,:)vf}"   # join with literal comma
fi

# Trim args
typeset -a trim_pre trim_post
if [[ -n "$start" ]]; then
  trim_pre+=(-ss "$start")
fi
if [[ -n "$duration" ]]; then
  trim_post+=(-t "$duration")
elif [[ -n "$end" ]]; then
  trim_post+=(-to "$end")
fi

# Metadata stripping
typeset -a meta_args
if (( strip_meta )); then
  meta_args+=(-map_metadata -1 -map_chapters -1)
fi

# Encoder args
typeset -a enc
enc+=(-an -sn)                 # no audio/subs
enc+=(-c:v libwebp)
enc+=(-preset "$preset")
enc+=(-loop "$loop")
enc+=(-compression_level "$method")

if (( lossless )); then
  enc+=(-lossless 1)
  enc+=(-q:v 100)              # harmless in lossless
else
  enc+=(-lossless 0)
  enc+=(-q:v "$quality")
fi

run_ffmpeg() {
  local qv="$1"
  local -a cmd
  cmd=(ffmpeg -hide_banner -y)
  cmd+=("${trim_pre[@]}")
  cmd+=(-i "$input")
  cmd+=("${trim_post[@]}")
  cmd+=("${meta_args[@]}")

  if (( ${#vf_arg} )); then
    cmd+=(-vf "$vf_arg")
  fi

  cmd+=("${enc[@]}")

  # If lossy and iterating quality, append a later -q:v (ffmpeg uses the last)
  if (( lossless == 0 )); then
    cmd+=(-q:v "$qv")
  fi

  cmd+=("$output")

  if (( dry_run )); then
    print -r -- "${cmd[@]}"
    return 0
  fi

  "${cmd[@]}"
}

# Dry-run
if (( dry_run )); then
  run_ffmpeg "$quality"
  exit 0
fi

# Optional size targeting (best-effort, lossy only)
if (( max_bytes > 0 && lossless == 0 )); then
  typeset -i q_try=$quality
  typeset -i q_min=30
  typeset -i step=6

  while true; do
    run_ffmpeg "$q_try"

    local -i size
    size=$(stat -c%s -- "$output" 2>/dev/null || stat -f%z -- "$output")
    if (( size <= max_bytes )); then
      print -u2 "OK: ${size} bytes (<= ${max_bytes}) at quality=${q_try}"
      break
    fi
    if (( q_try <= q_min )); then
      print -u2 "Could not reach <= ${max_bytes} bytes (last: ${size} bytes at quality=${q_try})."
      break
    fi
    q_try=$(( q_try - step ))
  done

  exit 0
fi

# Single-shot encode
run_ffmpeg "$quality"
