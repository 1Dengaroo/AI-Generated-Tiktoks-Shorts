import { NextResponse } from "next/server";
import { s3Storage } from "@/lib/video/storage";

export const revalidate = 300;

export async function GET() {
  try {
    const [fullVideos, previewVideos] = await Promise.all([
      s3Storage.list("gameplay"),
      s3Storage.list("gameplay-previews"),
    ]);

    const previewMap = new Map(previewVideos.map((p) => [p.name, p.url]));

    const videos = fullVideos.map((v) => ({
      name: v.name,
      url: v.url,
      previewUrl: previewMap.get(v.name) || v.url,
    }));

    return NextResponse.json({ videos });
  } catch (err) {
    console.error("Video listing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list videos" },
      { status: 500 },
    );
  }
}
