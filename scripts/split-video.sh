#!/bin/bash
# Splits a video into 1-minute chunks using ffmpeg
# Usage: ./scripts/split-video.sh

INPUT="/mnt/c/Users/adeng/OneDrive/Desktop/gameplay/mc-parkour.mp4"
OUTPUT_DIR="/mnt/c/Users/adeng/OneDrive/Desktop/gameplay/chunks"

mkdir -p "$OUTPUT_DIR"

ffmpeg -i "$INPUT" -c copy -map 0 -segment_time 60 -f segment -reset_timestamps 1 "$OUTPUT_DIR/mc-parkour-%03d.mp4"

echo "Done! Chunks saved to $OUTPUT_DIR"
