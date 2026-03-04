import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1
          className="mt-4 text-xl font-bold"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-6">
          <Link href="/">
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </Button>
      </main>
    </div>
  );
}
