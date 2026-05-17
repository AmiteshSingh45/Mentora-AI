import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/chat(.*)",
  "/pdf(.*)",
  "/quiz(.*)",
  "/notes(.*)",
  "/voice(.*)",
  "/analytics(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
  "/admin(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/about",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect app routes — redirect to sign-in if not authenticated
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Allow all public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
