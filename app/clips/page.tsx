import { auth } from "@clerk/nextjs/server";
import { s3Storage } from "@/lib/video/storage";
import { Header } from "@/components/Header";
import { ClipsGrid } from "@/components/clips/ClipsGrid";
import { ClipsSignedOut } from "@/components/clips/ClipsSignedOut";

export default async function ClipsPage() {
  const { userId } = await auth();
  const clips = userId ? await s3Storage.list(`renders/${userId}`) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {userId ? <ClipsGrid clips={clips} /> : <ClipsSignedOut />}
      </main>
    </div>
  );
}
