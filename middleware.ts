import { clerkMiddleware } from "@clerk/nextjs/server";
import { applyRateLimit } from "@/lib/api/rate-limit";

export default clerkMiddleware(async (_auth, req) => {
  // Rate-limit expensive API routes before any further processing
  const rateLimited = applyRateLimit(req);
  if (rateLimited) return rateLimited;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
