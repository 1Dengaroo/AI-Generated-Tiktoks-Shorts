import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const PREVIEW_DURATION = 10;
const PREVIEW_PREFIX = "gameplay-previews/";
const SOURCE_PREFIX = "gameplay/";

async function main() {
  const region = process.env.AWS_REGION || "us-east-2";
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    console.error("AWS_S3_BUCKET is required");
    process.exit(1);
  }

  const client = new S3Client({ region });

  // List all gameplay videos
  const listRes = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: SOURCE_PREFIX }),
  );

  const videos = (listRes.Contents || []).filter(
    (obj) => obj.Key && !obj.Key.endsWith("/"),
  );

  if (videos.length === 0) {
    console.log("No gameplay videos found in S3.");
    return;
  }

  console.log(`Found ${videos.length} gameplay video(s).`);

  for (const obj of videos) {
    const key = obj.Key!;
    const filename = key.split("/").pop()!;
    const previewKey = `${PREVIEW_PREFIX}${filename}`;

    // Check if preview already exists
    try {
      await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: previewKey }),
      );
      console.log(`Preview already exists: ${previewKey}, skipping.`);
      continue;
    } catch {
      // Doesn't exist, generate it
    }

    console.log(`Generating preview for: ${key}`);

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `source-${filename}`);
    const outputPath = path.join(tmpDir, `preview-${filename}`);

    // Download source from S3
    const getRes = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const stream = getRes.Body as AsyncIterable<Uint8Array>;
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    fs.writeFileSync(inputPath, Buffer.concat(chunks));

    // Generate preview with ffmpeg
    try {
      execSync(
        `ffmpeg -y -i "${inputPath}" -t ${PREVIEW_DURATION} -vf "scale=540:960" -c:v libx264 -preset fast -crf 28 -an "${outputPath}"`,
        { stdio: "pipe" },
      );
    } catch (err) {
      console.error(`ffmpeg failed for ${key}:`, err);
      fs.unlinkSync(inputPath);
      continue;
    }

    // Upload preview to S3
    const previewBuffer = fs.readFileSync(outputPath);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: previewKey,
        Body: previewBuffer,
        ContentType: "video/mp4",
      }),
    );

    console.log(
      `Uploaded preview: ${previewKey} (${(previewBuffer.length / 1024 / 1024).toFixed(1)}MB)`,
    );

    // Clean up temp files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Preview generation failed:", err);
  process.exit(1);
});
