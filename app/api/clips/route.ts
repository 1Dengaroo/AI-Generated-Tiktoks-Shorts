import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { s3Storage } from "@/lib/video/storage";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clips = await s3Storage.list(`renders/${userId}`);
  return NextResponse.json(clips);
}
