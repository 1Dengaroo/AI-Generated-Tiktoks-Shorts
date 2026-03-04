import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { renderMediaOnLambda } from "@remotion/lambda/client";
import { auth } from "@clerk/nextjs/server";
import { renderRequestSchema } from "@/lib/render/render-schema";
import { getLambdaConfig } from "@/lib/render/lambda-config";
import { getErrorMessage } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = renderRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { compositionProps } = parsed.data;
    const { region, functionName, serveUrl } = getLambdaConfig();

    const outName = `${userId}/${uuidv4()}.mp4`;

    const { renderId, bucketName } = await renderMediaOnLambda({
      region,
      functionName,
      composition: "StoryVideo",
      serveUrl,
      codec: "h264",
      inputProps: compositionProps,
      forceWidth: 1080,
      forceHeight: 1920,
      forceFps: 30,
      forceDurationInFrames: compositionProps.durationInFrames,
      outName,
    });

    return NextResponse.json({ renderId, bucketName });
  } catch (err) {
    console.error("Render start error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to start render") },
      { status: 500 },
    );
  }
}
