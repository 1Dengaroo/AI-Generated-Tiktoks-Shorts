import { NextResponse } from "next/server";
import { getRenderProgress } from "@remotion/lambda/client";
import { getLambdaConfig } from "@/lib/render/lambda-config";
import { getErrorMessage } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId: renderId } = await params;
  const url = new URL(request.url);
  const bucketName = url.searchParams.get("bucketName");

  if (!bucketName) {
    return NextResponse.json(
      { error: "Missing bucketName query param" },
      { status: 400 },
    );
  }

  const { region, functionName } = getLambdaConfig();

  try {
    const progress = await getRenderProgress({
      renderId,
      bucketName,
      functionName,
      region,
    });

    return NextResponse.json({
      job: {
        id: renderId,
        status: progress.done
          ? "done"
          : progress.fatalErrorEncountered
            ? "error"
            : "rendering",
        progress: Math.round(progress.overallProgress * 100),
        outputUrl: progress.outputFile ?? null,
        error: progress.fatalErrorEncountered
          ? progress.errors.map((e) => e.message).join(" | ") ||
            "Unknown render error"
          : null,
      },
    });
  } catch (err) {
    const errStr = String(err);
    const isRateLimit =
      errStr.includes("TooManyRequestsException") ||
      errStr.includes("Rate Exceeded") ||
      errStr.includes("ConcurrentInvocationLimitExceeded");
    if (isRateLimit) {
      return NextResponse.json(
        {
          job: {
            id: renderId,
            status: "rendering",
            progress: 0,
            outputUrl: null,
            error: null,
          },
        },
        { status: 200 },
      );
    }
    console.error("Render progress error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to get render progress") },
      { status: 500 },
    );
  }
}
