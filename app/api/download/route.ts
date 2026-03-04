import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const BUCKET = process.env.AWS_S3_BUCKET ?? "";

/** Only allow URLs pointing at our own S3 bucket. */
function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return false;
    // Virtual-hosted: <bucket>.s3.<region>.amazonaws.com
    // Path-style:     s3.<region>.amazonaws.com/<bucket>
    if (parsed.hostname.includes(".amazonaws.com")) {
      return (
        parsed.hostname.startsWith(`${BUCKET}.`) ||
        parsed.pathname.startsWith(`/${BUCKET}/`)
      );
    }
    return false;
  } catch {
    return false;
  }
}

/** Strip characters that could break Content-Disposition headers. */
function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.\-]/g, "_");
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  const name = sanitizeFilename(
    req.nextUrl.searchParams.get("name") || "video.mp4",
  );

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: upstream.status },
    );
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "video/mp4",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Length": upstream.headers.get("Content-Length") || "",
    },
  });
}
