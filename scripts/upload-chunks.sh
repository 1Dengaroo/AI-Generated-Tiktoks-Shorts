#!/bin/bash
# Uploads all video chunks to S3 and clears the chunks directory
# Usage: ./scripts/upload-chunks.sh

CHUNKS_DIR="/mnt/c/Users/adeng/OneDrive/Desktop/gameplay/chunks"
S3_BUCKET="amzn-deng-stories"
S3_PREFIX="gameplay"
AWS_REGION="us-east-2"

if [ -z "$(ls -A "$CHUNKS_DIR" 2>/dev/null)" ]; then
  echo "No files found in $CHUNKS_DIR"
  exit 1
fi

echo "Uploading chunks to s3://$S3_BUCKET/$S3_PREFIX/ ..."

aws s3 cp "$CHUNKS_DIR/" "s3://$S3_BUCKET/$S3_PREFIX/" --recursive --region "$AWS_REGION"

if [ $? -eq 0 ]; then
  echo "Upload complete. Clearing chunks directory..."
  rm -f "$CHUNKS_DIR"/*
  echo "Done!"
else
  echo "Upload failed. Chunks not deleted."
  exit 1
fi
