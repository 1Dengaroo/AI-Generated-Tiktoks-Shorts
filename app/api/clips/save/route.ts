import { NextResponse, after } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { copyInS3, s3KeyFromUrl, uploadToS3 } from "@/lib/video/storage";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { outputUrl, sourceBucket } = await req.json();
  if (!outputUrl || typeof outputUrl !== "string") {
    return NextResponse.json(
      { error: "outputUrl is required" },
      { status: 400 },
    );
  }

  const destKey = `renders/${userId}/${uuidv4()}.mp4`;

  // Run the S3 work after the response is sent so the client isn't blocked
  after(async () => {
    try {
      const sourceKey = s3KeyFromUrl(outputUrl, sourceBucket);
      if (sourceKey) {
        await copyInS3(sourceKey, destKey, sourceBucket);
      } else {
        const response = await fetch(outputUrl);
        if (!response.ok) return;
        const buffer = Buffer.from(await response.arrayBuffer());
        await uploadToS3(destKey, buffer);
      }
    } catch (err) {
      console.error("Failed to save clip:", err);
    }
  });

  return NextResponse.json({ key: destKey });
}
