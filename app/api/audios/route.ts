import { NextResponse } from "next/server";
import { s3Storage } from "@/lib/video/storage";

export const revalidate = 300;

export async function GET() {
  try {
    const audios = await s3Storage.list("audios");

    return NextResponse.json({ audios });
  } catch (err) {
    console.error("Audio listing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list audios" },
      { status: 500 },
    );
  }
}
